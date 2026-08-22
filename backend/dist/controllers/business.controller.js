"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadBusinessLogo = exports.toggleBusinessStatus = exports.updateBusiness = exports.getBusinessById = exports.getBusinesses = exports.createBusiness = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const Business_1 = __importDefault(require("../models/Business"));
const user_1 = __importDefault(require("../models/user"));
const cloudinary_service_1 = require("../service/cloudinary.service");
// HELPERS
const isNonEmptyString = (val) => {
    return typeof val === "string" && val.trim().length > 0;
};
const isValidObjectId = (id) => {
    return typeof id === "string" && mongoose_1.default.Types.ObjectId.isValid(id);
};
/**
 * @route   POST /api/businesses
 * @desc    Create a new business and its owner at the same time
 * @access  Private (SuperAdmin)
 */
const createBusiness = async (req, res) => {
    try {
        const { businessName, businessEmail, phone, address, currency, taxNumber, logo, ownerName, ownerEmail, ownerPassword, ownerPhone } = req.body;
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ success: false, message: "Authentication required" });
            return;
        }
        // 1. Hubi Xogta Ganacsiga
        if (!isNonEmptyString(businessName) || !isNonEmptyString(businessEmail)) {
            res.status(400).json({ success: false, message: "Business name and email are required" });
            return;
        }
        // 2. Hubi Xogta Milkiilaha
        if (!isNonEmptyString(ownerName) || !isNonEmptyString(ownerEmail) || !isNonEmptyString(ownerPassword)) {
            res.status(400).json({ success: false, message: "Owner name, email, and password are required" });
            return;
        }
        // 3. Hubi in Email-ka milkiilaha uusan horay nidaamka ugu jirin
        const existingUser = await user_1.default.findOne({ email: ownerEmail.trim().toLowerCase() });
        if (existingUser) {
            res.status(409).json({ success: false, message: "Owner email already exists in the system" });
            return;
        }
        // 4. Hash-garee Password-ka
        const hashedPassword = await bcryptjs_1.default.hash(ownerPassword, 10);
        // 5. Abuur Milkiilaha (User) HOREYN si aan u helno ID-giisa
        const owner = await user_1.default.create({
            name: ownerName.trim(),
            email: ownerEmail.trim().toLowerCase(),
            password: hashedPassword,
            phone: isNonEmptyString(ownerPhone) ? ownerPhone.trim() : undefined,
            role: "owner",
            isActive: true,
        });
        // 6. Abuur Ganacsiga isaga oo wata 'ownerId' maadaama ay required tahay
        const business = await Business_1.default.create({
            name: businessName.trim(),
            email: businessEmail.trim().toLowerCase(),
            phone: isNonEmptyString(phone) ? phone.trim() : undefined,
            address: isNonEmptyString(address) ? address.trim() : undefined,
            currency: isNonEmptyString(currency) ? currency.trim().toUpperCase() : "USD",
            taxNumber: isNonEmptyString(taxNumber) ? taxNumber.trim() : undefined,
            logo,
            ownerId: owner._id, // Halkan ayaa lagu bixiyay ownerId
            isActive: true,
        });
        // 7. Dib ugu cusboonaysii Milkiilaha ID-ga Business-ka cusub
        owner.businessId = business._id;
        await owner.save();
        res.status(201).json({
            success: true,
            message: "Business and Owner created successfully",
            data: {
                business,
                owner: {
                    id: owner._id,
                    name: owner.name,
                    email: owner.email,
                    role: owner.role
                }
            },
        });
    }
    catch (error) {
        console.error("CreateBusiness error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};
exports.createBusiness = createBusiness;
/**
 * @route   GET /api/businesses
 * @desc    Get businesses (SuperAdmin gets paginated list, others get their own)
 * @access  Private (SuperAdmin / Owner / Accountant)
 */
const getBusinesses = async (req, res) => {
    try {
        const role = req.user?.role;
        // Non-superAdmins can only see their own business
        if (role !== "superAdmin") {
            if (!req.user?.businessId) {
                res.status(404).json({ success: false, message: "No business associated with this user" });
                return;
            }
            const business = await Business_1.default.findById(req.user.businessId);
            res.status(200).json({
                success: true,
                data: { businesses: business ? [business] : [] },
            });
            return;
        }
        // SuperAdmin Logic: Fetch all businesses with pagination & filtering
        const page = Math.max(1, parseInt(req.query.page, 10) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
        const skip = (page - 1) * limit;
        const { search, isActive } = req.query;
        const filter = {};
        if (isActive !== undefined) {
            filter.isActive = isActive === "true";
        }
        if (isNonEmptyString(search)) {
            const searchRegex = new RegExp(search.trim(), "i");
            filter.$or = [{ name: searchRegex }, { email: searchRegex }, { taxNumber: searchRegex }];
        }
        const [businesses, total] = await Promise.all([
            Business_1.default.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate("ownerId", "name email"),
            Business_1.default.countDocuments(filter),
        ]);
        res.status(200).json({
            success: true,
            data: {
                businesses,
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
        console.error("GetBusinesses error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};
exports.getBusinesses = getBusinesses;
/**
 * @route   GET /api/businesses/:id
 * @desc    Get single business by ID
 * @access  Private (SuperAdmin / Owner / Accountant)
 */
const getBusinessById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!isValidObjectId(id)) {
            res.status(400).json({ success: false, message: "Invalid business ID" });
            return;
        }
        // Multi-tenant check
        if (req.user?.role !== "superAdmin" && req.user?.businessId !== id) {
            res.status(403).json({ success: false, message: "Permission denied to access this business" });
            return;
        }
        const business = await Business_1.default.findById(id).populate("ownerId", "name email phone");
        if (!business) {
            res.status(404).json({ success: false, message: "Business not found" });
            return;
        }
        res.status(200).json({
            success: true,
            data: { business },
        });
    }
    catch (error) {
        console.error("GetBusinessById error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};
exports.getBusinessById = getBusinessById;
/**
 * @route   PUT /api/businesses/:id
 * @desc    Update business details
 * @access  Private (SuperAdmin / Owner)
 */
const updateBusiness = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, phone, address, currency, taxNumber, logo } = req.body;
        if (!isValidObjectId(id)) {
            res.status(400).json({ success: false, message: "Invalid business ID" });
            return;
        }
        // Multi-tenant check
        if (req.user?.role !== "superAdmin" && req.user?.businessId !== id) {
            res.status(403).json({ success: false, message: "Permission denied to update this business" });
            return;
        }
        const updates = {};
        if (isNonEmptyString(name))
            updates.name = name.trim();
        if (isNonEmptyString(email))
            updates.email = email.trim().toLowerCase();
        if (phone !== undefined)
            updates.phone = isNonEmptyString(phone) ? phone.trim() : undefined;
        if (address !== undefined)
            updates.address = isNonEmptyString(address) ? address.trim() : undefined;
        if (isNonEmptyString(currency))
            updates.currency = currency.trim().toUpperCase();
        if (taxNumber !== undefined)
            updates.taxNumber = isNonEmptyString(taxNumber) ? taxNumber.trim() : undefined;
        if (logo)
            updates.logo = logo;
        const updatedBusiness = await Business_1.default.findByIdAndUpdate(id, { $set: updates }, { new: true, runValidators: true });
        if (!updatedBusiness) {
            res.status(404).json({ success: false, message: "Business not found" });
            return;
        }
        res.status(200).json({
            success: true,
            message: "Business updated successfully",
            data: { business: updatedBusiness },
        });
    }
    catch (error) {
        console.error("UpdateBusiness error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};
exports.updateBusiness = updateBusiness;
/**
 * @route   PATCH /api/businesses/:id/status
 * @desc    Toggle business active/deactive status (Deactivating a business pauses access)
 * @access  Private (SuperAdmin)
 */
const toggleBusinessStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;
        if (!isValidObjectId(id)) {
            res.status(400).json({ success: false, message: "Invalid business ID" });
            return;
        }
        if (typeof isActive !== "boolean") {
            res.status(400).json({ success: false, message: "isActive field must be a boolean" });
            return;
        }
        const business = await Business_1.default.findById(id);
        if (!business) {
            res.status(404).json({ success: false, message: "Business not found" });
            return;
        }
        business.isActive = isActive;
        await business.save();
        res.status(200).json({
            success: true,
            message: `Business status changed to ${isActive ? "active" : "inactive"}`,
            data: { business },
        });
    }
    catch (error) {
        console.error("ToggleBusinessStatus error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};
exports.toggleBusinessStatus = toggleBusinessStatus;
/**
 * @route   POST /api/businesses/:id/logo
 * @desc    Upload or replace business logo via Cloudinary
 * @access  Private (SuperAdmin / Owner)
 */
const uploadBusinessLogo = async (req, res) => {
    try {
        const { id } = req.params;
        if (!isValidObjectId(id)) {
            res.status(400).json({ success: false, message: "Invalid business ID" });
            return;
        }
        if (!req.file) {
            res.status(400).json({ success: false, message: "No logo file uploaded" });
            return;
        }
        // Authorization check: SuperAdmin or owner of this business
        if (req.user?.role !== "superAdmin" && req.user?.businessId !== id) {
            res.status(403).json({ success: false, message: "Permission denied to update this business logo" });
            return;
        }
        const business = await Business_1.default.findById(id);
        if (!business) {
            res.status(404).json({ success: false, message: "Business not found" });
            return;
        }
        const oldPublicId = business.logo?.public_id;
        // 1. Upload new logo to Cloudinary
        const result = await (0, cloudinary_service_1.uploadToCloudinary)(req.file.buffer, "invoice-tracker/logos");
        // 2. Update database
        business.logo = { url: result.url, public_id: result.public_id };
        await business.save();
        // 3. Delete old logo from Cloudinary if exists and differs
        if (oldPublicId && oldPublicId !== result.public_id) {
            await (0, cloudinary_service_1.deleteFromCloudinary)(oldPublicId);
        }
        res.status(200).json({
            success: true,
            message: "Business logo uploaded successfully",
            data: { business },
        });
    }
    catch (error) {
        console.error("UploadBusinessLogo error:", error);
        res.status(500).json({ success: false, message: "Failed to upload business logo" });
    }
};
exports.uploadBusinessLogo = uploadBusinessLogo;
