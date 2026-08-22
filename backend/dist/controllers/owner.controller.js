"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteOwner = exports.toggleOwnerStatus = exports.updateOwner = exports.createOwner = exports.getOwnerById = exports.getOwners = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const user_1 = __importDefault(require("../models/user"));
const Business_1 = __importDefault(require("../models/Business"));
const Customer_1 = __importDefault(require("../models/Customer"));
const safeTransaction_1 = require("../utils/safeTransaction");
const isNonEmptyString = (val) => typeof val === "string" && val.trim().length > 0;
const isValidObjectId = (id) => typeof id === "string" && mongoose_1.default.Types.ObjectId.isValid(id);
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const OWNER_ROLES = ["owner", "admin"];
const cascadeBusinessActiveStatus = async (businessId, isActive) => {
    await Business_1.default.findByIdAndUpdate(businessId, { isActive });
    await user_1.default.updateMany({ businessId, role: { $ne: "superAdmin" } }, { isActive });
    await Customer_1.default.updateMany({ businessId }, { isActive });
};
const sanitizeOwner = (user, business) => ({
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    businessId: user.businessId,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    business: business
        ? {
            id: business._id,
            name: business.name,
            isActive: business.isActive,
        }
        : null,
});
/**
 * GET /api/users/owners
 */
const getOwners = async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page, 10) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
        const skip = (page - 1) * limit;
        const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
        const filter = { role: { $in: OWNER_ROLES } };
        if (search) {
            const regex = new RegExp(search, "i");
            filter.$or = [{ name: regex }, { email: regex }];
        }
        const [owners, total] = await Promise.all([
            user_1.default.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
            user_1.default.countDocuments(filter),
        ]);
        const businessIds = owners
            .map((o) => o.businessId)
            .filter((id) => !!id);
        const businesses = await Business_1.default.find({ _id: { $in: businessIds } }).select("_id name isActive ownerId");
        const businessMap = new Map(businesses.map((b) => [b._id.toString(), b]));
        const ownersWithBusiness = owners.map((owner) => {
            const business = owner.businessId
                ? businessMap.get(owner.businessId.toString()) ?? null
                : null;
            return sanitizeOwner(owner, business);
        });
        res.status(200).json({
            success: true,
            data: {
                owners: ownersWithBusiness,
                pagination: {
                    total,
                    page,
                    limit,
                    pages: Math.ceil(total / limit) || 1,
                },
            },
        });
    }
    catch (error) {
        console.error("getOwners error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};
exports.getOwners = getOwners;
/**
 * GET /api/users/owners/:id
 */
const getOwnerById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!isValidObjectId(id)) {
            res.status(400).json({ success: false, message: "Invalid owner ID" });
            return;
        }
        const owner = await user_1.default.findOne({ _id: id, role: { $in: OWNER_ROLES } });
        if (!owner) {
            res.status(404).json({ success: false, message: "Owner not found" });
            return;
        }
        const business = owner.businessId
            ? await Business_1.default.findById(owner.businessId).select("_id name email phone address isActive")
            : null;
        res.status(200).json({
            success: true,
            data: { owner: sanitizeOwner(owner, business) },
        });
    }
    catch (error) {
        console.error("getOwnerById error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};
exports.getOwnerById = getOwnerById;
/**
 * POST /api/users/owners
 */
const createOwner = async (req, res) => {
    try {
        const { businessName, ownerName, email, password, confirmPassword, phone } = req.body;
        if (!isNonEmptyString(businessName)) {
            res.status(400).json({ success: false, message: "Business name is required" });
            return;
        }
        if (!isNonEmptyString(ownerName)) {
            res.status(400).json({ success: false, message: "Owner name is required" });
            return;
        }
        if (!isNonEmptyString(email)) {
            res.status(400).json({ success: false, message: "Email is required" });
            return;
        }
        if (!isNonEmptyString(password)) {
            res.status(400).json({ success: false, message: "Password is required" });
            return;
        }
        if (!isNonEmptyString(confirmPassword)) {
            res.status(400).json({ success: false, message: "Confirm password is required" });
            return;
        }
        if (password !== confirmPassword) {
            res.status(400).json({ success: false, message: "Passwords do not match" });
            return;
        }
        if (password.length < 8) {
            res.status(400).json({ success: false, message: "Password must be at least 8 characters" });
            return;
        }
        const normalizedEmail = email.trim().toLowerCase();
        if (!isValidEmail(normalizedEmail)) {
            res.status(400).json({ success: false, message: "Invalid email address" });
            return;
        }
        const existingUser = await user_1.default.findOne({ email: normalizedEmail });
        if (existingUser) {
            res.status(409).json({ success: false, message: "Email already exists" });
            return;
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        let createdUserId = null;
        const { owner, business } = await (0, safeTransaction_1.executeWithTransactionFallback)(async (session) => {
            const opts = session ? { session } : {};
            const [createdOwner] = await user_1.default.create([
                {
                    name: ownerName.trim(),
                    email: normalizedEmail,
                    password: hashedPassword,
                    phone: isNonEmptyString(phone) ? phone.trim() : undefined,
                    role: "owner",
                    isActive: true,
                },
            ], opts);
            createdUserId = createdOwner._id;
            const [createdBusiness] = await Business_1.default.create([
                {
                    name: businessName.trim(),
                    email: normalizedEmail,
                    phone: isNonEmptyString(phone) ? phone.trim() : undefined,
                    ownerId: createdOwner._id,
                    isActive: true,
                },
            ], opts);
            createdOwner.businessId = createdBusiness._id;
            await createdOwner.save(opts);
            return { owner: createdOwner, business: createdBusiness };
        }, async () => {
            if (createdUserId) {
                await user_1.default.findByIdAndDelete(createdUserId);
            }
        });
        res.status(201).json({
            success: true,
            message: "Owner and business created successfully",
            data: {
                owner: sanitizeOwner(owner, business),
            },
        });
    }
    catch (error) {
        if (typeof error === "object" &&
            error !== null &&
            "code" in error &&
            error.code === 11000) {
            res.status(409).json({ success: false, message: "Email already exists" });
            return;
        }
        console.error("createOwner error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};
exports.createOwner = createOwner;
/**
 * PUT /api/users/owners/:id
 */
const updateOwner = async (req, res) => {
    try {
        const { id } = req.params;
        const { ownerName, businessName, email, password, phone } = req.body;
        if (!isValidObjectId(id)) {
            res.status(400).json({ success: false, message: "Invalid owner ID" });
            return;
        }
        const owner = await user_1.default.findOne({ _id: id, role: { $in: OWNER_ROLES } });
        if (!owner) {
            res.status(404).json({ success: false, message: "Owner not found" });
            return;
        }
        if (ownerName !== undefined) {
            if (!isNonEmptyString(ownerName)) {
                res.status(400).json({ success: false, message: "Owner name cannot be empty" });
                return;
            }
            owner.name = ownerName.trim();
        }
        if (email !== undefined) {
            if (!isNonEmptyString(email)) {
                res.status(400).json({ success: false, message: "Email cannot be empty" });
                return;
            }
            const normalizedEmail = email.trim().toLowerCase();
            if (!isValidEmail(normalizedEmail)) {
                res.status(400).json({ success: false, message: "Invalid email address" });
                return;
            }
            const duplicate = await user_1.default.findOne({ email: normalizedEmail, _id: { $ne: id } });
            if (duplicate) {
                res.status(409).json({ success: false, message: "Email already exists" });
                return;
            }
            owner.email = normalizedEmail;
        }
        if (phone !== undefined) {
            owner.phone = isNonEmptyString(phone) ? phone.trim() : undefined;
        }
        if (password !== undefined && isNonEmptyString(password)) {
            if (password.length < 8) {
                res.status(400).json({ success: false, message: "Password must be at least 8 characters" });
                return;
            }
            owner.password = await bcryptjs_1.default.hash(password, 10);
        }
        await owner.save();
        let business = null;
        if (owner.businessId) {
            business = await Business_1.default.findById(owner.businessId);
            if (business) {
                if (businessName !== undefined && isNonEmptyString(businessName)) {
                    business.name = businessName.trim();
                }
                if (email !== undefined && isNonEmptyString(email)) {
                    business.email = email.trim().toLowerCase();
                }
                if (phone !== undefined) {
                    business.phone = isNonEmptyString(phone) ? phone.trim() : undefined;
                }
                await business.save();
            }
        }
        res.status(200).json({
            success: true,
            message: "Owner updated successfully",
            data: { owner: sanitizeOwner(owner, business) },
        });
    }
    catch (error) {
        console.error("updateOwner error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};
exports.updateOwner = updateOwner;
/**
 * PATCH /api/users/owners/:id/status
 */
const toggleOwnerStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;
        if (!isValidObjectId(id)) {
            res.status(400).json({ success: false, message: "Invalid owner ID" });
            return;
        }
        if (typeof isActive !== "boolean") {
            res.status(400).json({ success: false, message: "isActive must be a boolean" });
            return;
        }
        const owner = await user_1.default.findOne({ _id: id, role: { $in: OWNER_ROLES } });
        if (!owner) {
            res.status(404).json({ success: false, message: "Owner not found" });
            return;
        }
        owner.isActive = isActive;
        await owner.save();
        if (owner.businessId) {
            await cascadeBusinessActiveStatus(owner.businessId, isActive);
        }
        const business = owner.businessId ? await Business_1.default.findById(owner.businessId) : null;
        res.status(200).json({
            success: true,
            message: `Owner ${isActive ? "activated" : "deactivated"} successfully`,
            data: { owner: sanitizeOwner(owner, business) },
        });
    }
    catch (error) {
        console.error("toggleOwnerStatus error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};
exports.toggleOwnerStatus = toggleOwnerStatus;
/**
 * DELETE /api/users/owners/:id — soft delete
 */
const deleteOwner = async (req, res) => {
    try {
        const { id } = req.params;
        if (!isValidObjectId(id)) {
            res.status(400).json({ success: false, message: "Invalid owner ID" });
            return;
        }
        const owner = await user_1.default.findOne({ _id: id, role: { $in: OWNER_ROLES } });
        if (!owner) {
            res.status(404).json({ success: false, message: "Owner not found" });
            return;
        }
        owner.isActive = false;
        await owner.save();
        if (owner.businessId) {
            await cascadeBusinessActiveStatus(owner.businessId, false);
        }
        res.status(200).json({
            success: true,
            message: "Owner deactivated successfully",
        });
    }
    catch (error) {
        console.error("deleteOwner error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};
exports.deleteOwner = deleteOwner;
