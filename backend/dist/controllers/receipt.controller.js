"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteReceipt = exports.updateReceipt = exports.getReceiptById = exports.createReceipt = exports.getReceipts = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Expense_1 = __importDefault(require("../models/Expense"));
const roles_1 = require("../constants/roles");
const isValidObjectId = (id) => typeof id === "string" && mongoose_1.default.Types.ObjectId.isValid(id);
const buildReceiptFilter = (req) => {
    const businessId = req.user?.businessId;
    const userId = req.user?.userId;
    const role = req.user?.role;
    if (!businessId || !userId || !role) {
        return { filter: {}, denied: true };
    }
    const filter = { businessId };
    const canViewAll = (0, roles_1.rolesMatch)(role, "superAdmin", "owner", "accountant");
    if (!canViewAll) {
        filter.createdById = userId;
    }
    return { filter, denied: false };
};
const formatReceipt = (exp) => {
    const isPending = !exp.vendor || exp.category === "other";
    return {
        id: exp._id.toString(),
        date: new Date(exp.expenseDate).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        }),
        merchant: exp.vendor || exp.title || "General Vendor",
        category: exp.category
            ? exp.category.charAt(0).toUpperCase() + exp.category.slice(1)
            : "Other",
        amount: exp.amount,
        status: isPending ? "Pending" : "Reviewed",
        notes: exp.notes,
        createdByName: typeof exp.createdById === "object" &&
            exp.createdById &&
            "name" in exp.createdById
            ? String(exp.createdById.name)
            : "Staff",
    };
};
/**
 * @route   GET /api/receipts
 * @desc    Get receipts with RBAC data filtering & live stats
 * @access  Private (Role-scoped)
 */
const getReceipts = async (req, res) => {
    try {
        const { filter, denied } = buildReceiptFilter(req);
        if (denied) {
            res.status(403).json({
                success: false,
                message: "Business or user unauthorized",
            });
            return;
        }
        const page = Math.max(1, parseInt(req.query.page, 10) || 1);
        const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
        const skip = (page - 1) * limit;
        const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
        const statusFilter = typeof req.query.status === "string"
            ? req.query.status.trim().toLowerCase()
            : undefined;
        if (statusFilter === "pending") {
            filter.$or = [
                { vendor: { $exists: false } },
                { vendor: null },
                { vendor: "" },
                { category: "other" },
            ];
        }
        else if (statusFilter === "reviewed") {
            filter.vendor = { $exists: true, $nin: [null, ""] };
            filter.category = { $ne: "other" };
        }
        if (search) {
            const regex = new RegExp(search, "i");
            const searchClause = {
                $or: [{ title: regex }, { vendor: regex }, { category: regex }],
            };
            if (filter.$or && statusFilter === "pending") {
                filter.$and = [{ $or: filter.$or }, searchClause];
                delete filter.$or;
            }
            else {
                Object.assign(filter, searchClause);
            }
        }
        const [expenses, totalCount, statsExpenses] = await Promise.all([
            Expense_1.default.find(filter)
                .populate("createdById", "name email role")
                .sort({ expenseDate: -1 })
                .skip(skip)
                .limit(limit),
            Expense_1.default.countDocuments(filter),
            Expense_1.default.find(filter),
        ]);
        const totalAmountYTD = statsExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
        const pendingReviewCount = statsExpenses.filter((e) => !e.vendor || e.category === "other").length;
        const receipts = expenses.map(formatReceipt);
        const totalPages = Math.ceil(totalCount / limit) || 1;
        res.status(200).json({
            success: true,
            data: {
                receipts,
                stats: {
                    totalScanned: totalCount,
                    pendingReview: pendingReviewCount,
                    totalAmountYTD,
                },
                pagination: {
                    total: totalCount,
                    page,
                    limit,
                    totalPages,
                    pages: totalPages,
                },
            },
        });
    }
    catch (error) {
        console.error("getReceipts error:", error);
        res.status(500).json({
            success: false,
            message: "Error retrieving receipts",
        });
    }
};
exports.getReceipts = getReceipts;
/**
 * @route   POST /api/receipts
 * @desc    Create a receipt entry
 * @access  Private
 */
const createReceipt = async (req, res) => {
    try {
        const businessId = req.user?.businessId;
        const userId = req.user?.userId;
        if (!businessId || !userId) {
            res.status(403).json({ success: false, message: "Unauthorized" });
            return;
        }
        const { merchant, amount, category, date, notes } = req.body;
        if (!merchant || !amount) {
            res.status(400).json({
                success: false,
                message: "Merchant and amount are required",
            });
            return;
        }
        const expense = await Expense_1.default.create({
            businessId,
            title: `${merchant} Receipt`,
            vendor: merchant,
            amount: Number(amount),
            category: (category?.toLowerCase() || "other"),
            expenseDate: date ? new Date(date) : new Date(),
            paymentMethod: "other",
            notes,
            createdById: userId,
        });
        res.status(201).json({
            success: true,
            message: "Receipt saved successfully",
            data: { receipt: formatReceipt(expense) },
        });
    }
    catch (error) {
        console.error("createReceipt error:", error);
        res.status(500).json({
            success: false,
            message: "Error saving receipt",
        });
    }
};
exports.createReceipt = createReceipt;
const getReceiptById = async (req, res) => {
    try {
        const { id } = req.params;
        const { filter, denied } = buildReceiptFilter(req);
        if (denied) {
            res.status(403).json({ success: false, message: "Unauthorized" });
            return;
        }
        if (!isValidObjectId(id)) {
            res.status(400).json({ success: false, message: "Invalid receipt ID" });
            return;
        }
        const expense = await Expense_1.default.findOne({ _id: id, ...filter }).populate("createdById", "name email role");
        if (!expense) {
            res.status(404).json({ success: false, message: "Receipt not found" });
            return;
        }
        res.status(200).json({
            success: true,
            data: { receipt: formatReceipt(expense) },
        });
    }
    catch (error) {
        console.error("getReceiptById error:", error);
        res.status(500).json({ success: false, message: "Error retrieving receipt" });
    }
};
exports.getReceiptById = getReceiptById;
const updateReceipt = async (req, res) => {
    try {
        const { id } = req.params;
        const { filter, denied } = buildReceiptFilter(req);
        if (denied) {
            res.status(403).json({ success: false, message: "Unauthorized" });
            return;
        }
        if (!isValidObjectId(id)) {
            res.status(400).json({ success: false, message: "Invalid receipt ID" });
            return;
        }
        const expense = await Expense_1.default.findOne({ _id: id, ...filter });
        if (!expense) {
            res.status(404).json({ success: false, message: "Receipt not found" });
            return;
        }
        const { merchant, amount, category, date, notes } = req.body;
        if (merchant !== undefined) {
            if (typeof merchant !== "string" || !merchant.trim()) {
                res.status(400).json({ success: false, message: "Invalid merchant name" });
                return;
            }
            expense.vendor = merchant.trim();
            expense.title = `${merchant.trim()} Receipt`;
        }
        if (amount !== undefined) {
            const parsed = Number(amount);
            if (!Number.isFinite(parsed) || parsed <= 0) {
                res.status(400).json({ success: false, message: "Invalid amount" });
                return;
            }
            expense.amount = parsed;
        }
        if (category !== undefined) {
            expense.category = String(category).toLowerCase();
        }
        if (date !== undefined) {
            const parsedDate = new Date(date);
            if (Number.isNaN(parsedDate.getTime())) {
                res.status(400).json({ success: false, message: "Invalid date" });
                return;
            }
            expense.expenseDate = parsedDate;
        }
        if (notes !== undefined) {
            expense.notes = typeof notes === "string" ? notes.trim() : undefined;
        }
        await expense.save();
        res.status(200).json({
            success: true,
            message: "Receipt updated successfully",
            data: { receipt: formatReceipt(expense) },
        });
    }
    catch (error) {
        console.error("updateReceipt error:", error);
        res.status(500).json({ success: false, message: "Error updating receipt" });
    }
};
exports.updateReceipt = updateReceipt;
const deleteReceipt = async (req, res) => {
    try {
        const { id } = req.params;
        const role = req.user?.role;
        const { filter, denied } = buildReceiptFilter(req);
        if (denied || !role) {
            res.status(403).json({ success: false, message: "Unauthorized" });
            return;
        }
        if (!(0, roles_1.rolesMatch)(role, "superAdmin", "owner", "accountant")) {
            res.status(403).json({
                success: false,
                message: "You do not have permission to delete receipts",
            });
            return;
        }
        if (!isValidObjectId(id)) {
            res.status(400).json({ success: false, message: "Invalid receipt ID" });
            return;
        }
        const expense = await Expense_1.default.findOneAndDelete({ _id: id, ...filter });
        if (!expense) {
            res.status(404).json({ success: false, message: "Receipt not found" });
            return;
        }
        res.status(200).json({
            success: true,
            message: "Receipt deleted successfully",
        });
    }
    catch (error) {
        console.error("deleteReceipt error:", error);
        res.status(500).json({ success: false, message: "Error deleting receipt" });
    }
};
exports.deleteReceipt = deleteReceipt;
