import { Response } from "express";
import mongoose from "mongoose";
import Expense, { ExpenseCategory } from "../models/Expense";
import { AuthRequest } from "../middleware/auth.middleware";

const roundMoney = (value: number): number => {
  return Math.round((value + Number.EPSILON) * 100) / 100;
};

const isValidObjectId = (id: unknown): id is string => {
  return typeof id === "string" && mongoose.Types.ObjectId.isValid(id);
};

const isNonEmptyString = (val: unknown): val is string => {
  return typeof val === "string" && val.trim().length > 0;
};

/**
 * @route   POST /api/expenses
 * @desc    Create a new expense entry
 * @access  Private
 */
export const createExpense = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const businessId = req.user?.businessId;
    const userId = req.user?.userId;

    if (!businessId || !userId) {
      res.status(403).json({ success: false, message: "Unauthorized access" });
      return;
    }

    const {
      title,
      category,
      amount,
      expenseDate,
      paymentMethod,
      vendor,
      referenceNumber,
      notes,
    } = req.body;

    if (!isNonEmptyString(title)) {
      res.status(400).json({ success: false, message: "Expense title is required" });
      return;
    }

    const expAmount = Number(amount);
    if (isNaN(expAmount) || expAmount <= 0) {
      res.status(400).json({ success: false, message: "Amount must be greater than zero" });
      return;
    }

    const expense = await Expense.create({
      businessId,
      title: title.trim(),
      category: (category as ExpenseCategory) || "other",
      amount: roundMoney(expAmount),
      expenseDate: expenseDate ? new Date(expenseDate) : new Date(),
      paymentMethod: paymentMethod || "cash",
      vendor: vendor ? String(vendor).trim() : undefined,
      referenceNumber: referenceNumber ? String(referenceNumber).trim() : undefined,
      notes: notes ? String(notes).trim() : undefined,
      createdById: userId,
    });

    res.status(201).json({
      success: true,
      message: "Expense recorded successfully",
      data: { expense },
    });
  } catch (error) {
    console.error("CreateExpense error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * @route   GET /api/expenses
 * @desc    Get all expenses with filtering, date range & pagination
 * @access  Private
 */
export const getExpenses = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const businessId = req.user?.businessId;
    if (!businessId) {
      res.status(403).json({ success: false, message: "No business associated with this user" });
      return;
    }

    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string, 10) || 10));
    const skip = (page - 1) * limit;

    const { category, search, startDate, endDate } = req.query;
    const filter: Record<string, any> = { businessId };

    if (category) filter.category = category;

    if (isNonEmptyString(search as string)) {
      const regex = new RegExp((search as string).trim(), "i");
      filter.$or = [{ title: regex }, { vendor: regex }, { referenceNumber: regex }];
    }

    if (startDate || endDate) {
      filter.expenseDate = {};
      if (startDate) filter.expenseDate.$gte = new Date(startDate as string);
      if (endDate) filter.expenseDate.$lte = new Date(endDate as string);
    }

    const [expenses, total] = await Promise.all([
      Expense.find(filter)
        .populate("createdById", "name email")
        .sort({ expenseDate: -1 })
        .skip(skip)
        .limit(limit),
      Expense.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: {
        expenses,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("GetExpenses error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * @route   GET /api/expenses/:id
 * @desc    Get single expense by ID
 * @access  Private
 */
export const getExpenseById = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const businessId = req.user?.businessId;
    const { id } = req.params;

    if (!businessId) {
      res.status(403).json({ success: false, message: "Unauthorized access" });
      return;
    }

    if (!isValidObjectId(id)) {
      res.status(400).json({ success: false, message: "Invalid expense ID" });
      return;
    }

    const expense = await Expense.findOne({ _id: id, businessId }).populate(
      "createdById",
      "name email"
    );

    if (!expense) {
      res.status(404).json({ success: false, message: "Expense record not found" });
      return;
    }

    res.status(200).json({ success: true, data: { expense } });
  } catch (error) {
    console.error("GetExpenseById error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * @route   PUT /api/expenses/:id
 * @desc    Update an expense record
 * @access  Private
 */
export const updateExpense = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const businessId = req.user?.businessId;
    const { id } = req.params;

    if (!businessId) {
      res.status(403).json({ success: false, message: "Unauthorized access" });
      return;
    }

    if (!isValidObjectId(id)) {
      res.status(400).json({ success: false, message: "Invalid expense ID" });
      return;
    }

    const expense = await Expense.findOne({ _id: id, businessId });
    if (!expense) {
      res.status(404).json({ success: false, message: "Expense record not found" });
      return;
    }

    const {
      title,
      category,
      amount,
      expenseDate,
      paymentMethod,
      vendor,
      referenceNumber,
      notes,
    } = req.body;

    if (title !== undefined) expense.title = title.trim();
    if (category !== undefined) expense.category = category;
    if (amount !== undefined) expense.amount = roundMoney(Number(amount));
    if (expenseDate !== undefined) expense.expenseDate = new Date(expenseDate);
    if (paymentMethod !== undefined) expense.paymentMethod = paymentMethod;
    if (vendor !== undefined) expense.vendor = vendor;
    if (referenceNumber !== undefined) expense.referenceNumber = referenceNumber;
    if (notes !== undefined) expense.notes = notes;

    await expense.save();

    res.status(200).json({
      success: true,
      message: "Expense updated successfully",
      data: { expense },
    });
  } catch (error) {
    console.error("UpdateExpense error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * @route   DELETE /api/expenses/:id
 * @desc    Delete an expense record
 * @access  Private (Owner / Admin)
 */
export const deleteExpense = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const businessId = req.user?.businessId;
    const { id } = req.params;

    if (!businessId) {
      res.status(403).json({ success: false, message: "Unauthorized access" });
      return;
    }

    if (!isValidObjectId(id)) {
      res.status(400).json({ success: false, message: "Invalid expense ID" });
      return;
    }

    const expense = await Expense.findOneAndDelete({ _id: id, businessId });
    if (!expense) {
      res.status(404).json({ success: false, message: "Expense record not found" });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Expense deleted successfully",
    });
  } catch (error) {
    console.error("DeleteExpense error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};