import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { analyzeReceiptFile } from "../service/ai.service";
import Expense from "../models/Expense";

export const extractExpenseData = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const businessId = req.user?.businessId;
    const userId = req.user?.userId;
    const file = req.file;

    // ==========================================
    // AUTH CHECK
    // ==========================================

    if (!businessId || !userId) {
      res.status(403).json({
        success: false,
        message: "Business ama user lama helin.",
      });
      return;
    }

    // ==========================================
    // FILE CHECK
    // ==========================================

    if (!file) {
      res.status(400).json({
        success: false,
        message:
          "Fadlan soo geli receipt ama invoice (JPG, PNG, WEBP ama PDF).",
      });
      return;
    }

    // ==========================================
    // AI ANALYSIS
    // ==========================================

    const extractedData = await analyzeReceiptFile(
      file.buffer,
      file.mimetype
    );

    // ==========================================
    // VALIDATE AI DATA
    // ==========================================

    if (
      !extractedData ||
      !extractedData.vendorName ||
      typeof extractedData.totalAmount !== "number"
    ) {
      res.status(422).json({
        success: false,
        message: "AI-gu ma soo saari karin xogta muhiimka ah ee receipt-ka.",
        data: extractedData,
      });
      return;
    }

    // ==========================================
    // DATE
    // ==========================================

    const expenseDate = new Date(extractedData.date);

    const validDate = !isNaN(expenseDate.getTime())
      ? expenseDate
      : new Date();

    // ==========================================
    // CREATE EXPENSE
    // ==========================================

    const expense = await Expense.create({
      businessId,

      title: `${extractedData.vendorName} Expense`,

      category: extractedData.category || "other",

      amount: extractedData.totalAmount,

      expenseDate: validDate,

      paymentMethod:
        extractedData.paymentMethod || "other",

      vendor: extractedData.vendorName,

      referenceNumber:
        extractedData.accountOrSQN || undefined,

      notes: extractedData.customerName
        ? `Customer: ${extractedData.customerName}`
        : undefined,

      createdById: userId,
    });

    // ==========================================
    // RESPONSE
    // ==========================================

    res.status(201).json({
      success: true,
      message: "Receipt-ka waa la akhriyey, Expense-na database-ka waa lagu kaydiyey.",
      data: {
        extracted: extractedData,
        expense,
      },
    });
  } catch (error: any) {
    console.error("AI Controller Error:", error);

    res.status(500).json({
      success: false,
      message:
        error?.message ||
        "Waxaa dhacay cilad intii AI-gu shaqaynayay.",
    });
  }
};