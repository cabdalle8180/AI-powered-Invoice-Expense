import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import User, { IUser } from "../models/user";
import generateToken from "../utils/generateToken";

// --- Helpers ---

// Validates string payloads
const isNonEmptyString = (val: unknown): val is string => {
  return typeof val === "string" && val.trim().length > 0;
};

// Centralizes the user response payload to keep controllers DRY
const sanitizeUser = (user: IUser) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  businessId: user.businessId,
  isActive: user.isActive,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

// --- Controllers ---

// REGISTER (Public Registration -> CUSTOMER Only)
export const register = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name, email, password, phone } = req.body;

    // 1. Strict Type & Presence Validation
    if (!isNonEmptyString(name) || !isNonEmptyString(email) || !isNonEmptyString(password)) {
      res.status(400).json({
        success: false,
        message: "Name, email and password are required and must be valid strings",
      });
      return;
    }

    const normalizedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();

    // 2. Format checks
    if (normalizedName.length < 2) {
      res.status(400).json({
        success: false,
        message: "Name must be at least 2 characters",
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
      });
      return;
    }

    if (password.length < 8) {
      res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters",
      });
      return;
    }

    // 3. Hash password (10 rounds is optimal for production balance & speed)
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Create user directly
    // Rely on MongoDB Unique Index for race-condition-safe duplicate email check
    const user = await User.create({
      name: normalizedName,
      email: normalizedEmail,
      password: hashedPassword,
      phone: isNonEmptyString(phone) ? phone.trim() : undefined,
      role: "customer", // Enforce customer role
      isActive: true,
    });

    // 5. Generate Token & Respond
    res.status(201).json({
      success: true,
      message: "Account created successfully",
      data: {
        user: sanitizeUser(user),
        token: generateToken(user._id.toString(), user.role),
      },
    });
  } catch (error: unknown) {
    // Catch duplicate email error safely via Database Constraints
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 11000) {
      res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
      return;
    }

    console.error("Register error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


// LOGIN
export const login = async (
  req: Request,
  res: Response
): Promise<void> => {
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
    const user = await User.findOne({ email: normalizedEmail }).select("+password");

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

    const isPasswordValid = await bcrypt.compare(password, user.password);

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
        token: generateToken(user._id.toString(), user.role),
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

