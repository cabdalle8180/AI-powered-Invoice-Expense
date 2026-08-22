import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import User, { IUser } from "../models/user";
import { UserRole, USER_ROLES } from "../constants/roles";
import generateToken from "../utils/generateToken";
import { AuthRequest } from "../middleware/auth.middleware";
import { uploadToCloudinary, deleteFromCloudinary } from "../service/cloudinary.service";

// ============================================================================
// HELPERS
// ============================================================================

const isNonEmptyString = (val: unknown): val is string => {
  return typeof val === "string" && val.trim().length > 0;
};


const isValidObjectId = (id: string): boolean => {
  return mongoose.Types.ObjectId.isValid(id);
};

const sanitizeUser = (user: IUser) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  businessId: user.businessId,
  customerId: user.customerId,
  avatar: user.avatar || null,
  isActive: user.isActive,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

/**
 * @route   POST /api/users/me/avatar
 * @desc    Upload or replace user avatar via Cloudinary
 * @access  Private
 */
export const uploadAvatar = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user?.userId) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }

    if (!req.file) {
      res.status(400).json({ success: false, message: "No file uploaded" });
      return;
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    const oldPublicId = user.avatar?.public_id;

    // 1. Upload new avatar to Cloudinary first
    const result = await uploadToCloudinary(
      req.file.buffer,
      "invoice-tracker/avatars"
    );

    // 2. Save new Cloudinary URL and public ID to DB
    user.avatar = { url: result.url, public_id: result.public_id };
    await user.save();

    // 3. Delete previous Cloudinary image if it exists and differs
    if (oldPublicId && oldPublicId !== result.public_id) {
      await deleteFromCloudinary(oldPublicId);
    }

    // 4. Return updated user information
    res.status(200).json({
      success: true,
      message: "Avatar uploaded successfully",
      data: { user: sanitizeUser(user) },
    });
  } catch (error) {
    console.error("UploadAvatar error:", error);
    res.status(500).json({ success: false, message: "Failed to upload avatar" });
  }
};

/**
 * @route   DELETE /api/users/me/avatar
 * @desc    Remove user avatar from Cloudinary and DB
 * @access  Private
 */
export const deleteAvatar = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user?.userId) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    if (user.avatar?.public_id) {
      await deleteFromCloudinary(user.avatar.public_id);
    }

    user.avatar = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Avatar removed successfully",
      data: { user: sanitizeUser(user) },
    });
  } catch (error) {
    console.error("DeleteAvatar error:", error);
    res.status(500).json({ success: false, message: "Failed to remove avatar" });
  }
};



/**
 * @route   GET /api/users/me
 * @desc    Get current authenticated user profile
 * @access  Private
 */
export const getMe = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user?.userId) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }

    const user = await User.findById(req.user.userId);

    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    if (!user.isActive) {
      res.status(403).json({ success: false, message: "Your account has been deactivated" });
      return;
    }

    res.status(200).json({
      success: true,
      data: { user: sanitizeUser(user) },
    });
  } catch (error) {
    console.error("GetMe error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * @route   PUT /api/users/me
 * @desc    Update current user profile (name, phone)
 * @access  Private
 */
export const updateMe = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user?.userId) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }

    const { name, phone } = req.body;
    const updates: Partial<IUser> = {};

    if (isNonEmptyString(name)) {
      if (name.trim().length < 2) {
        res.status(400).json({ success: false, message: "Name must be at least 2 characters long" });
        return;
      }
      updates.name = name.trim();
    }

    if (phone !== undefined) {
      updates.phone = isNonEmptyString(phone) ? phone.trim() : undefined;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: { user: sanitizeUser(updatedUser) },
    });
  } catch (error) {
    console.error("UpdateMe error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * @route   PUT /api/users/me/password
 * @desc    Update current user's password
 * @access  Private
 */
export const updatePassword = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user?.userId) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }

    const { currentPassword, newPassword } = req.body;

    if (!isNonEmptyString(currentPassword) || !isNonEmptyString(newPassword)) {
      res.status(400).json({
        success: false,
        message: "Current password and new password are required",
      });
      return;
    }

    if (newPassword.length < 8) {
      res.status(400).json({
        success: false,
        message: "New password must be at least 8 characters long",
      });
      return;
    }

    const user = await User.findById(req.user.userId).select("+password");

    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ success: false, message: "Current password is incorrect" });
      return;
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("UpdatePassword error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ============================================================================
// ADMIN & USER MANAGEMENT CONTROLLERS
// ============================================================================

/**
 * @route   POST /api/users
 * @desc    Admin/Owner creates a new user (with role & business assignment)
 * @access  Private (SuperAdmin / Owner)
 */
export const createUser = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { name, email, password, role, businessId, phone } = req.body;

    if (!isNonEmptyString(name) || !isNonEmptyString(email) || !isNonEmptyString(password) || !isNonEmptyString(role)) {
      res.status(400).json({
        success: false,
        message: "Name, email, password, and role are required",
      });
      return;
    }

    if (!USER_ROLES.includes(role as UserRole)) {
      res.status(400).json({ success: false, message: "Invalid role provided" });
      return;
    }

    if (role === "customer") {
      res.status(400).json({
        success: false,
        message: "Customers must be created via POST /api/customers",
      });
      return;
    }

    const currentUserRole = req.user?.role;
    const currentUserBusinessId = req.user?.businessId;

    // RBAC Rules for Creation:
    // 1. Non-superAdmins cannot create superAdmins
    if (role === "superAdmin" && currentUserRole !== "superAdmin") {
      res.status(403).json({ success: false, message: "Only superAdmins can create another superAdmin" });
      return;
    }

    // 2. Business scoping for non-superAdmins
    let assignedBusinessId: string | undefined = businessId;
    if (currentUserRole !== "superAdmin") {
      assignedBusinessId = currentUserBusinessId; // Force non-superAdmins to create within their own business
    }

    if (assignedBusinessId && !isValidObjectId(assignedBusinessId)) {
      res.status(400).json({ success: false, message: "Invalid businessId format" });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      phone: isNonEmptyString(phone) ? phone.trim() : undefined,
      role: role as UserRole,
      businessId: assignedBusinessId ? new mongoose.Types.ObjectId(assignedBusinessId) : undefined,
      isActive: true,
    });

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: { user: sanitizeUser(user) },
    });
  } catch (error: unknown) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === 11000) {
      res.status(409).json({ success: false, message: "User with this email already exists" });
      return;
    }

    console.error("CreateUser error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * @route   GET /api/users
 * @desc    Get paginated list of users (Filtered by role/business tenant)
 * @access  Private (SuperAdmin / Owner / Accountant)
 */
export const getUsers = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string, 10) || 10));
    const skip = (page - 1) * limit;

    const { search, role, isActive } = req.query;

    const filter: Record<string, unknown> = {
      role: { $ne: "customer" },
    };

    // Multi-tenant scoping: Non-superAdmins can only view users in their business
    if (req.user?.role !== "superAdmin") {
      filter.businessId = req.user?.businessId
        ? new mongoose.Types.ObjectId(req.user.businessId)
        : null;
    } else if (req.query.businessId && isNonEmptyString(req.query.businessId as string)) {
      filter.businessId = new mongoose.Types.ObjectId(req.query.businessId as string);
    }

    if (isNonEmptyString(role as string) && USER_ROLES.includes(role as UserRole)) {
      filter.role = role;
    }

    if (isActive !== undefined) {
      filter.isActive = isActive === "true";
    }

    if (isNonEmptyString(search as string)) {
      const searchRegex = new RegExp((search as string).trim(), "i");
      filter.$or = [{ name: searchRegex }, { email: searchRegex }, { phone: searchRegex }];
    }

    const [users, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: {
        users: users.map(sanitizeUser),
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("GetUsers error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * @route   GET /api/users/:id
 * @desc    Get single user details by ID
 * @access  Private (SuperAdmin / Owner / Accountant)
 */
export const getUserById = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const idParam = req.params.id;
    const id = Array.isArray(idParam) ? idParam[0] : idParam;
    const userId = Array.isArray(id) ? id[0] : id;

    if (!isValidObjectId(userId)) {
      res.status(400).json({ success: false, message: "Invalid user ID" });
      return;
    }

    const user = await User.findById(id);

    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    // Tenant Check: Ensure caller belongs to same business unless superAdmin
    if (
      req.user?.role !== "superAdmin" &&
      user.businessId?.toString() !== req.user?.businessId
    ) {
      res.status(403).json({ success: false, message: "Permission denied" });
      return;
    }

    res.status(200).json({
      success: true,
      data: { user: sanitizeUser(user) },
    });
  } catch (error) {
    console.error("GetUserById error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * @route   PUT /api/users/:id
 * @desc    Update user details, role, or businessId
 * @access  Private (SuperAdmin / Owner)
 */
export const updateUser = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const idParam = req.params.id;
    const id = Array.isArray(idParam) ? idParam[0] : idParam;
    const { name, phone, role, businessId } = req.body;

    if (!id || !isValidObjectId(id)) {
      res.status(400).json({ success: false, message: "Invalid user ID" });
      return;
    }

    const user = await User.findById(id);
    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    // Tenant Isolation Check
    if (
      req.user?.role !== "superAdmin" &&
      user.businessId?.toString() !== req.user?.businessId
    ) {
      res.status(403).json({ success: false, message: "Permission denied" });
      return;
    }

    const updates: Partial<IUser> = {};

    if (isNonEmptyString(name)) updates.name = name.trim();
    if (phone !== undefined) updates.phone = isNonEmptyString(phone) ? phone.trim() : undefined;

    // Role Escalation Protection
    if (role) {
      if (!USER_ROLES.includes(role as UserRole)) {
        res.status(400).json({ success: false, message: "Invalid user role" });
        return;
      }
      if (role === "superAdmin" && req.user?.role !== "superAdmin") {
        res.status(403).json({ success: false, message: "Cannot assign superAdmin role" });
        return;
      }
      updates.role = role as UserRole;
    }

    // Business ID modification restricted to SuperAdmin
    if (businessId !== undefined && req.user?.role === "superAdmin") {
      updates.businessId = isNonEmptyString(businessId) && isValidObjectId(businessId)
        ? new mongoose.Types.ObjectId(businessId)
        : undefined;
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: { user: sanitizeUser(updatedUser!) },
    });
  } catch (error) {
    console.error("UpdateUser error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * @route   PATCH /api/users/:id/status
 * @desc    Toggle user active/deactive status
 * @access  Private (SuperAdmin / Owner)
 */
export const toggleUserStatus = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    // req.params.id can be string | string[] depending on how Express parsed the route
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;
    const { isActive } = req.body;

    if (!isValidObjectId(id)) {
      res.status(400).json({ success: false, message: "Invalid user ID" });
      return;
    }

    if (typeof isActive !== "boolean") {
      res.status(400).json({ success: false, message: "isActive field must be a boolean" });
      return;
    }

    // Prevent self-deactivation
    if (id === req.user?.userId && !isActive) {
      res.status(400).json({ success: false, message: "You cannot deactivate your own account" });
      return;
    }

    const user = await User.findById(id);
    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    if (
      req.user?.role !== "superAdmin" &&
      user.businessId?.toString() !== req.user?.businessId
    ) {
      res.status(403).json({ success: false, message: "Permission denied" });
      return;
    }

    user.isActive = isActive;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User status changed to ${isActive ? "active" : "inactive"}`,
      data: { user: sanitizeUser(user) },
    });
  } catch (error) {
    console.error("ToggleUserStatus error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * @route   DELETE /api/users/:id
 * @desc    Hard delete a user from the database
 * @access  Private (SuperAdmin / Owner)
 */
export const deleteUser = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = Array.isArray(id) ? id[0] : id;

    if (!isValidObjectId(userId)) {
      res.status(400).json({ success: false, message: "Invalid user ID" });
      return;
    }

    // Prevent self-deletion
    if (userId === req.user?.userId) {
      res.status(400).json({ success: false, message: "You cannot delete your own account" });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    if (
      req.user?.role !== "superAdmin" &&
      user.businessId?.toString() !== req.user?.businessId
    ) {
      res.status(403).json({ success: false, message: "Permission denied" });
      return;
    }

    await User.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("DeleteUser error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};