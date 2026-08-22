"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.restoreCustomer = exports.toggleCustomerStatus = exports.deleteCustomer = exports.updateCustomer = exports.getCustomerById = exports.getCustomers = exports.updateCustomerMe = exports.getCustomerMe = exports.createCustomer = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const Customer_1 = __importDefault(require("../models/Customer"));
const user_1 = __importDefault(require("../models/user"));
const tenantScope_1 = require("../utils/tenantScope");
const roles_1 = require("../constants/roles");
const safeTransaction_1 = require("../utils/safeTransaction");
// HELPERS
const isNonEmptyString = (value) => {
    return typeof value === "string" && value.trim().length > 0;
};
const isValidObjectId = (id) => {
    return (typeof id === "string" &&
        mongoose_1.default.Types.ObjectId.isValid(id));
};
const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};
// CREATE CUSTOMER
// POST /api/customers
const createCustomer = async (req, res) => {
    try {
        const businessId = req.user?.businessId;
        const userId = req.user?.userId;
        if (!businessId) {
            res.status(403).json({
                success: false,
                message: "No business associated with this user",
            });
            return;
        }
        const { name, email, password, confirmPassword, phone, position, address, taxNumber, } = req.body;
        // ----------------------------------------------
        // Required fields
        // ----------------------------------------------
        if (!isNonEmptyString(name)) {
            res.status(400).json({
                success: false,
                message: "Customer name is required",
            });
            return;
        }
        if (!isNonEmptyString(email)) {
            res.status(400).json({
                success: false,
                message: "Customer email is required",
            });
            return;
        }
        if (!isNonEmptyString(password)) {
            res.status(400).json({
                success: false,
                message: "Password is required",
            });
            return;
        }
        if (!isNonEmptyString(confirmPassword)) {
            res.status(400).json({
                success: false,
                message: "Confirm password is required",
            });
            return;
        }
        if (password !== confirmPassword) {
            res.status(400).json({
                success: false,
                message: "Passwords do not match",
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
        const normalizedEmail = email.trim().toLowerCase();
        if (!isValidEmail(normalizedEmail)) {
            res.status(400).json({
                success: false,
                message: "Invalid email address",
            });
            return;
        }
        // ----------------------------------------------
        // Check duplicate email (User + Customer)
        // ----------------------------------------------
        const existingUser = await user_1.default.findOne({ email: normalizedEmail });
        if (existingUser) {
            res.status(400).json({
                success: false,
                message: "Customer email already exists",
            });
            return;
        }
        const existingCustomer = await Customer_1.default.findOne({
            businessId,
            email: normalizedEmail,
        });
        if (existingCustomer) {
            res.status(400).json({
                success: false,
                message: "Customer email already exists",
            });
            return;
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const customerPosition = isNonEmptyString(position) ? position.trim() : "customer";
        let createdUserId = null;
        const { customer } = await (0, safeTransaction_1.executeWithTransactionFallback)(async (session) => {
            const opts = session ? { session } : {};
            const [newUser] = await user_1.default.create([
                {
                    name: name.trim(),
                    email: normalizedEmail,
                    password: hashedPassword,
                    phone: isNonEmptyString(phone) ? phone.trim() : undefined,
                    role: "customer",
                    businessId: new mongoose_1.default.Types.ObjectId(businessId),
                    isActive: true,
                },
            ], opts);
            createdUserId = newUser._id;
            const [newCustomer] = await Customer_1.default.create([
                {
                    businessId: new mongoose_1.default.Types.ObjectId(businessId),
                    userId: newUser._id,
                    name: name.trim(),
                    email: normalizedEmail,
                    phone: isNonEmptyString(phone) ? phone.trim() : undefined,
                    position: customerPosition,
                    address: isNonEmptyString(address) ? address.trim() : undefined,
                    taxNumber: isNonEmptyString(taxNumber) ? taxNumber.trim() : undefined,
                    totalInvoiced: 0,
                    totalPaid: 0,
                    outstandingBalance: 0,
                    isActive: true,
                },
            ], opts);
            newUser.customerId = newCustomer._id;
            await newUser.save(opts);
            return { customer: newCustomer, newUser };
        }, async () => {
            if (createdUserId) {
                await user_1.default.findByIdAndDelete(createdUserId);
            }
        });
        res.status(201).json({
            success: true,
            message: "Customer created successfully with login account",
            data: { customer },
        });
    }
    catch (error) {
        console.error("CreateCustomer error:", error);
        if (typeof error === "object" &&
            error !== null &&
            "code" in error &&
            error.code === 11000) {
            res.status(400).json({
                success: false,
                message: "Customer email already exists",
            });
            return;
        }
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
exports.createCustomer = createCustomer;
// GET CURRENT CUSTOMER PROFILE
// GET /api/customers/me
const getCustomerMe = async (req, res) => {
    try {
        const businessId = req.user?.businessId;
        if (!businessId) {
            res.status(403).json({
                success: false,
                message: "No business associated with this user",
            });
            return;
        }
        if ((0, roles_1.normalizeRole)(req.user?.role || "customer") !== "customer") {
            res.status(403).json({
                success: false,
                message: "This endpoint is for customer accounts only",
            });
            return;
        }
        const customerRecord = await (0, tenantScope_1.getCustomerRecordForUser)(req);
        if (!customerRecord) {
            res.status(404).json({
                success: false,
                message: "Customer profile not found",
            });
            return;
        }
        const customer = await Customer_1.default.findOne({
            _id: customerRecord._id,
            businessId,
        });
        if (!customer) {
            res.status(404).json({
                success: false,
                message: "Customer profile not found",
            });
            return;
        }
        res.status(200).json({
            success: true,
            data: { customer },
        });
    }
    catch (error) {
        console.error("GetCustomerMe error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
exports.getCustomerMe = getCustomerMe;
// UPDATE CURRENT CUSTOMER PROFILE
// PUT /api/customers/me
const updateCustomerMe = async (req, res) => {
    try {
        const businessId = req.user?.businessId;
        if (!businessId) {
            res.status(403).json({
                success: false,
                message: "No business associated with this user",
            });
            return;
        }
        if ((0, roles_1.normalizeRole)(req.user?.role || "customer") !== "customer") {
            res.status(403).json({
                success: false,
                message: "This endpoint is for customer accounts only",
            });
            return;
        }
        const customerRecord = await (0, tenantScope_1.getCustomerRecordForUser)(req);
        if (!customerRecord) {
            res.status(404).json({
                success: false,
                message: "Customer profile not found",
            });
            return;
        }
        const customer = await Customer_1.default.findOne({
            _id: customerRecord._id,
            businessId,
        });
        if (!customer) {
            res.status(404).json({
                success: false,
                message: "Customer profile not found",
            });
            return;
        }
        const { name, phone, address, position, taxNumber } = req.body;
        if (name !== undefined) {
            if (!isNonEmptyString(name)) {
                res.status(400).json({
                    success: false,
                    message: "Customer name cannot be empty",
                });
                return;
            }
            customer.name = name.trim();
            if (customer.userId) {
                await user_1.default.findByIdAndUpdate(customer.userId, { name: name.trim() });
            }
        }
        if (phone !== undefined) {
            customer.phone = isNonEmptyString(phone) ? phone.trim() : undefined;
            if (customer.userId) {
                await user_1.default.findByIdAndUpdate(customer.userId, {
                    phone: isNonEmptyString(phone) ? phone.trim() : undefined,
                });
            }
        }
        if (address !== undefined) {
            customer.address = isNonEmptyString(address) ? address.trim() : undefined;
        }
        if (position !== undefined) {
            customer.position = isNonEmptyString(position) ? position.trim() : "customer";
        }
        if (taxNumber !== undefined) {
            customer.taxNumber = isNonEmptyString(taxNumber)
                ? taxNumber.trim()
                : undefined;
        }
        await customer.save();
        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            data: { customer },
        });
    }
    catch (error) {
        console.error("UpdateCustomerMe error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
exports.updateCustomerMe = updateCustomerMe;
// GET ALL CUSTOMERS
// GET /api/customers
const getCustomers = async (req, res) => {
    try {
        const businessId = req.user?.businessId;
        if (!businessId) {
            res.status(403).json({
                success: false,
                message: "No business associated with this user",
            });
            return;
        }
        // ----------------------------------------------
        // Pagination
        // ----------------------------------------------
        const page = Math.max(1, parseInt(req.query.page, 10) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
        const skip = (page - 1) * limit;
        // ----------------------------------------------
        // Query
        // ----------------------------------------------
        const search = typeof req.query.search === "string"
            ? req.query.search.trim()
            : "";
        const isActive = req.query.isActive;
        const filter = {
            businessId,
        };
        if ((0, roles_1.normalizeRole)(req.user?.role || "customer") === "customer") {
            const customerRecord = await (0, tenantScope_1.getCustomerRecordForUser)(req);
            if (!customerRecord) {
                res.status(200).json({
                    success: true,
                    data: {
                        customers: [],
                        pagination: { total: 0, page, limit, pages: 0 },
                    },
                });
                return;
            }
            filter._id = customerRecord._id;
        }
        // Active filter
        if (isActive !== undefined) {
            filter.isActive = isActive === "true";
        }
        // Search
        if (search) {
            const searchRegex = new RegExp(search, "i");
            filter.$or = [
                { name: searchRegex },
                { email: searchRegex },
                { phone: searchRegex },
                { position: searchRegex },
                { taxNumber: searchRegex },
            ];
        }
        const [customers, total] = await Promise.all([
            Customer_1.default.find(filter)
                .populate("userId", "name email phone role")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Customer_1.default.countDocuments(filter),
        ]);
        res.status(200).json({
            success: true,
            data: {
                customers,
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
        console.error("GetCustomers error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
exports.getCustomers = getCustomers;
// GET CUSTOMER BY ID
// GET /api/customers/:id
const getCustomerById = async (req, res) => {
    try {
        const businessId = req.user?.businessId;
        const { id } = req.params;
        if (!businessId) {
            res.status(403).json({
                success: false,
                message: "No business associated with this user",
            });
            return;
        }
        if (!isValidObjectId(id)) {
            res.status(400).json({
                success: false,
                message: "Invalid customer ID",
            });
            return;
        }
        const customer = await Customer_1.default.findOne({
            _id: id,
            businessId,
        }).populate("userId", "name email phone role");
        if (!customer) {
            res.status(404).json({
                success: false,
                message: "Customer not found",
            });
            return;
        }
        if ((0, roles_1.normalizeRole)(req.user?.role || "customer") === "customer") {
            const customerRecord = await (0, tenantScope_1.getCustomerRecordForUser)(req);
            if (!customerRecord ||
                customer._id.toString() !== customerRecord._id.toString()) {
                res.status(403).json({
                    success: false,
                    message: "You do not have permission to access this customer",
                });
                return;
            }
        }
        res.status(200).json({
            success: true,
            data: {
                customer,
            },
        });
    }
    catch (error) {
        console.error("GetCustomerById error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
exports.getCustomerById = getCustomerById;
// UPDATE CUSTOMER
// PUT /api/customers/:id
const updateCustomer = async (req, res) => {
    try {
        const businessId = req.user?.businessId;
        const { id } = req.params;
        if (!businessId) {
            res.status(403).json({
                success: false,
                message: "No business associated with this user",
            });
            return;
        }
        if (!isValidObjectId(id)) {
            res.status(400).json({
                success: false,
                message: "Invalid customer ID",
            });
            return;
        }
        const { name, email, phone, address, position, taxNumber, isActive, } = req.body;
        const customer = await Customer_1.default.findOne({
            _id: id,
            businessId,
        });
        if (!customer) {
            res.status(404).json({
                success: false,
                message: "Customer not found",
            });
            return;
        }
        // ----------------------------------------------
        // Name
        // ----------------------------------------------
        if (name !== undefined) {
            if (!isNonEmptyString(name)) {
                res.status(400).json({
                    success: false,
                    message: "Customer name cannot be empty",
                });
                return;
            }
            customer.name = name.trim();
        }
        // ----------------------------------------------
        // Email
        // ----------------------------------------------
        if (email !== undefined) {
            if (!isNonEmptyString(email)) {
                res.status(400).json({
                    success: false,
                    message: "Customer email cannot be empty",
                });
                return;
            }
            const normalizedEmail = email.trim().toLowerCase();
            if (!isValidEmail(normalizedEmail)) {
                res.status(400).json({
                    success: false,
                    message: "Invalid email address",
                });
                return;
            }
            const duplicate = await Customer_1.default.findOne({
                businessId,
                email: normalizedEmail,
                _id: { $ne: id },
            });
            if (duplicate) {
                res.status(409).json({
                    success: false,
                    message: "Another customer with this email already exists",
                });
                return;
            }
            customer.email = normalizedEmail;
            if (customer.userId) {
                const duplicateUser = await user_1.default.findOne({
                    email: normalizedEmail,
                    _id: { $ne: customer.userId },
                });
                if (duplicateUser) {
                    res.status(409).json({
                        success: false,
                        message: "Another user with this email already exists",
                    });
                    return;
                }
            }
        }
        // ----------------------------------------------
        // Optional fields
        // ----------------------------------------------
        if (phone !== undefined) {
            customer.phone = isNonEmptyString(phone)
                ? phone.trim()
                : undefined;
        }
        if (address !== undefined) {
            customer.address = isNonEmptyString(address)
                ? address.trim()
                : undefined;
        }
        if (position !== undefined) {
            customer.position = isNonEmptyString(position) ? position.trim() : "customer";
        }
        if (taxNumber !== undefined) {
            customer.taxNumber = isNonEmptyString(taxNumber)
                ? taxNumber.trim()
                : undefined;
        }
        // ----------------------------------------------
        // Active / inactive
        // ----------------------------------------------
        if (isActive !== undefined) {
            if (typeof isActive !== "boolean") {
                res.status(400).json({
                    success: false,
                    message: "isActive must be a boolean",
                });
                return;
            }
            customer.isActive = isActive;
            if (customer.userId) {
                await user_1.default.findByIdAndUpdate(customer.userId, { isActive });
            }
        }
        await customer.save();
        if (customer.userId) {
            const userUpdates = {};
            if (name !== undefined)
                userUpdates.name = customer.name;
            if (email !== undefined)
                userUpdates.email = customer.email;
            if (phone !== undefined)
                userUpdates.phone = customer.phone;
            if (Object.keys(userUpdates).length > 0) {
                await user_1.default.findByIdAndUpdate(customer.userId, userUpdates);
            }
        }
        res.status(200).json({
            success: true,
            message: "Customer updated successfully",
            data: {
                customer,
            },
        });
    }
    catch (error) {
        console.error("UpdateCustomer error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
exports.updateCustomer = updateCustomer;
// DELETE CUSTOMER
// DELETE /api/customers/:id
const deleteCustomer = async (req, res) => {
    try {
        const businessId = req.user?.businessId;
        const { id } = req.params;
        if (!businessId) {
            res.status(403).json({
                success: false,
                message: "No business associated with this user",
            });
            return;
        }
        if (!isValidObjectId(id)) {
            res.status(400).json({
                success: false,
                message: "Invalid customer ID",
            });
            return;
        }
        const customer = await Customer_1.default.findOne({
            _id: id,
            businessId,
        });
        if (!customer) {
            res.status(404).json({
                success: false,
                message: "Customer not found",
            });
            return;
        }
        // ----------------------------------------------
        // Soft delete
        // ----------------------------------------------
        customer.isActive = false;
        await customer.save();
        if (customer.userId) {
            await user_1.default.findByIdAndUpdate(customer.userId, { isActive: false });
        }
        res.status(200).json({
            success: true,
            message: "Customer deactivated successfully",
            data: {
                customer,
            },
        });
    }
    catch (error) {
        console.error("DeleteCustomer error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
exports.deleteCustomer = deleteCustomer;
// PATCH CUSTOMER STATUS
// PATCH /api/customers/:id/status
const toggleCustomerStatus = async (req, res) => {
    try {
        const businessId = req.user?.businessId;
        const { id } = req.params;
        const { isActive } = req.body;
        if (!businessId) {
            res.status(403).json({
                success: false,
                message: "No business associated with this user",
            });
            return;
        }
        if (!isValidObjectId(id)) {
            res.status(400).json({
                success: false,
                message: "Invalid customer ID",
            });
            return;
        }
        if (typeof isActive !== "boolean") {
            res.status(400).json({
                success: false,
                message: "isActive must be a boolean",
            });
            return;
        }
        const customer = await Customer_1.default.findOne({
            _id: id,
            businessId,
        });
        if (!customer) {
            res.status(404).json({
                success: false,
                message: "Customer not found",
            });
            return;
        }
        customer.isActive = isActive;
        await customer.save();
        if (customer.userId) {
            await user_1.default.findByIdAndUpdate(customer.userId, { isActive });
        }
        res.status(200).json({
            success: true,
            message: `Customer ${isActive ? "activated" : "deactivated"} successfully`,
            data: { customer },
        });
    }
    catch (error) {
        console.error("ToggleCustomerStatus error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
exports.toggleCustomerStatus = toggleCustomerStatus;
// RESTORE CUSTOMER
// PATCH /api/customers/:id/restore
const restoreCustomer = async (req, res) => {
    try {
        const businessId = req.user?.businessId;
        const { id } = req.params;
        if (!businessId) {
            res.status(403).json({
                success: false,
                message: "No business associated with this user",
            });
            return;
        }
        if (!isValidObjectId(id)) {
            res.status(400).json({
                success: false,
                message: "Invalid customer ID",
            });
            return;
        }
        const customer = await Customer_1.default.findOne({
            _id: id,
            businessId,
        });
        if (!customer) {
            res.status(404).json({
                success: false,
                message: "Customer not found",
            });
            return;
        }
        customer.isActive = true;
        await customer.save();
        if (customer.userId) {
            await user_1.default.findByIdAndUpdate(customer.userId, { isActive: true });
        }
        res.status(200).json({
            success: true,
            message: "Customer restored successfully",
            data: {
                customer,
            },
        });
    }
    catch (error) {
        console.error("RestoreCustomer error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
exports.restoreCustomer = restoreCustomer;
