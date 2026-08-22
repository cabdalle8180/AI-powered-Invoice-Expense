"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_1 = __importDefault(require("../models/user"));
const Customer_1 = __importDefault(require("../models/Customer"));
const Business_1 = __importDefault(require("../models/Business"));
const roles_1 = require("../constants/roles");
const protect = async (req, res, next) => {
    try {
        // 1. Check Authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith("Bearer ")) {
            res.status(401).json({
                success: false,
                message: "Authentication required",
            });
            return;
        }
        // 2. Get JWT secret
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            console.error("JWT_SECRET environment variable is missing");
            res.status(500).json({
                success: false,
                message: "Server configuration error",
            });
            return;
        }
        // 3. Extract token
        const token = authHeader.substring(7).trim();
        if (!token) {
            res.status(401).json({
                success: false,
                message: "Invalid authorization token",
            });
            return;
        }
        // 4. Verify token
        const decoded = jsonwebtoken_1.default.verify(token, jwtSecret);
        // 5. Validate payload schema
        if (!decoded ||
            typeof decoded !== "object" ||
            !decoded.userId ||
            !decoded.role) {
            res.status(401).json({
                success: false,
                message: "Invalid token payload",
            });
            return;
        }
        // 6. Validate role from token against centralized USER_ROLES
        if (!roles_1.USER_ROLES.includes(decoded.role)) {
            res.status(401).json({
                success: false,
                message: "Invalid user role",
            });
            return;
        }
        // 7. Get current user from database
        const user = await user_1.default.findById(decoded.userId).select("_id role businessId customerId isActive");
        if (!user) {
            res.status(401).json({
                success: false,
                message: "User no longer exists",
            });
            return;
        }
        // 8. Check account status
        if (!user.isActive) {
            res.status(403).json({
                success: false,
                message: "Your account has been deactivated",
            });
            return;
        }
        const normalizedRole = (0, roles_1.normalizeRole)(user.role);
        let customerId = user.customerId?.toString();
        if (normalizedRole === "customer" && !customerId && user.businessId) {
            const linkedCustomer = await Customer_1.default.findOne({
                userId: user._id,
                businessId: user.businessId,
                isActive: true,
            }).select("_id");
            customerId = linkedCustomer?._id.toString();
        }
        if (normalizedRole === "customer" && user.businessId) {
            const customerRecord = await Customer_1.default.findOne({
                userId: user._id,
                businessId: user.businessId,
            }).select("isActive");
            if (!customerRecord || !customerRecord.isActive) {
                res.status(403).json({
                    success: false,
                    message: "Your customer account has been deactivated",
                });
                return;
            }
        }
        if (normalizedRole !== "superAdmin" &&
            user.businessId) {
            const business = await Business_1.default.findById(user.businessId).select("isActive");
            if (!business || !business.isActive) {
                res.status(403).json({
                    success: false,
                    message: "Your business account has been deactivated",
                });
                return;
            }
        }
        // 9. Attach database values to request object (normalized role for RBAC)
        req.user = {
            userId: user._id.toString(),
            role: normalizedRole,
            businessId: user.businessId?.toString(),
            customerId,
        };
        // 10. Continue
        next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            res.status(401).json({
                success: false,
                message: "Token has expired",
            });
            return;
        }
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            res.status(401).json({
                success: false,
                message: "Invalid token",
            });
            return;
        }
        console.error("Authentication middleware error:", error);
        res.status(500).json({
            success: false,
            message: "Authentication failed",
        });
    }
};
exports.protect = protect;
