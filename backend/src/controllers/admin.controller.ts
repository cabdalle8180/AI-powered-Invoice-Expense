import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import User from "../models/user";
import Business from "../models/Business";
import Customer from "../models/Customer";
import Invoice from "../models/Invoice";
import Expense from "../models/Expense";
import Payment from "../models/Payment";

/**
 * @route   GET /api/admin/stats
 * @desc    Get system-wide statistics (SuperAdmin only)
 * @access  Private (superAdmin)
 */
export const getAdminStats = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    const [
      totalBusinesses,
      activeBusinesses,
      totalUsers,
      activeUsers,
      totalCustomers,
      activeCustomers,
      totalInvoices,
      totalExpenses,
      totalPayments,
      recentInvoices,
      recentExpenses,
      recentPayments,
      thisMonthInvoices,
      lastMonthInvoices,
      thisMonthExpenses,
      lastMonthExpenses,
      thisMonthPayments,
      lastMonthPayments,
    ] = await Promise.all([
      Business.countDocuments(),
      Business.countDocuments({ isActive: true }),
      User.countDocuments({ role: { $ne: "customer" } }),
      User.countDocuments({ role: { $ne: "customer" }, isActive: true }),
      Customer.countDocuments(),
      Customer.countDocuments({ isActive: true }),
      Invoice.countDocuments(),
      Expense.countDocuments(),
      Payment.countDocuments({ isVoided: false }),
      Invoice.find().sort({ createdAt: -1 }).limit(5).populate("businessId", "name"),
      Expense.find().sort({ createdAt: -1 }).limit(5).populate("businessId", "name"),
      Payment.find({ isVoided: false }).sort({ createdAt: -1 }).limit(5).populate("businessId", "name"),
      Invoice.find({
        issueDate: { $gte: startOfMonth },
        status: { $ne: "cancelled" },
      }),
      Invoice.find({
        issueDate: { $gte: startOfLastMonth, $lte: endOfLastMonth },
        status: { $ne: "cancelled" },
      }),
      Expense.find({ expenseDate: { $gte: startOfMonth } }),
      Expense.find({ expenseDate: { $gte: startOfLastMonth, $lte: endOfLastMonth } }),
      Payment.find({ paymentDate: { $gte: startOfMonth }, isVoided: false }),
      Payment.find({ paymentDate: { $gte: startOfLastMonth, $lte: endOfLastMonth }, isVoided: false }),
    ]);

    // Revenue metrics
    const totalRevenue = thisMonthInvoices.reduce((s, i) => s + (i.total || 0), 0);
    const lastMonthRevenue = lastMonthInvoices.reduce((s, i) => s + (i.total || 0), 0);
    const revenueGrowth = lastMonthRevenue > 0
      ? Math.round(((totalRevenue - lastMonthRevenue) / lastMonthRevenue) * 100)
      : totalRevenue > 0 ? 100 : 0;

    // Expense metrics
    const totalExpensesAmount = thisMonthExpenses.reduce((s, e) => s + (e.amount || 0), 0);
    const lastMonthExpensesAmount = lastMonthExpenses.reduce((s, e) => s + (e.amount || 0), 0);
    const expenseGrowth = lastMonthExpensesAmount > 0
      ? Math.round(((totalExpensesAmount - lastMonthExpensesAmount) / lastMonthExpensesAmount) * 100)
      : 0;

    // Payment metrics
    const totalPaymentsAmount = thisMonthPayments.reduce((s, p) => s + (p.amount || 0), 0);
    const lastMonthPaymentsAmount = lastMonthPayments.reduce((s, p) => s + (p.amount || 0), 0);
    const paymentGrowth = lastMonthPaymentsAmount > 0
      ? Math.round(((totalPaymentsAmount - lastMonthPaymentsAmount) / lastMonthPaymentsAmount) * 100)
      : 0;

    // Outstanding balances (all invoices with balance due > 0)
    const allPendingInvoices = await Invoice.find({
      balanceDue: { $gt: 0 },
      status: { $ne: "cancelled" },
    }).select("total balanceDue status dueDate businessId");

    const totalOutstanding = allPendingInvoices.reduce((s, i) => s + (i.balanceDue || 0), 0);
    const overdueInvoices = allPendingInvoices.filter(
      (i) => i.status === "overdue" || new Date(i.dueDate) < now
    );
    const totalOverdue = overdueInvoices.reduce((s, i) => s + (i.balanceDue || 0), 0);

    // Invoice status breakdown
    const [draftCount, sentCount, paidCount, overdueCount, cancelledCount] = await Promise.all([
      Invoice.countDocuments({ status: "draft" }),
      Invoice.countDocuments({ status: "sent" }),
      Invoice.countDocuments({ status: "paid" }),
      Invoice.countDocuments({ status: "overdue" }),
      Invoice.countDocuments({ status: "cancelled" }),
    ]);

    // Recent activities feed
    type ActivityItem = {
      type: string;
      description: string;
      amount?: string;
      time: Date;
      status?: string;
    };

    const activities: ActivityItem[] = [
      ...recentInvoices.map((inv) => ({
        type: "invoice",
        description: `Invoice ${inv.invoiceNumber} created`,
        amount: `$${(inv.total || 0).toFixed(2)}`,
        time: inv.createdAt,
        status: inv.status,
      })),
      ...recentExpenses.map((exp) => ({
        type: "expense",
        description: `Expense: ${exp.title}`,
        amount: `$${(exp.amount || 0).toFixed(2)}`,
        time: exp.createdAt,
        status: exp.category,
      })),
      ...recentPayments.map((pmt) => ({
        type: "payment",
        description: `Payment received`,
        amount: `$${(pmt.amount || 0).toFixed(2)}`,
        time: pmt.createdAt,
        status: "received",
      })),
    ]
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice(0, 10);

    // 6-month monthly trends for charts
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const [revenueTrends, expenseTrends] = await Promise.all([
      Invoice.aggregate([
        {
          $match: {
            issueDate: { $gte: sixMonthsAgo },
            status: { $ne: "cancelled" },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: "$issueDate" },
              month: { $month: "$issueDate" },
            },
            total: { $sum: "$total" },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ]),
      Expense.aggregate([
        {
          $match: {
            expenseDate: { $gte: sixMonthsAgo },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: "$expenseDate" },
              month: { $month: "$expenseDate" },
            },
            total: { $sum: "$amount" },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ]),
    ]);

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const y = d.getFullYear();
      const m = d.getMonth() + 1;
      const monthLabel = monthNames[d.getMonth()];

      const revItem = revenueTrends.find((r) => r._id.year === y && r._id.month === m);
      const expItem = expenseTrends.find((e) => e._id.year === y && e._id.month === m);

      monthlyData.push({
        month: monthLabel,
        year: y,
        revenue: revItem ? Math.round(revItem.total * 100) / 100 : 0,
        expenses: expItem ? Math.round(expItem.total * 100) / 100 : 0,
      });
    }

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalBusinesses,
          activeBusinesses,
          inactiveBusinesses: totalBusinesses - activeBusinesses,
          totalUsers,
          activeUsers,
          totalCustomers,
          activeCustomers,
          totalInvoices,
          totalExpenses,
          totalPayments,
          totalRevenue,
          totalOutstanding,
        },
        financial: {
          thisMonth: {
            revenue: totalRevenue,
            expenses: totalExpensesAmount,
            payments: totalPaymentsAmount,
            netProfit: totalRevenue - totalExpensesAmount,
          },
          growth: {
            revenue: revenueGrowth,
            expenses: expenseGrowth,
            payments: paymentGrowth,
          },
          outstanding: {
            total: totalOutstanding,
            overdue: totalOverdue,
            overdueCount: overdueInvoices.length,
            pendingCount: allPendingInvoices.length,
          },
          monthlyTrends: monthlyData,
        },
        invoiceStats: {
          draft: draftCount,
          sent: sentCount,
          paid: paidCount,
          overdue: overdueCount,
          cancelled: cancelledCount,
          total: totalInvoices,
        },
        recentActivities: activities,
      },
    });
  } catch (error) {
    console.error("getAdminStats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load admin statistics",
    });
  }
};
