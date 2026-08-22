import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/user";
import Customer from "../models/Customer";
import Business from "../models/Business";
import { OfficialRole, USER_ROLES, normalizeRole } from "../constants/roles";

export interface AuthUser {
  userId: string;
  role: OfficialRole;
  businessId?: string;
  customerId?: string;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

interface JwtPayload {
  userId: string;
  role: string;
}

export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
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
    const decoded = jwt.verify(token, jwtSecret) as JwtPayload;

    // 5. Validate payload schema
    if (
      !decoded ||
      typeof decoded !== "object" ||
      !decoded.userId ||
      !decoded.role
    ) {
      res.status(401).json({
        success: false,
        message: "Invalid token payload",
      });
      return;
    }

    // 6. Validate role from token against centralized USER_ROLES
    if (!(USER_ROLES as readonly string[]).includes(decoded.role)) {
      res.status(401).json({
        success: false,
        message: "Invalid user role",
      });
      return;
    }

    // 7. Get current user from database
    const user = await User.findById(decoded.userId).select(
      "_id role businessId customerId isActive"
    );

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

    const normalizedRole = normalizeRole(user.role);
    let customerId = user.customerId?.toString();

    if (normalizedRole === "customer" && !customerId && user.businessId) {
      const linkedCustomer = await Customer.findOne({
        userId: user._id,
        businessId: user.businessId,
        isActive: true,
      }).select("_id");

      customerId = linkedCustomer?._id.toString();
    }

    if (normalizedRole === "customer" && user.businessId) {
      const customerRecord = await Customer.findOne({
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

    if (
      normalizedRole !== "superAdmin" &&
      user.businessId
    ) {
      const business = await Business.findById(user.businessId).select("isActive");

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
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        message: "Token has expired",
      });
      return;
    }

    if (error instanceof jwt.JsonWebTokenError) {
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