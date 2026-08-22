"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOutstandingReport = exports.getRevenueReport = exports.getCustomerReport = exports.getPaymentReport = exports.getExpenseReport = exports.getInvoiceReport = exports.getReportsSummary = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Invoice_1 = __importDefault(require("../models/Invoice"));
const Expense_1 = __importDefault(require("../models/Expense"));
const Payment_1 = __importDefault(require("../models/Payment"));
const Customer_1 = __importDefault(require("../models/Customer"));
const roles_1 = require("../constants/roles");
const formatChange = (current, previous) => {
    if (previous === 0) {
        if (current === 0)
            return { change: "0%", changeDir: "up" };
        return { change: "+100%", changeDir: "up" };
    }
    const pct = Math.round(((current - previous) / previous) * 100);
    return {
        change: `${pct >= 0 ? "+" : ""}${pct}%`,
        changeDir: pct >= 0 ? "up" : "down",
    };
};
const resolvePeriodRange = (period, customFrom, customTo) => {
    const now = new Date();
    if (customFrom && customTo) {
        const startDate = new Date(customFrom);
        const endDate = new Date(customTo);
        endDate.setHours(23, 59, 59, 999);
        if (!Number.isNaN(startDate.getTime()) && !Number.isNaN(endDate.getTime())) {
            return { startDate, endDate, label: "Custom" };
        }
    }
    if (!period || period === "This Month") {
        return {
            startDate: new Date(now.getFullYear(), now.getMonth(), 1),
            endDate: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59),
            label: "This Month",
        };
    }
    if (period === "Today") {
        const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
        return { startDate: start, endDate: end, label: "Today" };
    }
    if (period === "This Week") {
        const day = now.getDay();
        const diff = day === 0 ? 6 : day - 1;
        const start = new Date(now);
        start.setDate(now.getDate() - diff);
        start.setHours(0, 0, 0, 0);
        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        end.setHours(23, 59, 59, 999);
        return { startDate: start, endDate: end, label: "This Week" };
    }
    if (period === "Last Month") {
        return {
            startDate: new Date(now.getFullYear(), now.getMonth() - 1, 1),
            endDate: new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59),
            label: "Last Month",
        };
    }
    if (period === "This Quarter") {
        const currentQuarter = Math.floor(now.getMonth() / 3);
        return {
            startDate: new Date(now.getFullYear(), currentQuarter * 3, 1),
            endDate: new Date(now.getFullYear(), (currentQuarter + 1) * 3, 0, 23, 59, 59),
            label: "This Quarter",
        };
    }
    if (period === "This Year") {
        return {
            startDate: new Date(now.getFullYear(), 0, 1),
            endDate: new Date(now.getFullYear(), 11, 31, 23, 59, 59),
            label: "This Year",
        };
    }
    return {
        startDate: new Date(now.getFullYear(), now.getMonth(), 1),
        endDate: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59),
        label: "This Month",
    };
};
const previousPeriodRange = (range) => {
    const durationMs = range.endDate.getTime() - range.startDate.getTime();
    const endDate = new Date(range.startDate.getTime() - 1);
    const startDate = new Date(endDate.getTime() - durationMs);
    return { startDate, endDate, label: "Previous Period" };
};
/**
 * Derives the business filter for multi-tenant queries.
 * SuperAdmin can query all or filter by req.query.businessId.
 * Other roles are strictly restricted to req.user.businessId.
 */
const resolveBusinessScope = (req) => {
    if (req.user?.role === "superAdmin") {
        const qBusinessId = req.query.businessId;
        if (qBusinessId && mongoose_1.default.Types.ObjectId.isValid(qBusinessId)) {
            return new mongoose_1.default.Types.ObjectId(qBusinessId);
        }
        return null; // System-wide for superAdmin
    }
    if (!req.user?.businessId || !mongoose_1.default.Types.ObjectId.isValid(req.user.businessId)) {
        return false; // Unauthorized / no business associated
    }
    return new mongoose_1.default.Types.ObjectId(req.user.businessId);
};
// ============================================================================
// 1. GET REPORTS SUMMARY (Executive Dashboard Cards & Metrics)
// ============================================================================
const getReportsSummary = async (req, res) => {
    try {
        const role = req.user?.role;
        if (!role || !(0, roles_1.rolesMatch)(role, "superAdmin", "owner", "accountant")) {
            res.status(403).json({
                success: false,
                message: "You do not have permission to access financial reports",
            });
            return;
        }
        const businessScope = resolveBusinessScope(req);
        if (businessScope === false) {
            res.status(403).json({
                success: false,
                message: "No business associated with this user account",
            });
            return;
        }
        const period = String(req.query.period || "This Month");
        const dateFrom = typeof req.query.dateFrom === "string" ? req.query.dateFrom : typeof req.query.startDate === "string" ? req.query.startDate : undefined;
        const dateTo = typeof req.query.dateTo === "string" ? req.query.dateTo : typeof req.query.endDate === "string" ? req.query.endDate : undefined;
        const range = resolvePeriodRange(period, dateFrom, dateTo);
        if (!range) {
            res.status(400).json({
                success: false,
                message: "Invalid custom date range",
            });
            return;
        }
        const previousRange = previousPeriodRange(range);
        const now = new Date();
        const invFilter = {
            issueDate: { $gte: range.startDate, $lte: range.endDate },
            status: { $ne: "cancelled" },
        };
        const expFilter = {
            expenseDate: { $gte: range.startDate, $lte: range.endDate },
        };
        const prevInvFilter = {
            issueDate: { $gte: previousRange.startDate, $lte: previousRange.endDate },
            status: { $ne: "cancelled" },
        };
        const prevExpFilter = {
            expenseDate: { $gte: previousRange.startDate, $lte: previousRange.endDate },
        };
        const allInvFilter = {
            status: { $ne: "cancelled" },
        };
        if (businessScope) {
            invFilter.businessId = businessScope;
            expFilter.businessId = businessScope;
            prevInvFilter.businessId = businessScope;
            prevExpFilter.businessId = businessScope;
            allInvFilter.businessId = businessScope;
        }
        const [invoices, expenses, previousInvoices, previousExpenses, allInvoices,] = await Promise.all([
            Invoice_1.default.find(invFilter),
            Expense_1.default.find(expFilter),
            Invoice_1.default.find(prevInvFilter),
            Expense_1.default.find(prevExpFilter),
            Invoice_1.default.find(allInvFilter),
        ]);
        const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
        const totalExpenses = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
        const previousRevenue = previousInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
        const previousExpensesTotal = previousExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
        const netProfit = totalRevenue - totalExpenses;
        const profitMargin = totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100) : 0;
        const outstandingInvoices = allInvoices.filter((inv) => (inv.balanceDue || 0) > 0);
        const totalOutstanding = outstandingInvoices.reduce((sum, inv) => sum + (inv.balanceDue || 0), 0);
        const overdueInvoices = outstandingInvoices.filter((inv) => inv.status === "overdue" || new Date(inv.dueDate) < now);
        const totalOverdue = overdueInvoices.reduce((sum, inv) => sum + (inv.balanceDue || 0), 0);
        const overduePercentage = totalOutstanding > 0 ? Math.round((totalOverdue / totalOutstanding) * 100) : 0;
        const revenueChange = formatChange(totalRevenue, previousRevenue);
        const expenseChange = formatChange(totalExpenses, previousExpensesTotal);
        const profitChange = formatChange(netProfit, previousRevenue - previousExpensesTotal);
        const cards = [
            {
                id: "1",
                title: "Revenue Report",
                subtitle: "Detailed income breakdown",
                amount: `$${totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                change: revenueChange.change,
                changeDir: revenueChange.changeDir,
                changeColor: revenueChange.changeDir === "up" ? "text-blue-500" : "text-red-500",
                chartColor: "#3b82f6",
                chartType: "bar",
            },
            {
                id: "2",
                title: "Expense Report",
                subtitle: "Operating costs analysis",
                amount: `$${totalExpenses.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                change: expenseChange.change,
                changeDir: expenseChange.changeDir,
                changeColor: expenseChange.changeDir === "up" ? "text-red-500" : "text-blue-500",
                chartColor: "#ef4444",
                chartType: "line",
            },
            {
                id: "3",
                title: "Profit & Loss",
                subtitle: "Net income statement",
                amount: `$${netProfit.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                change: profitChange.change,
                changeDir: profitChange.changeDir,
                changeColor: profitChange.changeDir === "up" ? "text-blue-500" : "text-red-500",
                chartColor: "#3b82f6",
                chartType: "progress",
                extra: `Margin: ${profitMargin}%`,
            },
            {
                id: "4",
                title: "Customer Balances",
                subtitle: "Accounts receivable",
                amount: `$${totalOutstanding.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                change: `${overduePercentage}% overdue`,
                changeDir: overduePercentage > 0 ? "down" : "up",
                changeColor: overduePercentage > 0 ? "text-red-500" : "text-blue-500",
                chartColor: "#ef4444",
                chartType: "donut",
                extra: `Overdue (${overduePercentage}%) • Current (${100 - overduePercentage}%)`,
            },
        ];
        const recentReports = [
            {
                name: `${range.label} Financial Summary`,
                range: `${range.startDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${range.endDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`,
                generatedBy: req.user?.userId ? "Authenticated User" : "System",
            },
            {
                name: "Aged Receivables Detail",
                range: `As of ${now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`,
                generatedBy: "Finance",
            },
        ];
        res.status(200).json({
            success: true,
            data: {
                period: range.label,
                cards,
                recentReports,
                metrics: {
                    totalRevenue,
                    totalExpenses,
                    netProfit,
                    profitMargin,
                    totalOutstanding,
                    totalOverdue,
                    overduePercentage,
                    overdueInvoiceCount: overdueInvoices.length,
                    outstandingInvoiceCount: outstandingInvoices.length,
                },
            },
        });
    }
    catch (error) {
        console.error("getReportsSummary error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error generating reports",
        });
    }
};
exports.getReportsSummary = getReportsSummary;
// ============================================================================
// 2. GET INVOICE REPORT
// ============================================================================
const getInvoiceReport = async (req, res) => {
    try {
        const businessScope = resolveBusinessScope(req);
        if (businessScope === false) {
            res.status(403).json({ success: false, message: "No business associated with this user" });
            return;
        }
        const page = Math.max(1, parseInt(req.query.page, 10) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
        const skip = (page - 1) * limit;
        const { status, customerId, search, period, startDate, endDate, sortBy, sortOrder } = req.query;
        const filter = {};
        if (businessScope)
            filter.businessId = businessScope;
        if (status && status !== "all") {
            filter.status = status;
        }
        if (customerId && mongoose_1.default.Types.ObjectId.isValid(customerId)) {
            filter.customerId = new mongoose_1.default.Types.ObjectId(customerId);
        }
        const range = resolvePeriodRange(period, startDate, endDate);
        if (range) {
            filter.issueDate = { $gte: range.startDate, $lte: range.endDate };
        }
        if (search && typeof search === "string" && search.trim().length > 0) {
            const searchRegex = new RegExp(search.trim(), "i");
            filter.$or = [
                { invoiceNumber: searchRegex },
                { notes: searchRegex },
            ];
        }
        const sortField = typeof sortBy === "string" ? sortBy : "issueDate";
        const sortDir = sortOrder === "asc" ? 1 : -1;
        const [invoices, total, allMatching] = await Promise.all([
            Invoice_1.default.find(filter)
                .populate("customerId", "name email phone")
                .populate("businessId", "name")
                .sort({ [sortField]: sortDir })
                .skip(skip)
                .limit(limit),
            Invoice_1.default.countDocuments(filter),
            Invoice_1.default.find(filter).select("total paidAmount balanceDue status"),
        ]);
        const summary = {
            totalInvoiced: allMatching.reduce((s, i) => s + (i.total || 0), 0),
            totalPaid: allMatching.reduce((s, i) => s + (i.paidAmount || 0), 0),
            totalBalanceDue: allMatching.reduce((s, i) => s + (i.balanceDue || 0), 0),
            invoiceCount: total,
        };
        res.status(200).json({
            success: true,
            data: invoices,
            summary,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit) || 1,
            },
        });
    }
    catch (error) {
        console.error("getInvoiceReport error:", error);
        res.status(500).json({ success: false, message: "Failed to generate invoice report" });
    }
};
exports.getInvoiceReport = getInvoiceReport;
// ============================================================================
// 3. GET EXPENSE REPORT
// ============================================================================
const getExpenseReport = async (req, res) => {
    try {
        const businessScope = resolveBusinessScope(req);
        if (businessScope === false) {
            res.status(403).json({ success: false, message: "No business associated with this user" });
            return;
        }
        const page = Math.max(1, parseInt(req.query.page, 10) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
        const skip = (page - 1) * limit;
        const { category, paymentMethod, search, period, startDate, endDate, sortBy, sortOrder } = req.query;
        const filter = {};
        if (businessScope)
            filter.businessId = businessScope;
        if (category && category !== "all") {
            filter.category = category;
        }
        if (paymentMethod && paymentMethod !== "all") {
            filter.paymentMethod = paymentMethod;
        }
        const range = resolvePeriodRange(period, startDate, endDate);
        if (range) {
            filter.expenseDate = { $gte: range.startDate, $lte: range.endDate };
        }
        if (search && typeof search === "string" && search.trim().length > 0) {
            const searchRegex = new RegExp(search.trim(), "i");
            filter.$or = [
                { title: searchRegex },
                { vendor: searchRegex },
                { referenceNumber: searchRegex },
                { notes: searchRegex },
            ];
        }
        const sortField = typeof sortBy === "string" ? sortBy : "expenseDate";
        const sortDir = sortOrder === "asc" ? 1 : -1;
        const [expenses, total, allMatching] = await Promise.all([
            Expense_1.default.find(filter)
                .populate("businessId", "name")
                .populate("createdById", "name email")
                .sort({ [sortField]: sortDir })
                .skip(skip)
                .limit(limit),
            Expense_1.default.countDocuments(filter),
            Expense_1.default.find(filter).select("amount category paymentMethod"),
        ]);
        const categoryBreakdown = {};
        const paymentMethodBreakdown = {};
        let totalExpenses = 0;
        for (const exp of allMatching) {
            totalExpenses += exp.amount || 0;
            categoryBreakdown[exp.category] = (categoryBreakdown[exp.category] || 0) + (exp.amount || 0);
            paymentMethodBreakdown[exp.paymentMethod] = (paymentMethodBreakdown[exp.paymentMethod] || 0) + (exp.amount || 0);
        }
        const summary = {
            totalExpenses,
            expenseCount: total,
            categoryBreakdown,
            paymentMethodBreakdown,
        };
        res.status(200).json({
            success: true,
            data: expenses,
            summary,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit) || 1,
            },
        });
    }
    catch (error) {
        console.error("getExpenseReport error:", error);
        res.status(500).json({ success: false, message: "Failed to generate expense report" });
    }
};
exports.getExpenseReport = getExpenseReport;
// ============================================================================
// 4. GET PAYMENT REPORT
// ============================================================================
const getPaymentReport = async (req, res) => {
    try {
        const businessScope = resolveBusinessScope(req);
        if (businessScope === false) {
            res.status(403).json({ success: false, message: "No business associated with this user" });
            return;
        }
        const page = Math.max(1, parseInt(req.query.page, 10) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
        const skip = (page - 1) * limit;
        const { paymentMethod, customerId, search, period, startDate, endDate, isVoided, sortBy, sortOrder } = req.query;
        const filter = {};
        if (businessScope)
            filter.businessId = businessScope;
        if (isVoided !== undefined) {
            filter.isVoided = isVoided === "true";
        }
        else {
            filter.isVoided = false;
        }
        if (paymentMethod && paymentMethod !== "all") {
            filter.paymentMethod = paymentMethod;
        }
        if (customerId && mongoose_1.default.Types.ObjectId.isValid(customerId)) {
            filter.customerId = new mongoose_1.default.Types.ObjectId(customerId);
        }
        const range = resolvePeriodRange(period, startDate, endDate);
        if (range) {
            filter.paymentDate = { $gte: range.startDate, $lte: range.endDate };
        }
        if (search && typeof search === "string" && search.trim().length > 0) {
            const searchRegex = new RegExp(search.trim(), "i");
            filter.$or = [
                { referenceNumber: searchRegex },
                { notes: searchRegex },
            ];
        }
        const sortField = typeof sortBy === "string" ? sortBy : "paymentDate";
        const sortDir = sortOrder === "asc" ? 1 : -1;
        const [payments, total, allMatching] = await Promise.all([
            Payment_1.default.find(filter)
                .populate("customerId", "name email phone")
                .populate("invoiceId", "invoiceNumber total")
                .populate("businessId", "name")
                .sort({ [sortField]: sortDir })
                .skip(skip)
                .limit(limit),
            Payment_1.default.countDocuments(filter),
            Payment_1.default.find(filter).select("amount paymentMethod"),
        ]);
        const paymentMethodBreakdown = {};
        let totalPayments = 0;
        for (const p of allMatching) {
            totalPayments += p.amount || 0;
            paymentMethodBreakdown[p.paymentMethod] = (paymentMethodBreakdown[p.paymentMethod] || 0) + (p.amount || 0);
        }
        const summary = {
            totalPayments,
            paymentCount: total,
            paymentMethodBreakdown,
        };
        res.status(200).json({
            success: true,
            data: payments,
            summary,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit) || 1,
            },
        });
    }
    catch (error) {
        console.error("getPaymentReport error:", error);
        res.status(500).json({ success: false, message: "Failed to generate payment report" });
    }
};
exports.getPaymentReport = getPaymentReport;
// ============================================================================
// 5. GET CUSTOMER REPORT
// ============================================================================
const getCustomerReport = async (req, res) => {
    try {
        const businessScope = resolveBusinessScope(req);
        if (businessScope === false) {
            res.status(403).json({ success: false, message: "No business associated with this user" });
            return;
        }
        const page = Math.max(1, parseInt(req.query.page, 10) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
        const skip = (page - 1) * limit;
        const { search, isActive, sortBy, sortOrder } = req.query;
        const filter = {};
        if (businessScope)
            filter.businessId = businessScope;
        if (isActive !== undefined) {
            filter.isActive = isActive === "true";
        }
        if (search && typeof search === "string" && search.trim().length > 0) {
            const searchRegex = new RegExp(search.trim(), "i");
            filter.$or = [
                { name: searchRegex },
                { email: searchRegex },
                { phone: searchRegex },
            ];
        }
        const sortField = typeof sortBy === "string" ? sortBy : "totalInvoiced";
        const sortDir = sortOrder === "asc" ? 1 : -1;
        const [customers, total, allCustomers] = await Promise.all([
            Customer_1.default.find(filter)
                .populate("businessId", "name")
                .sort({ [sortField]: sortDir })
                .skip(skip)
                .limit(limit),
            Customer_1.default.countDocuments(filter),
            Customer_1.default.find(filter).select("totalInvoiced totalPaid outstandingBalance isActive"),
        ]);
        const summary = {
            totalCustomers: total,
            activeCustomers: allCustomers.filter((c) => c.isActive).length,
            totalInvoiced: allCustomers.reduce((s, c) => s + (c.totalInvoiced || 0), 0),
            totalPaid: allCustomers.reduce((s, c) => s + (c.totalPaid || 0), 0),
            totalOutstanding: allCustomers.reduce((s, c) => s + (c.outstandingBalance || 0), 0),
        };
        res.status(200).json({
            success: true,
            data: customers,
            summary,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit) || 1,
            },
        });
    }
    catch (error) {
        console.error("getCustomerReport error:", error);
        res.status(500).json({ success: false, message: "Failed to generate customer report" });
    }
};
exports.getCustomerReport = getCustomerReport;
// ============================================================================
// 6. GET REVENUE REPORT
// ============================================================================
const getRevenueReport = async (req, res) => {
    try {
        const businessScope = resolveBusinessScope(req);
        if (businessScope === false) {
            res.status(403).json({ success: false, message: "No business associated with this user" });
            return;
        }
        const page = Math.max(1, parseInt(req.query.page, 10) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
        const skip = (page - 1) * limit;
        const { period, startDate, endDate, search, sortBy, sortOrder } = req.query;
        const filter = {
            status: { $ne: "cancelled" },
        };
        if (businessScope)
            filter.businessId = businessScope;
        const range = resolvePeriodRange(period, startDate, endDate);
        if (range) {
            filter.issueDate = { $gte: range.startDate, $lte: range.endDate };
        }
        if (search && typeof search === "string" && search.trim().length > 0) {
            const searchRegex = new RegExp(search.trim(), "i");
            filter.$or = [
                { invoiceNumber: searchRegex },
                { notes: searchRegex },
            ];
        }
        const sortField = typeof sortBy === "string" ? sortBy : "issueDate";
        const sortDir = sortOrder === "asc" ? 1 : -1;
        const [invoices, total, allInvoices] = await Promise.all([
            Invoice_1.default.find(filter)
                .populate("customerId", "name email")
                .populate("businessId", "name")
                .sort({ [sortField]: sortDir })
                .skip(skip)
                .limit(limit),
            Invoice_1.default.countDocuments(filter),
            Invoice_1.default.find(filter).select("total paidAmount balanceDue status issueDate"),
        ]);
        const statusBreakdown = {};
        let totalGrossRevenue = 0;
        let totalCollected = 0;
        let totalUncollected = 0;
        for (const inv of allInvoices) {
            totalGrossRevenue += inv.total || 0;
            totalCollected += inv.paidAmount || 0;
            totalUncollected += inv.balanceDue || 0;
            statusBreakdown[inv.status] = (statusBreakdown[inv.status] || 0) + (inv.total || 0);
        }
        const collectionRate = totalGrossRevenue > 0
            ? Math.round((totalCollected / totalGrossRevenue) * 100)
            : 0;
        const summary = {
            period: range?.label || "Custom",
            totalGrossRevenue,
            totalCollected,
            totalUncollected,
            collectionRate,
            statusBreakdown,
            invoiceCount: total,
        };
        res.status(200).json({
            success: true,
            data: invoices,
            summary,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit) || 1,
            },
        });
    }
    catch (error) {
        console.error("getRevenueReport error:", error);
        res.status(500).json({ success: false, message: "Failed to generate revenue report" });
    }
};
exports.getRevenueReport = getRevenueReport;
// ============================================================================
// 7. GET OUTSTANDING REPORT (Accounts Receivable & Aging)
// ============================================================================
const getOutstandingReport = async (req, res) => {
    try {
        const businessScope = resolveBusinessScope(req);
        if (businessScope === false) {
            res.status(403).json({ success: false, message: "No business associated with this user" });
            return;
        }
        const page = Math.max(1, parseInt(req.query.page, 10) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
        const skip = (page - 1) * limit;
        const { customerId, search, period, startDate, endDate, sortBy, sortOrder } = req.query;
        const filter = {
            balanceDue: { $gt: 0 },
            status: { $ne: "cancelled" },
        };
        if (businessScope)
            filter.businessId = businessScope;
        if (customerId && mongoose_1.default.Types.ObjectId.isValid(customerId)) {
            filter.customerId = new mongoose_1.default.Types.ObjectId(customerId);
        }
        const range = resolvePeriodRange(period, startDate, endDate);
        if (range) {
            filter.issueDate = { $gte: range.startDate, $lte: range.endDate };
        }
        if (search && typeof search === "string" && search.trim().length > 0) {
            const searchRegex = new RegExp(search.trim(), "i");
            filter.$or = [
                { invoiceNumber: searchRegex },
                { notes: searchRegex },
            ];
        }
        const sortField = typeof sortBy === "string" ? sortBy : "dueDate";
        const sortDir = sortOrder === "asc" ? 1 : -1;
        const [invoices, total, allOutstanding] = await Promise.all([
            Invoice_1.default.find(filter)
                .populate("customerId", "name email phone")
                .populate("businessId", "name")
                .sort({ [sortField]: sortDir })
                .skip(skip)
                .limit(limit),
            Invoice_1.default.countDocuments(filter),
            Invoice_1.default.find(filter).select("total paidAmount balanceDue dueDate status"),
        ]);
        const now = new Date();
        let totalOutstanding = 0;
        let totalOverdue = 0;
        let overdueCount = 0;
        const aging = {
            current: 0, // Not overdue
            days1_30: 0,
            days31_60: 0,
            days61_90: 0,
            days90Plus: 0,
        };
        for (const inv of allOutstanding) {
            const due = inv.balanceDue || 0;
            totalOutstanding += due;
            const dueDate = new Date(inv.dueDate);
            if (dueDate < now || inv.status === "overdue") {
                totalOverdue += due;
                overdueCount++;
                const daysOverdue = Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
                if (daysOverdue <= 30) {
                    aging.days1_30 += due;
                }
                else if (daysOverdue <= 60) {
                    aging.days31_60 += due;
                }
                else if (daysOverdue <= 90) {
                    aging.days61_90 += due;
                }
                else {
                    aging.days90Plus += due;
                }
            }
            else {
                aging.current += due;
            }
        }
        const summary = {
            totalOutstanding,
            totalOverdue,
            overdueCount,
            pendingCount: total,
            aging,
        };
        res.status(200).json({
            success: true,
            data: invoices,
            summary,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit) || 1,
            },
        });
    }
    catch (error) {
        console.error("getOutstandingReport error:", error);
        res.status(500).json({ success: false, message: "Failed to generate outstanding report" });
    }
};
exports.getOutstandingReport = getOutstandingReport;
