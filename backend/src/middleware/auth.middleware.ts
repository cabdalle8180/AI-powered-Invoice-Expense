import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User, { UserRole, USER_ROLES } from "../models/user";

export interface AuthUser {
  userId: string;
  role: UserRole;
  businessId?: string;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

interface JwtPayload {
  userId: string;
  role: UserRole;
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
    if (!USER_ROLES.includes(decoded.role)) {
      res.status(401).json({
        success: false,
        message: "Invalid user role",
      });
      return;
    }

    // 7. Get current user from database
    const user = await User.findById(decoded.userId).select(
      "_id role businessId isActive"
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

    // 9. Attach database values to request object
    req.user = {
      userId: user._id.toString(),
      role: user.role,
      businessId: user.businessId?.toString(),
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