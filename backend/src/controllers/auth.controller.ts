import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import User, { IUser } from "../models/user";
import Customer from "../models/Customer";
import Business from "../models/Business";
import { normalizeRole } from "../constants/roles";
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
  customerId: user.customerId,
  isActive: user.isActive,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

// --- Controllers ---

// REGISTER — disabled; customers are created by business owners
export const register = async (
  _req: Request,
  res: Response
): Promise<void> => {
  res.status(403).json({
    success: false,
    message:
      "Public registration is disabled. Contact your business owner to create a customer account.",
  });
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

    if (normalizeRole(user.role) === "customer") {
      const customerRecord = await Customer.findOne({
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

    if (normalizeRole(user.role) !== "superAdmin" && user.businessId) {
      const business = await Business.findById(user.businessId).select("isActive");
      if (!business || !business.isActive) {
        res.status(403).json({
          success: false,
          message: "Your business account has been deactivated",
        });
        return;
      }
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

