"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.toggleUserStatus = exports.updateUser = exports.getUserById = exports.getUsers = exports.createUser = exports.updatePassword = exports.updateMe = exports.getMe = exports.deleteAvatar = exports.uploadAvatar = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const mongoose_1 = __importDefault(require("mongoose"));
const user_1 = __importDefault(require("../models/user"));
const roles_1 = require("../constants/roles");
const cloudinary_service_1 = require("../service/cloudinary.service");
// ============================================================================
// HELPERS
// ============================================================================
const isNonEmptyString = (val) => {
    return typeof val === "string" && val.trim().length > 0;
};
const isValidObjectId = (id) => {
    return mongoose_1.default.Types.ObjectId.isValid(id);
};
const sanitizeUser = (user) => ({
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
const uploadAvatar = async (req, res) => {
    try {
        if (!req.user?.userId) {
            res.status(401).json({ success: false, message: "Authentication required" });
            return;
        }
        if (!req.file) {
            res.status(400).json({ success: false, message: "No file uploaded" });
            return;
        }
        const user = await user_1.default.findById(req.user.userId);
        if (!user) {
            res.status(404).json({ success: false, message: "User not found" });
            return;
        }
        const oldPublicId = user.avatar?.public_id;
        // 1. Upload new avatar to Cloudinary first
        const result = await (0, cloudinary_service_1.uploadToCloudinary)(req.file.buffer, "invoice-tracker/avatars");
        // 2. Save new Cloudinary URL and public ID to DB
        user.avatar = { url: result.url, public_id: result.public_id };
        await user.save();
        // 3. Delete previous Cloudinary image if it exists and differs
        if (oldPublicId && oldPublicId !== result.public_id) {
            await (0, cloudinary_service_1.deleteFromCloudinary)(oldPublicId);
        }
        // 4. Return updated user information
        res.status(200).json({
            success: true,
            message: "Avatar uploaded successfully",
            data: { user: sanitizeUser(user) },
        });
    }
    catch (error) {
        console.error("UploadAvatar error:", error);
        res.status(500).json({ success: false, message: "Failed to upload avatar" });
    }
};
exports.uploadAvatar = uploadAvatar;
/**
 * @route   DELETE /api/users/me/avatar
 * @desc    Remove user avatar from Cloudinary and DB
 * @access  Private
 */
const deleteAvatar = async (req, res) => {
    try {
        if (!req.user?.userId) {
            res.status(401).json({ success: false, message: "Authentication required" });
            return;
        }
        const user = await user_1.default.findById(req.user.userId);
        if (!user) {
            res.status(404).json({ success: false, message: "User not found" });
            return;
        }
        if (user.avatar?.public_id) {
            await (0, cloudinary_service_1.deleteFromCloudinary)(user.avatar.public_id);
        }
        user.avatar = undefined;
        await user.save();
        res.status(200).json({
            success: true,
            message: "Avatar removed successfully",
            data: { user: sanitizeUser(user) },
        });
    }
    catch (error) {
        console.error("DeleteAvatar error:", error);
        res.status(500).json({ success: false, message: "Failed to remove avatar" });
    }
};
exports.deleteAvatar = deleteAvatar;
/**
 * @route   GET /api/users/me
 * @desc    Get current authenticated user profile
 * @access  Private
 */
const getMe = async (req, res) => {
    try {
        if (!req.user?.userId) {
            res.status(401).json({ success: false, message: "Authentication required" });
            return;
        }
        const user = await user_1.default.findById(req.user.userId);
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
    }
    catch (error) {
        console.error("GetMe error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};
exports.getMe = getMe;
/**
 * @route   PUT /api/users/me
 * @desc    Update current user profile (name, phone)
 * @access  Private
 */
const updateMe = async (req, res) => {
    try {
        if (!req.user?.userId) {
            res.status(401).json({ success: false, message: "Authentication required" });
            return;
        }
        const { name, phone } = req.body;
        const updates = {};
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
        const updatedUser = await user_1.default.findByIdAndUpdate(req.user.userId, { $set: updates }, { new: true, runValidators: true });
        if (!updatedUser) {
            res.status(404).json({ success: false, message: "User not found" });
            return;
        }
        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            data: { user: sanitizeUser(updatedUser) },
        });
    }
    catch (error) {
        console.error("UpdateMe error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};
exports.updateMe = updateMe;
/**
 * @route   PUT /api/users/me/password
 * @desc    Update current user's password
 * @access  Private
 */
const updatePassword = async (req, res) => {
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
        const user = await user_1.default.findById(req.user.userId).select("+password");
        if (!user) {
            res.status(404).json({ success: false, message: "User not found" });
            return;
        }
        const isPasswordValid = await bcryptjs_1.default.compare(currentPassword, user.password);
        if (!isPasswordValid) {
            res.status(401).json({ success: false, message: "Current password is incorrect" });
            return;
        }
        user.password = await bcryptjs_1.default.hash(newPassword, 10);
        await user.save();
        res.status(200).json({
            success: true,
            message: "Password updated successfully",
        });
    }
    catch (error) {
        console.error("UpdatePassword error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};
exports.updatePassword = updatePassword;
// ============================================================================
// ADMIN & USER MANAGEMENT CONTROLLERS
// ============================================================================
/**
 * @route   POST /api/users
 * @desc    Admin/Owner creates a new user (with role & business assignment)
 * @access  Private (SuperAdmin / Owner)
 */
const createUser = async (req, res) => {
    try {
        const { name, email, password, role, businessId, phone } = req.body;
        if (!isNonEmptyString(name) || !isNonEmptyString(email) || !isNonEmptyString(password) || !isNonEmptyString(role)) {
            res.status(400).json({
                success: false,
                message: "Name, email, password, and role are required",
            });
            return;
        }
        if (!roles_1.USER_ROLES.includes(role)) {
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
        let assignedBusinessId = businessId;
        if (currentUserRole !== "superAdmin") {
            assignedBusinessId = currentUserBusinessId; // Force non-superAdmins to create within their own business
        }
        if (assignedBusinessId && !isValidObjectId(assignedBusinessId)) {
            res.status(400).json({ success: false, message: "Invalid businessId format" });
            return;
        }
        const normalizedEmail = email.trim().toLowerCase();
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const user = await user_1.default.create({
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword,
            phone: isNonEmptyString(phone) ? phone.trim() : undefined,
            role: role,
            businessId: assignedBusinessId ? new mongoose_1.default.Types.ObjectId(assignedBusinessId) : undefined,
            isActive: true,
        });
        res.status(201).json({
            success: true,
            message: "User created successfully",
            data: { user: sanitizeUser(user) },
        });
    }
    catch (error) {
        if (typeof error === "object" && error !== null && "code" in error && error.code === 11000) {
            res.status(409).json({ success: false, message: "User with this email already exists" });
            return;
        }
        console.error("CreateUser error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};
exports.createUser = createUser;
/**
 * @route   GET /api/users
 * @desc    Get paginated list of users (Filtered by role/business tenant)
 * @access  Private (SuperAdmin / Owner / Accountant)
 */
const getUsers = async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page, 10) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
        const skip = (page - 1) * limit;
        const { search, role, isActive } = req.query;
        const filter = {
            role: { $ne: "customer" },
        };
        // Multi-tenant scoping: Non-superAdmins can only view users in their business
        if (req.user?.role !== "superAdmin") {
            filter.businessId = req.user?.businessId
                ? new mongoose_1.default.Types.ObjectId(req.user.businessId)
                : null;
        }
        else if (req.query.businessId && isNonEmptyString(req.query.businessId)) {
            filter.businessId = new mongoose_1.default.Types.ObjectId(req.query.businessId);
        }
        if (isNonEmptyString(role) && roles_1.USER_ROLES.includes(role)) {
            filter.role = role;
        }
        if (isActive !== undefined) {
            filter.isActive = isActive === "true";
        }
        if (isNonEmptyString(search)) {
            const searchRegex = new RegExp(search.trim(), "i");
            filter.$or = [{ name: searchRegex }, { email: searchRegex }, { phone: searchRegex }];
        }
        const [users, total] = await Promise.all([
            user_1.default.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
            user_1.default.countDocuments(filter),
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
    }
    catch (error) {
        console.error("GetUsers error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};
exports.getUsers = getUsers;
/**
 * @route   GET /api/users/:id
 * @desc    Get single user details by ID
 * @access  Private (SuperAdmin / Owner / Accountant)
 */
const getUserById = async (req, res) => {
    try {
        const idParam = req.params.id;
        const id = Array.isArray(idParam) ? idParam[0] : idParam;
        const userId = Array.isArray(id) ? id[0] : id;
        if (!isValidObjectId(userId)) {
            res.status(400).json({ success: false, message: "Invalid user ID" });
            return;
        }
        const user = await user_1.default.findById(id);
        if (!user) {
            res.status(404).json({ success: false, message: "User not found" });
            return;
        }
        // Tenant Check: Ensure caller belongs to same business unless superAdmin
        if (req.user?.role !== "superAdmin" &&
            user.businessId?.toString() !== req.user?.businessId) {
            res.status(403).json({ success: false, message: "Permission denied" });
            return;
        }
        res.status(200).json({
            success: true,
            data: { user: sanitizeUser(user) },
        });
    }
    catch (error) {
        console.error("GetUserById error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};
exports.getUserById = getUserById;
/**
 * @route   PUT /api/users/:id
 * @desc    Update user details, role, or businessId
 * @access  Private (SuperAdmin / Owner)
 */
const updateUser = async (req, res) => {
    try {
        const idParam = req.params.id;
        const id = Array.isArray(idParam) ? idParam[0] : idParam;
        const { name, phone, role, businessId } = req.body;
        if (!id || !isValidObjectId(id)) {
            res.status(400).json({ success: false, message: "Invalid user ID" });
            return;
        }
        const user = await user_1.default.findById(id);
        if (!user) {
            res.status(404).json({ success: false, message: "User not found" });
            return;
        }
        // Tenant Isolation Check
        if (req.user?.role !== "superAdmin" &&
            user.businessId?.toString() !== req.user?.businessId) {
            res.status(403).json({ success: false, message: "Permission denied" });
            return;
        }
        const updates = {};
        if (isNonEmptyString(name))
            updates.name = name.trim();
        if (phone !== undefined)
            updates.phone = isNonEmptyString(phone) ? phone.trim() : undefined;
        // Role Escalation Protection
        if (role) {
            if (!roles_1.USER_ROLES.includes(role)) {
                res.status(400).json({ success: false, message: "Invalid user role" });
                return;
            }
            if (role === "superAdmin" && req.user?.role !== "superAdmin") {
                res.status(403).json({ success: false, message: "Cannot assign superAdmin role" });
                return;
            }
            updates.role = role;
        }
        // Business ID modification restricted to SuperAdmin
        if (businessId !== undefined && req.user?.role === "superAdmin") {
            updates.businessId = isNonEmptyString(businessId) && isValidObjectId(businessId)
                ? new mongoose_1.default.Types.ObjectId(businessId)
                : undefined;
        }
        const updatedUser = await user_1.default.findByIdAndUpdate(id, { $set: updates }, { new: true, runValidators: true });
        res.status(200).json({
            success: true,
            message: "User updated successfully",
            data: { user: sanitizeUser(updatedUser) },
        });
    }
    catch (error) {
        console.error("UpdateUser error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};
exports.updateUser = updateUser;
/**
 * @route   PATCH /api/users/:id/status
 * @desc    Toggle user active/deactive status
 * @access  Private (SuperAdmin / Owner)
 */
const toggleUserStatus = async (req, res) => {
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
        const user = await user_1.default.findById(id);
        if (!user) {
            res.status(404).json({ success: false, message: "User not found" });
            return;
        }
        if (req.user?.role !== "superAdmin" &&
            user.businessId?.toString() !== req.user?.businessId) {
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
    }
    catch (error) {
        console.error("ToggleUserStatus error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};
exports.toggleUserStatus = toggleUserStatus;
/**
 * @route   DELETE /api/users/:id
 * @desc    Hard delete a user from the database
 * @access  Private (SuperAdmin / Owner)
 */
const deleteUser = async (req, res) => {
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
        const user = await user_1.default.findById(userId);
        if (!user) {
            res.status(404).json({ success: false, message: "User not found" });
            return;
        }
        if (req.user?.role !== "superAdmin" &&
            user.businessId?.toString() !== req.user?.businessId) {
            res.status(403).json({ success: false, message: "Permission denied" });
            return;
        }
        await user_1.default.findByIdAndDelete(id);
        res.status(200).json({
            success: true,
            message: "User deleted successfully",
        });
    }
    catch (error) {
        console.error("DeleteUser error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};
exports.deleteUser = deleteUser;
