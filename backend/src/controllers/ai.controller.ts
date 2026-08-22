import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { analyzeReceiptFile } from "../service/ai.service";
import Expense, { IExpense, ExpenseCategory } from "../models/Expense";
import Invoice, { IInvoice } from "../models/Invoice";
import { normalizeRole } from "../constants/roles";

interface ExtractedReceiptData {
  vendorName: string;
  date?: string | null;
  totalAmount: number;
  customerName?: string | null;
  accountOrSQN?: string | null;
  category?: string;
  paymentMethod?: string;
}

const VALID_CATEGORIES = [
  "rent",
  "salaries",
  "utilities",
  "marketing",
  "supplies",
  "equipment",
  "maintenance",
  "taxes",
  "other",
] as const;

const VALID_PAYMENT_METHODS = [
  "cash",
  "bank_transfer",
  "mobile_money",
  "credit_card",
  "cheque",
  "other",
] as const;

const parseExtractedData = (raw: Record<string, unknown>): ExtractedReceiptData | null => {
  const vendorName = raw.vendorName;
  const totalAmount = raw.totalAmount;

  if (typeof vendorName !== "string" || !vendorName.trim()) {
    return null;
  }

  if (typeof totalAmount !== "number" || !Number.isFinite(totalAmount) || totalAmount <= 0) {
    return null;
  }

  const category =
    typeof raw.category === "string" &&
    VALID_CATEGORIES.includes(raw.category as (typeof VALID_CATEGORIES)[number])
      ? raw.category
      : "other";

  const paymentMethod =
    typeof raw.paymentMethod === "string" &&
    VALID_PAYMENT_METHODS.includes(
      raw.paymentMethod as (typeof VALID_PAYMENT_METHODS)[number]
    )
      ? raw.paymentMethod
      : "other";

  return {
    vendorName: vendorName.trim(),
    date: typeof raw.date === "string" ? raw.date : null,
    totalAmount,
    customerName: typeof raw.customerName === "string" ? raw.customerName : null,
    accountOrSQN: typeof raw.accountOrSQN === "string" ? raw.accountOrSQN : null,
    category,
    paymentMethod,
  };
};

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

    const extractedData = parseExtractedData(
      await analyzeReceiptFile(file.buffer, file.mimetype)
    );

    if (!extractedData) {
      res.status(422).json({
        success: false,
        message: "AI-gu ma soo saari karin xogta muhiimka ah ee receipt-ka.",
      });
      return;
    }

    const expenseDate = extractedData.date
      ? new Date(extractedData.date)
      : new Date();

    const validDate = !isNaN(expenseDate.getTime()) ? expenseDate : new Date();

    const expense = await Expense.create({
      businessId,
      title: `${extractedData.vendorName} Expense`,
      category: (extractedData.category || "other") as ExpenseCategory,
      amount: extractedData.totalAmount,
      expenseDate: validDate,
      paymentMethod: extractedData.paymentMethod || "other",
      vendor: extractedData.vendorName,
      referenceNumber: extractedData.accountOrSQN || undefined,
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
  } catch (error) {
    console.error("AI Controller Error:", error);

    res.status(500).json({
      success: false,
      message: "Waxaa dhacay cilad intii AI-gu shaqaynayay.",
    });
  }
};

/**
 * @route   GET /api/ai/insights
 * @desc    Generate executive & operational financial insights dynamically based on business data
 * @access  Private
 */
export const getAiInsights = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const businessId = req.user?.businessId;
    const role = req.user?.role || "customer";

    if (!businessId) {
      res.status(403).json({
        success: false,
        message: "Business information not found",
      });
      return;
    }

    const normalizedRole = normalizeRole(role);
    const isExecutive = ["superAdmin", "owner", "accountant"].includes(normalizedRole);

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    const [expenses, overdueInvoices, recentInvoices, currentMonthExpenses, lastMonthExpenses, paidInvoices] =
      await Promise.all([
        Expense.find({ businessId }).sort({ expenseDate: -1 }).limit(100),
        Invoice.find({
          businessId,
          status: { $ne: "cancelled" },
          balanceDue: { $gt: 0 },
          $or: [{ status: "overdue" }, { dueDate: { $lt: now } }],
        }),
        Invoice.find({ businessId }).sort({ createdAt: -1 }).limit(20),
        Expense.find({ businessId, expenseDate: { $gte: monthStart } }),
        Expense.find({
          businessId,
          expenseDate: { $gte: lastMonthStart, $lte: lastMonthEnd },
        }),
        Invoice.find({
          businessId,
          status: { $in: ["paid", "partially_paid"] },
          issueDate: { $gte: monthStart },
        }),
      ]);

    const totalOverdue = overdueInvoices.reduce(
      (sum: number, i: IInvoice) => sum + (i.balanceDue || 0),
      0
    );
    const overdueCount = overdueInvoices.length;

    const categoryTotals: Record<string, number> = {};
    let totalExpenseAmount = 0;
    expenses.forEach((e: IExpense) => {
      categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
      totalExpenseAmount += e.amount;
    });

    let topCategory = "Other";
    let topCategoryAmount = 0;
    Object.entries(categoryTotals).forEach(([cat, amt]) => {
      if (amt > topCategoryAmount) {
        topCategoryAmount = amt;
        topCategory = cat.charAt(0).toUpperCase() + cat.slice(1);
      }
    });

    const topCategoryPercent =
      totalExpenseAmount > 0
        ? Math.round((topCategoryAmount / totalExpenseAmount) * 100)
        : 0;

    const currentMonthTotal = currentMonthExpenses.reduce((s, e) => s + e.amount, 0);
    const lastMonthTotal = lastMonthExpenses.reduce((s, e) => s + e.amount, 0);
    const expenseChangePercent =
      lastMonthTotal > 0
        ? Math.round(((currentMonthTotal - lastMonthTotal) / lastMonthTotal) * 100)
        : currentMonthTotal > 0
          ? 100
          : 0;

    const monthlyRevenue = paidInvoices.reduce((s, i) => s + (i.paidAmount || 0), 0);

    type InsightItem = {
      id: string;
      type: "alert-warning" | "alert-overdue" | "category" | "cashflow" | "processing";
      title: string;
      subtitle?: string;
      body: string;
      actionLabel?: string;
    };

    const insights: InsightItem[] = [];

    if (expenses.length === 0 && overdueCount === 0 && recentInvoices.length === 0) {
      insights.push({
        id: "empty",
        type: "processing",
        title: "Limited data available",
        body: "Add invoices, expenses, or receipts to generate meaningful AI insights for your business.",
      });
    } else if (isExecutive) {
      if (currentMonthTotal > 0 || lastMonthTotal > 0) {
        insights.push({
          id: "expense-trend",
          type: "alert-warning",
          title:
            expenseChangePercent >= 0
              ? `Expenses ${expenseChangePercent > 0 ? "increased" : "unchanged"} this month`
              : "Expenses decreased this month",
          body: `Current month expenses: $${currentMonthTotal.toLocaleString("en-US", { minimumFractionDigits: 2 })} (${expenseChangePercent >= 0 ? "+" : ""}${expenseChangePercent}% vs last month). Top category: ${topCategory} (${topCategoryPercent}%).`,
          actionLabel: "View Expense Breakdown",
        });
      }

      if (overdueCount > 0) {
        insights.push({
          id: "overdue",
          type: "alert-overdue",
          title: `${overdueCount} invoice${overdueCount === 1 ? "" : "s"} overdue`,
          body: `Total outstanding overdue balance: $${totalOverdue.toLocaleString("en-US", { minimumFractionDigits: 2 })}. Follow up with customers to improve cash flow.`,
          actionLabel: "Review Outstanding",
        });
      }

      if (topCategoryAmount > 0) {
        insights.push({
          id: "category",
          type: "category",
          title: "Category Analysis",
          subtitle: `${topCategory} is your largest expense category.`,
          body: `Accounting for ${topCategoryPercent}% of tracked expenses ($${topCategoryAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}).`,
        });
      }

      insights.push({
        id: "cashflow",
        type: "cashflow",
        title: "Cash Flow Snapshot",
        subtitle: monthlyRevenue > 0 ? "Revenue collected this month" : "No payments recorded this month",
        body:
          monthlyRevenue > 0
            ? `$${monthlyRevenue.toLocaleString("en-US", { minimumFractionDigits: 2 })} collected against $${currentMonthTotal.toLocaleString("en-US", { minimumFractionDigits: 2 })} in expenses.`
            : "Record payments on sent invoices to track cash flow accurately.",
      });
    } else {
      insights.push({
        id: "ops-status",
        type: "category",
        title: "Operational Status",
        subtitle: `${recentInvoices.length} recent invoice${recentInvoices.length === 1 ? "" : "s"}`,
        body: "Ensure pending receipts are uploaded and validated before month-end closing.",
      });

      if (overdueCount > 0) {
        insights.push({
          id: "ops-overdue",
          type: "alert-overdue",
          title: `${overdueCount} overdue invoice${overdueCount === 1 ? "" : "s"} need attention`,
          body: "Coordinate with finance to dispatch payment reminders.",
          actionLabel: "View Overdue Invoices",
        });
      }

      insights.push({
        id: "scan-ready",
        type: "processing",
        title: "Receipt Scanner Ready",
        body: "Upload receipt images or PDFs to extract expense data automatically.",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        role,
        isExecutive,
        insights,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("getAiInsights error:", error);
    res.status(500).json({
      success: false,
      message: "Error generating AI insights",
    });
  }
};