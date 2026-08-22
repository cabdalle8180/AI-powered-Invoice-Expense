"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const user_1 = __importDefault(require("../models/user"));
const Customer_1 = __importDefault(require("../models/Customer"));
const Business_1 = __importDefault(require("../models/Business"));
const roles_1 = require("../constants/roles");
const generateToken_1 = __importDefault(require("../utils/generateToken"));
// --- Helpers ---
// Validates string payloads
const isNonEmptyString = (val) => {
    return typeof val === "string" && val.trim().length > 0;
};
// Centralizes the user response payload to keep controllers DRY
const sanitizeUser = (user) => ({
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    businessId: user.businessId,
    customerId: user.customerId,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
});
// --- Controllers ---
// REGISTER — disabled; customers are created by business owners
const register = async (_req, res) => {
    res.status(403).json({
        success: false,
        message: "Public registration is disabled. Contact your business owner to create a customer account.",
    });
};
exports.register = register;
// LOGIN
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!isNonEmptyString(email) || !isNonEmptyString(password)) {
            res.status(400).json({
                success: false,
                message: "Email and password are required",
            });
            return;
        }
        const normalizedEmail = email.trim().toLowerCase();
        // Find user with password included (Requires select: false in schema)
        const user = await user_1.default.findOne({ email: normalizedEmail }).select("+password");
        if (!user) {
            res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
            return;
        }
        if (!user.isActive) {
            res.status(403).json({
                success: false,
                message: "Your account has been deactivated",
            });
            return;
        }
        if ((0, roles_1.normalizeRole)(user.role) === "customer") {
            const customerRecord = await Customer_1.default.findOne({
                userId: user._id,
                businessId: user.businessId,
            });
            if (!customerRecord || !customerRecord.isActive) {
                res.status(403).json({
                    success: false,
                    message: "Your customer account has been deactivated",
                });
                return;
            }
        }
        if ((0, roles_1.normalizeRole)(user.role) !== "superAdmin" && user.businessId) {
            const business = await Business_1.default.findById(user.businessId).select("isActive");
            if (!business || !business.isActive) {
                res.status(403).json({
                    success: false,
                    message: "Your business account has been deactivated",
                });
                return;
            }
        }
        const isPasswordValid = await bcryptjs_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
            return;
        }
        res.status(200).json({
            success: true,
            message: "Login successful",
            data: {
                user: sanitizeUser(user),
                token: (0, generateToken_1.default)(user._id.toString(), user.role),
            },
        });
    }
    catch (error) {
        console.error("Login error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
exports.login = login;
