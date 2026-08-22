import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  Download,
  FileText,
  Loader2,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Wallet,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Calendar,
  Layers,
  Users,
  Clock,
} from "lucide-react";
import {
  getReportsSummary,
  getInvoiceReport,
  getExpenseReport,
  getPaymentReport,
  getCustomerReport,
  getRevenueReport,
  getOutstandingReport,
  type ReportCard,
  type RecentReport,
  type InvoiceReportItem,
  type ExpenseReportItem,
  type PaymentReportItem,
  type CustomerReportItem,
  type ReportPagination,
} from "../api/reportService";
import { getBusinesses, type BusinessRecord } from "../api/businessService";
import { usePermission } from "../hooks/usePermission";
import PermissionDenied from "../components/PermissionDenied";
import { StatusBadge } from "../components/StatusBadge";

type ReportTab =
  | "overview"
  | "revenue"
  | "expenses"
  | "invoices"
  | "payments"
  | "outstanding"
  | "customers";

const PERIODS = [
  "This Month",
  "Last Month",
  "This Quarter",
  "This Year",
  "Today",
  "This Week",
  "Custom",
];

const formatCurrency = (val: number | undefined | null) =>
  `$${(val || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const ReportsPage: React.FC = () => {
  const { hasPermission, can, isSuperAdmin } = usePermission();
  const isAllowed = hasPermission(["superAdmin", "owner", "accountant"]);

  const [activeTab, setActiveTab] = useState<ReportTab>("overview");
  const [period, setPeriod] = useState("This Month");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("all");
  const [selectedBusinessId, setSelectedBusinessId] = useState("");
  const [page, setPage] = useState(1);

  // Business List for SuperAdmin filter
  const [businesses, setBusinesses] = useState<BusinessRecord[]>([]);

  // Overview Tab State
  const [cards, setCards] = useState<ReportCard[]>([]);
  const [recentReports, setRecentReports] = useState<RecentReport[]>([]);
  const [overviewMetrics, setOverviewMetrics] = useState<any>(null);

  // Specific Tab Data
  const [invoicesData, setInvoicesData] = useState<{
    items: InvoiceReportItem[];
    summary: any;
    pagination: ReportPagination;
  }>({
    items: [],
    summary: {},
    pagination: { page: 1, limit: 20, total: 0, pages: 1 },
  });

  const [expensesData, setExpensesData] = useState<{
    items: ExpenseReportItem[];
    summary: any;
    pagination: ReportPagination;
  }>({
    items: [],
    summary: {},
    pagination: { page: 1, limit: 20, total: 0, pages: 1 },
  });

  const [paymentsData, setPaymentsData] = useState<{
    items: PaymentReportItem[];
    summary: any;
    pagination: ReportPagination;
  }>({
    items: [],
    summary: {},
    pagination: { page: 1, limit: 20, total: 0, pages: 1 },
  });

  const [customersData, setCustomersData] = useState<{
    items: CustomerReportItem[];
    summary: any;
    pagination: ReportPagination;
  }>({
    items: [],
    summary: {},
    pagination: { page: 1, limit: 20, total: 0, pages: 1 },
  });

  const [revenueData, setRevenueData] = useState<{
    items: InvoiceReportItem[];
    summary: any;
    pagination: ReportPagination;
  }>({
    items: [],
    summary: {},
    pagination: { page: 1, limit: 20, total: 0, pages: 1 },
  });

  const [outstandingData, setOutstandingData] = useState<{
    items: InvoiceReportItem[];
    summary: any;
    pagination: ReportPagination;
  }>({
    items: [],
    summary: {},
    pagination: { page: 1, limit: 20, total: 0, pages: 1 },
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load businesses for SuperAdmin
  useEffect(() => {
    if (isSuperAdmin) {
      getBusinesses(1, 100)
        .then((res) => {
          setBusinesses(res.data?.businesses || res.data || []);
        })
        .catch(() => {});
    }
  }, [isSuperAdmin]);

  // Fetch Report Data based on activeTab
  const loadReportData = useCallback(async () => {
    if (!isAllowed) return;

    try {
      setLoading(true);
      setError(null);

      const params: any = {
        page,
        limit: 15,
        search: search.trim() || undefined,
        businessId: selectedBusinessId || undefined,
        period: period !== "Custom" ? period : undefined,
        startDate: period === "Custom" && startDate ? startDate : undefined,
        endDate: period === "Custom" && endDate ? endDate : undefined,
      };

      if (activeTab === "overview") {
        const summary = await getReportsSummary(
          period !== "Custom" ? period : undefined,
          params
        );
        setCards(summary.cards || []);
        setRecentReports(summary.recentReports || []);
        setOverviewMetrics(summary.metrics);
      } else if (activeTab === "revenue") {
        const res = await getRevenueReport(params);
        setRevenueData({
          items: res.data,
          summary: res.summary,
          pagination: res.pagination,
        });
      } else if (activeTab === "expenses") {
        const res = await getExpenseReport({
          ...params,
          category: categoryFilter !== "all" ? categoryFilter : undefined,
          paymentMethod: paymentMethodFilter !== "all" ? paymentMethodFilter : undefined,
        });
        setExpensesData({
          items: res.data,
          summary: res.summary,
          pagination: res.pagination,
        });
      } else if (activeTab === "invoices") {
        const res = await getInvoiceReport({
          ...params,
          status: statusFilter !== "all" ? statusFilter : undefined,
        });
        setInvoicesData({
          items: res.data,
          summary: res.summary,
          pagination: res.pagination,
        });
      } else if (activeTab === "payments") {
        const res = await getPaymentReport({
          ...params,
          paymentMethod: paymentMethodFilter !== "all" ? paymentMethodFilter : undefined,
        });
        setPaymentsData({
          items: res.data,
          summary: res.summary,
          pagination: res.pagination,
        });
      } else if (activeTab === "outstanding") {
        const res = await getOutstandingReport(params);
        setOutstandingData({
          items: res.data,
          summary: res.summary,
          pagination: res.pagination,
        });
      } else if (activeTab === "customers") {
        const res = await getCustomerReport(params);
        setCustomersData({
          items: res.data,
          summary: res.summary,
          pagination: res.pagination,
        });
      }
    } catch (err: any) {
      console.error("Report fetch error:", err);
      setError(err?.response?.data?.message || "Failed to load report data.");
    } finally {
      setLoading(false);
    }
  }, [
    isAllowed,
    activeTab,
    page,
    period,
    startDate,
    endDate,
    search,
    statusFilter,
    categoryFilter,
    paymentMethodFilter,
    selectedBusinessId,
  ]);

  useEffect(() => {
    loadReportData();
  }, [loadReportData]);

  // Tab change resets page
  const handleTabChange = (tab: ReportTab) => {
    setActiveTab(tab);
    setPage(1);
  };

  if (!isAllowed) {
    return (
      <PermissionDenied
        requiredRole="SuperAdmin, Owner, or Accountant"
        message="Financial reports and analytical exports are restricted to authorized financial managers."
      />
    );
  }

  // Dynamic CSV Export
  const handleExportCsv = () => {
    let rows: string[][] = [];
    let filename = `report-${activeTab}-${period.replace(/\s+/g, "-").toLowerCase()}.csv`;

    if (activeTab === "overview" && overviewMetrics) {
      rows = [
        ["Metric", "Value"],
        ["Period", period],
        ["Total Revenue", overviewMetrics.totalRevenue.toFixed(2)],
        ["Total Expenses", overviewMetrics.totalExpenses.toFixed(2)],
        ["Net Profit", overviewMetrics.netProfit.toFixed(2)],
        ["Profit Margin %", String(overviewMetrics.profitMargin)],
        ["Total Outstanding", overviewMetrics.totalOutstanding.toFixed(2)],
        ["Total Overdue", overviewMetrics.totalOverdue.toFixed(2)],
      ];
    } else if (activeTab === "revenue") {
      rows = [
        ["Invoice Number", "Client", "Issue Date", "Status", "Total Amount", "Paid Amount", "Balance Due"],
        ...revenueData.items.map((inv) => [
          inv.invoiceNumber,
          inv.customerId?.name || "—",
          new Date(inv.issueDate).toLocaleDateString(),
          inv.status,
          inv.total.toFixed(2),
          inv.paidAmount.toFixed(2),
          inv.balanceDue.toFixed(2),
        ]),
      ];
    } else if (activeTab === "expenses") {
      rows = [
        ["Title", "Category", "Amount", "Payment Method", "Date", "Vendor", "Reference"],
        ...expensesData.items.map((exp) => [
          exp.title,
          exp.category,
          exp.amount.toFixed(2),
          exp.paymentMethod,
          new Date(exp.expenseDate).toLocaleDateString(),
          exp.vendor || "—",
          exp.referenceNumber || "—",
        ]),
      ];
    } else if (activeTab === "invoices") {
      rows = [
        ["Invoice Number", "Client", "Issue Date", "Due Date", "Status", "Total", "Paid", "Balance Due"],
        ...invoicesData.items.map((inv) => [
          inv.invoiceNumber,
          inv.customerId?.name || "—",
          new Date(inv.issueDate).toLocaleDateString(),
          new Date(inv.dueDate).toLocaleDateString(),
          inv.status,
          inv.total.toFixed(2),
          inv.paidAmount.toFixed(2),
          inv.balanceDue.toFixed(2),
        ]),
      ];
    } else if (activeTab === "payments") {
      rows = [
        ["Date", "Amount", "Payment Method", "Customer", "Invoice", "Reference"],
        ...paymentsData.items.map((pmt) => [
          new Date(pmt.paymentDate).toLocaleDateString(),
          pmt.amount.toFixed(2),
          pmt.paymentMethod,
          pmt.customerId?.name || "—",
          pmt.invoiceId?.invoiceNumber || "—",
          pmt.referenceNumber || "—",
        ]),
      ];
    } else if (activeTab === "outstanding") {
      rows = [
        ["Invoice Number", "Client", "Due Date", "Total", "Balance Due", "Status"],
        ...outstandingData.items.map((inv) => [
          inv.invoiceNumber,
          inv.customerId?.name || "—",
          new Date(inv.dueDate).toLocaleDateString(),
          inv.total.toFixed(2),
          inv.balanceDue.toFixed(2),
          inv.status,
        ]),
      ];
    } else if (activeTab === "customers") {
      rows = [
        ["Customer Name", "Email", "Phone", "Total Invoiced", "Total Paid", "Outstanding Balance", "Status"],
        ...customersData.items.map((c) => [
          c.name,
          c.email,
          c.phone || "—",
          c.totalInvoiced.toFixed(2),
          c.totalPaid.toFixed(2),
          c.outstandingBalance.toFixed(2),
          c.isActive ? "Active" : "Inactive",
        ]),
      ];
    }

    if (rows.length === 0) return;

    const csv = rows.map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getPagination = () => {
    switch (activeTab) {
      case "revenue":
        return revenueData.pagination;
      case "expenses":
        return expensesData.pagination;
      case "invoices":
        return invoicesData.pagination;
      case "payments":
        return paymentsData.pagination;
      case "outstanding":
        return outstandingData.pagination;
      case "customers":
        return customersData.pagination;
      default:
        return null;
    }
  };

  const currentPagination = getPagination();

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-12">
      {/* Header bar */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="text-sky-500" size={24} /> Financial Reports
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Audit-ready analytics, revenue trends, and operational breakdown.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Period Selector */}
          <select
            value={period}
            onChange={(e) => {
              setPeriod(e.target.value);
              setPage(1);
            }}
            className="border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold px-3 py-2 rounded-xl transition cursor-pointer"
          >
            {PERIODS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>

          {/* SuperAdmin Business Filter */}
          {isSuperAdmin && (
            <select
              value={selectedBusinessId}
              onChange={(e) => {
                setSelectedBusinessId(e.target.value);
                setPage(1);
              }}
              className="border border-sky-200 bg-sky-50 text-sky-800 text-xs font-semibold px-3 py-2 rounded-xl transition cursor-pointer"
            >
              <option value="">All Businesses (System-wide)</option>
              {businesses.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.name}
                </option>
              ))}
            </select>
          )}

          {can("report:export") && (
            <>
              <button
                type="button"
                onClick={handleExportCsv}
                className="inline-flex items-center gap-1.5 border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold px-3.5 py-2 rounded-xl transition shadow-xs cursor-pointer"
              >
                <Download size={14} /> CSV
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition shadow-xs cursor-pointer"
              >
                <Download size={14} /> Print / PDF
              </button>
            </>
          )}
        </div>
      </header>

      {/* Main container */}
      <main className="px-4 sm:px-8 py-6 max-w-7xl mx-auto space-y-6">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-gray-200">
          {[
            { id: "overview", label: "Executive Overview", icon: <Layers size={16} /> },
            { id: "revenue", label: "Revenue", icon: <TrendingUp size={16} /> },
            { id: "expenses", label: "Expenses", icon: <Wallet size={16} /> },
            { id: "invoices", label: "Invoices", icon: <FileText size={16} /> },
            { id: "payments", label: "Payments", icon: <DollarSign size={16} /> },
            { id: "outstanding", label: "Aging Receivables", icon: <Clock size={16} /> },
            { id: "customers", label: "Customers", icon: <Users size={16} /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id as ReportTab)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-xl transition whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? "bg-sky-500 text-white shadow-xs"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Custom Date Picker Bar */}
        {period === "Custom" && (
          <div className="bg-white p-3.5 rounded-xl border border-gray-200 flex flex-wrap items-center gap-3 text-xs">
            <span className="font-semibold text-gray-700 flex items-center gap-1">
              <Calendar size={14} className="text-sky-500" /> Date Range:
            </span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
              className="border border-gray-200 rounded-lg px-2.5 py-1.5"
            />
            <span className="text-gray-400">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
              className="border border-gray-200 rounded-lg px-2.5 py-1.5"
            />
          </div>
        )}

        {/* Tab Specific Filters & Search Bar */}
        {activeTab !== "overview" && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder={`Search ${activeTab}...`}
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-sky-100"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {activeTab === "invoices" && (
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(1);
                  }}
                  className="border border-gray-200 bg-white text-gray-700 text-xs font-semibold px-3 py-2 rounded-xl"
                >
                  <option value="all">All Statuses</option>
                  <option value="paid">Paid</option>
                  <option value="sent">Sent</option>
                  <option value="partially_paid">Partially Paid</option>
                  <option value="overdue">Overdue</option>
                  <option value="draft">Draft</option>
                </select>
              )}

              {activeTab === "expenses" && (
                <>
                  <select
                    value={categoryFilter}
                    onChange={(e) => {
                      setCategoryFilter(e.target.value);
                      setPage(1);
                    }}
                    className="border border-gray-200 bg-white text-gray-700 text-xs font-semibold px-3 py-2 rounded-xl"
                  >
                    <option value="all">All Categories</option>
                    <option value="rent">Rent</option>
                    <option value="salaries">Salaries</option>
                    <option value="utilities">Utilities</option>
                    <option value="marketing">Marketing</option>
                    <option value="supplies">Supplies</option>
                    <option value="equipment">Equipment</option>
                    <option value="other">Other</option>
                  </select>
                  <select
                    value={paymentMethodFilter}
                    onChange={(e) => {
                      setPaymentMethodFilter(e.target.value);
                      setPage(1);
                    }}
                    className="border border-gray-200 bg-white text-gray-700 text-xs font-semibold px-3 py-2 rounded-xl"
                  >
                    <option value="all">All Payment Methods</option>
                    <option value="cash">Cash</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="mobile_money">Mobile Money</option>
                    <option value="credit_card">Credit Card</option>
                  </select>
                </>
              )}

              {activeTab === "payments" && (
                <select
                  value={paymentMethodFilter}
                  onChange={(e) => {
                    setPaymentMethodFilter(e.target.value);
                    setPage(1);
                  }}
                  className="border border-gray-200 bg-white text-gray-700 text-xs font-semibold px-3 py-2 rounded-xl"
                >
                  <option value="all">All Payment Methods</option>
                  <option value="cash">Cash</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="mobile_money">Mobile Money</option>
                  <option value="credit_card">Credit Card</option>
                </select>
              )}
            </div>
          </div>
        )}

        {/* Error notification */}
        {error && (
          <div className="bg-rose-50 border border-rose-100 text-rose-700 text-xs sm:text-sm rounded-xl p-4 flex items-center gap-3">
            <AlertCircle size={18} className="shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* Loading Spinner */}
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3 text-slate-400">
            <Loader2 size={32} className="animate-spin text-sky-500" />
            <p className="text-xs font-medium">Aggregating live report metrics...</p>
          </div>
        ) : (
          <>
            {/* ─── TAB 1: EXECUTIVE OVERVIEW ──────────────────────────────── */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {cards.map((card) => (
                    <div
                      key={card.id}
                      className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs flex flex-col justify-between"
                    >
                      <div>
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center mb-3 font-bold"
                          style={{ backgroundColor: card.chartColor + "18", color: card.chartColor }}
                        >
                          {card.changeDir === "up" ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                        </div>
                        <h3 className="font-bold text-gray-900 text-sm">{card.title}</h3>
                        <p className="text-xs text-gray-400 mt-0.5">{card.subtitle}</p>
                      </div>
                      <div className="mt-4 flex items-baseline justify-between">
                        <p className="text-xl sm:text-2xl font-extrabold text-gray-900">{card.amount}</p>
                        <span className={`text-xs font-bold ${card.changeColor}`}>{card.change}</span>
                      </div>
                      {card.extra && <p className="text-[11px] text-gray-400 mt-2">{card.extra}</p>}
                    </div>
                  ))}
                </div>

                <div className="bg-white border border-gray-100 rounded-2xl shadow-xs overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100">
                    <h3 className="font-bold text-gray-900 text-sm sm:text-base">Generated Financial Summaries</h3>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {recentReports.map((r, i) => (
                      <div key={i} className="px-6 py-3.5 flex items-center justify-between text-xs sm:text-sm">
                        <div className="flex items-center gap-3">
                          <FileText size={16} className="text-sky-500" />
                          <div>
                            <p className="font-semibold text-gray-800">{r.name}</p>
                            <p className="text-xs text-gray-400">{r.range}</p>
                          </div>
                        </div>
                        <span className="text-xs text-gray-500 bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-100">
                          {r.generatedBy}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ─── TAB 2: REVENUE REPORT ─────────────────────────────────── */}
            {activeTab === "revenue" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs">
                    <span className="text-xs text-gray-400 font-semibold uppercase">Gross Revenue</span>
                    <p className="text-xl font-bold text-gray-900 mt-1">{formatCurrency(revenueData.summary.totalGrossRevenue)}</p>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs">
                    <span className="text-xs text-gray-400 font-semibold uppercase">Total Collected</span>
                    <p className="text-xl font-bold text-emerald-600 mt-1">{formatCurrency(revenueData.summary.totalCollected)}</p>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs">
                    <span className="text-xs text-gray-400 font-semibold uppercase">Uncollected Balance</span>
                    <p className="text-xl font-bold text-rose-500 mt-1">{formatCurrency(revenueData.summary.totalUncollected)}</p>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs">
                    <span className="text-xs text-gray-400 font-semibold uppercase">Collection Rate</span>
                    <p className="text-xl font-bold text-sky-600 mt-1">{revenueData.summary.collectionRate || 0}%</p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase text-[11px] font-semibold">
                        <th className="px-6 py-3.5">Invoice #</th>
                        <th className="px-6 py-3.5">Client</th>
                        <th className="px-6 py-3.5">Date</th>
                        <th className="px-6 py-3.5">Status</th>
                        <th className="px-6 py-3.5 text-right">Total</th>
                        <th className="px-6 py-3.5 text-right">Paid</th>
                        <th className="px-6 py-3.5 text-right">Balance Due</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {revenueData.items.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="text-center py-10 text-gray-400 text-xs">No revenue records found.</td>
                        </tr>
                      ) : (
                        revenueData.items.map((inv) => (
                          <tr key={inv._id} className="hover:bg-gray-50/60">
                            <td className="px-6 py-3.5 font-bold text-gray-900">{inv.invoiceNumber}</td>
                            <td className="px-6 py-3.5 text-gray-700">{inv.customerId?.name || "—"}</td>
                            <td className="px-6 py-3.5 text-gray-500">{new Date(inv.issueDate).toLocaleDateString()}</td>
                            <td className="px-6 py-3.5"><StatusBadge status={inv.status} /></td>
                            <td className="px-6 py-3.5 text-right font-semibold text-gray-900">{formatCurrency(inv.total)}</td>
                            <td className="px-6 py-3.5 text-right font-semibold text-emerald-600">{formatCurrency(inv.paidAmount)}</td>
                            <td className="px-6 py-3.5 text-right font-bold text-rose-500">{formatCurrency(inv.balanceDue)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ─── TAB 3: EXPENSES REPORT ─────────────────────────────────── */}
            {activeTab === "expenses" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs">
                    <span className="text-xs text-gray-400 font-semibold uppercase">Total Expenses</span>
                    <p className="text-2xl font-bold text-rose-600 mt-1">{formatCurrency(expensesData.summary.totalExpenses)}</p>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs">
                    <span className="text-xs text-gray-400 font-semibold uppercase">Expense Entries</span>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{expensesData.summary.expenseCount || 0}</p>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs">
                    <span className="text-xs text-gray-400 font-semibold uppercase">Top Category</span>
                    <p className="text-lg font-bold text-gray-800 capitalize mt-1">
                      {expensesData.summary.categoryBreakdown
                        ? Object.keys(expensesData.summary.categoryBreakdown)[0] || "None"
                        : "—"}
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase text-[11px] font-semibold">
                        <th className="px-6 py-3.5">Title</th>
                        <th className="px-6 py-3.5">Category</th>
                        <th className="px-6 py-3.5">Payment Method</th>
                        <th className="px-6 py-3.5">Vendor</th>
                        <th className="px-6 py-3.5">Date</th>
                        <th className="px-6 py-3.5 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {expensesData.items.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center py-10 text-gray-400 text-xs">No expense records found.</td>
                        </tr>
                      ) : (
                        expensesData.items.map((exp) => (
                          <tr key={exp._id} className="hover:bg-gray-50/60">
                            <td className="px-6 py-3.5 font-bold text-gray-900">{exp.title}</td>
                            <td className="px-6 py-3.5">
                              <span className="capitalize px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                                {exp.category.replace("_", " ")}
                              </span>
                            </td>
                            <td className="px-6 py-3.5 capitalize text-gray-600">{exp.paymentMethod.replace("_", " ")}</td>
                            <td className="px-6 py-3.5 text-gray-600">{exp.vendor || "—"}</td>
                            <td className="px-6 py-3.5 text-gray-500">{new Date(exp.expenseDate).toLocaleDateString()}</td>
                            <td className="px-6 py-3.5 text-right font-bold text-rose-600">{formatCurrency(exp.amount)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ─── TAB 4: INVOICES REPORT ─────────────────────────────────── */}
            {activeTab === "invoices" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs">
                    <span className="text-xs text-gray-400 font-semibold uppercase">Total Invoiced</span>
                    <p className="text-xl font-bold text-gray-900 mt-1">{formatCurrency(invoicesData.summary.totalInvoiced)}</p>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs">
                    <span className="text-xs text-gray-400 font-semibold uppercase">Total Paid</span>
                    <p className="text-xl font-bold text-emerald-600 mt-1">{formatCurrency(invoicesData.summary.totalPaid)}</p>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs">
                    <span className="text-xs text-gray-400 font-semibold uppercase">Total Balance Due</span>
                    <p className="text-xl font-bold text-rose-500 mt-1">{formatCurrency(invoicesData.summary.totalBalanceDue)}</p>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs">
                    <span className="text-xs text-gray-400 font-semibold uppercase">Invoices Count</span>
                    <p className="text-xl font-bold text-sky-600 mt-1">{invoicesData.summary.invoiceCount || 0}</p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase text-[11px] font-semibold">
                        <th className="px-6 py-3.5">Invoice #</th>
                        <th className="px-6 py-3.5">Client</th>
                        <th className="px-6 py-3.5">Issue Date</th>
                        <th className="px-6 py-3.5">Due Date</th>
                        <th className="px-6 py-3.5">Status</th>
                        <th className="px-6 py-3.5 text-right">Total</th>
                        <th className="px-6 py-3.5 text-right">Paid</th>
                        <th className="px-6 py-3.5 text-right">Balance Due</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {invoicesData.items.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="text-center py-10 text-gray-400 text-xs">No invoices found.</td>
                        </tr>
                      ) : (
                        invoicesData.items.map((inv) => (
                          <tr key={inv._id} className="hover:bg-gray-50/60">
                            <td className="px-6 py-3.5 font-bold text-gray-900">{inv.invoiceNumber}</td>
                            <td className="px-6 py-3.5 text-gray-700">{inv.customerId?.name || "—"}</td>
                            <td className="px-6 py-3.5 text-gray-500">{new Date(inv.issueDate).toLocaleDateString()}</td>
                            <td className="px-6 py-3.5 text-gray-500">{new Date(inv.dueDate).toLocaleDateString()}</td>
                            <td className="px-6 py-3.5"><StatusBadge status={inv.status} /></td>
                            <td className="px-6 py-3.5 text-right font-bold text-gray-900">{formatCurrency(inv.total)}</td>
                            <td className="px-6 py-3.5 text-right font-semibold text-emerald-600">{formatCurrency(inv.paidAmount)}</td>
                            <td className="px-6 py-3.5 text-right font-bold text-rose-500">{formatCurrency(inv.balanceDue)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ─── TAB 5: PAYMENTS REPORT ─────────────────────────────────── */}
            {activeTab === "payments" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs">
                    <span className="text-xs text-gray-400 font-semibold uppercase">Total Payments Collected</span>
                    <p className="text-2xl font-bold text-emerald-600 mt-1">{formatCurrency(paymentsData.summary.totalPayments)}</p>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs">
                    <span className="text-xs text-gray-400 font-semibold uppercase">Total Transactions</span>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{paymentsData.summary.paymentCount || 0}</p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase text-[11px] font-semibold">
                        <th className="px-6 py-3.5">Payment Date</th>
                        <th className="px-6 py-3.5">Customer</th>
                        <th className="px-6 py-3.5">Invoice #</th>
                        <th className="px-6 py-3.5">Method</th>
                        <th className="px-6 py-3.5">Reference #</th>
                        <th className="px-6 py-3.5 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {paymentsData.items.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center py-10 text-gray-400 text-xs">No payment records found.</td>
                        </tr>
                      ) : (
                        paymentsData.items.map((pmt) => (
                          <tr key={pmt._id} className="hover:bg-gray-50/60">
                            <td className="px-6 py-3.5 text-gray-700">{new Date(pmt.paymentDate).toLocaleDateString()}</td>
                            <td className="px-6 py-3.5 font-semibold text-gray-900">{pmt.customerId?.name || "—"}</td>
                            <td className="px-6 py-3.5 text-sky-600 font-medium">{pmt.invoiceId?.invoiceNumber || "—"}</td>
                            <td className="px-6 py-3.5 capitalize text-gray-600">{pmt.paymentMethod.replace("_", " ")}</td>
                            <td className="px-6 py-3.5 text-gray-500 font-mono text-xs">{pmt.referenceNumber || "—"}</td>
                            <td className="px-6 py-3.5 text-right font-bold text-emerald-600">{formatCurrency(pmt.amount)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ─── TAB 6: AGING RECEIVABLES / OUTSTANDING REPORT ──────────── */}
            {activeTab === "outstanding" && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
                  <div className="bg-white p-3.5 rounded-xl border border-gray-100 shadow-xs">
                    <span className="text-[11px] text-gray-400 font-semibold uppercase">Current</span>
                    <p className="text-lg font-bold text-emerald-600 mt-0.5">{formatCurrency(outstandingData.summary.aging?.current)}</p>
                  </div>
                  <div className="bg-white p-3.5 rounded-xl border border-gray-100 shadow-xs">
                    <span className="text-[11px] text-gray-400 font-semibold uppercase">1 – 30 Days Overdue</span>
                    <p className="text-lg font-bold text-amber-500 mt-0.5">{formatCurrency(outstandingData.summary.aging?.days1_30)}</p>
                  </div>
                  <div className="bg-white p-3.5 rounded-xl border border-gray-100 shadow-xs">
                    <span className="text-[11px] text-gray-400 font-semibold uppercase">31 – 60 Days Overdue</span>
                    <p className="text-lg font-bold text-orange-500 mt-0.5">{formatCurrency(outstandingData.summary.aging?.days31_60)}</p>
                  </div>
                  <div className="bg-white p-3.5 rounded-xl border border-gray-100 shadow-xs">
                    <span className="text-[11px] text-gray-400 font-semibold uppercase">61 – 90 Days Overdue</span>
                    <p className="text-lg font-bold text-rose-500 mt-0.5">{formatCurrency(outstandingData.summary.aging?.days61_90)}</p>
                  </div>
                  <div className="bg-white p-3.5 rounded-xl border border-gray-100 shadow-xs">
                    <span className="text-[11px] text-gray-400 font-semibold uppercase">90+ Days Overdue</span>
                    <p className="text-lg font-bold text-red-600 mt-0.5">{formatCurrency(outstandingData.summary.aging?.days90Plus)}</p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase text-[11px] font-semibold">
                        <th className="px-6 py-3.5">Invoice #</th>
                        <th className="px-6 py-3.5">Client</th>
                        <th className="px-6 py-3.5">Due Date</th>
                        <th className="px-6 py-3.5">Status</th>
                        <th className="px-6 py-3.5 text-right">Total</th>
                        <th className="px-6 py-3.5 text-right">Balance Due</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {outstandingData.items.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center py-10 text-gray-400 text-xs">No outstanding receivables found.</td>
                        </tr>
                      ) : (
                        outstandingData.items.map((inv) => (
                          <tr key={inv._id} className="hover:bg-gray-50/60">
                            <td className="px-6 py-3.5 font-bold text-gray-900">{inv.invoiceNumber}</td>
                            <td className="px-6 py-3.5 text-gray-700">{inv.customerId?.name || "—"}</td>
                            <td className="px-6 py-3.5 text-gray-500">{new Date(inv.dueDate).toLocaleDateString()}</td>
                            <td className="px-6 py-3.5"><StatusBadge status={inv.status} /></td>
                            <td className="px-6 py-3.5 text-right font-semibold text-gray-900">{formatCurrency(inv.total)}</td>
                            <td className="px-6 py-3.5 text-right font-bold text-rose-600">{formatCurrency(inv.balanceDue)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ─── TAB 7: CUSTOMERS REPORT ────────────────────────────────── */}
            {activeTab === "customers" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs">
                    <span className="text-xs text-gray-400 font-semibold uppercase">Total Customers</span>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{customersData.summary.totalCustomers || 0}</p>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs">
                    <span className="text-xs text-gray-400 font-semibold uppercase">Total Invoiced to Clients</span>
                    <p className="text-2xl font-bold text-sky-600 mt-1">{formatCurrency(customersData.summary.totalInvoiced)}</p>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs">
                    <span className="text-xs text-gray-400 font-semibold uppercase">Outstanding Client Balances</span>
                    <p className="text-2xl font-bold text-rose-500 mt-1">{formatCurrency(customersData.summary.totalOutstanding)}</p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase text-[11px] font-semibold">
                        <th className="px-6 py-3.5">Customer Name</th>
                        <th className="px-6 py-3.5">Email</th>
                        <th className="px-6 py-3.5">Phone</th>
                        <th className="px-6 py-3.5 text-right">Invoiced</th>
                        <th className="px-6 py-3.5 text-right">Paid</th>
                        <th className="px-6 py-3.5 text-right">Outstanding</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {customersData.items.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center py-10 text-gray-400 text-xs">No customers found.</td>
                        </tr>
                      ) : (
                        customersData.items.map((c) => (
                          <tr key={c._id} className="hover:bg-gray-50/60">
                            <td className="px-6 py-3.5 font-bold text-gray-900">{c.name}</td>
                            <td className="px-6 py-3.5 text-gray-600">{c.email}</td>
                            <td className="px-6 py-3.5 text-gray-500">{c.phone || "—"}</td>
                            <td className="px-6 py-3.5 text-right font-semibold text-gray-900">{formatCurrency(c.totalInvoiced)}</td>
                            <td className="px-6 py-3.5 text-right font-semibold text-emerald-600">{formatCurrency(c.totalPaid)}</td>
                            <td className="px-6 py-3.5 text-right font-bold text-rose-500">{formatCurrency(c.outstandingBalance)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Pagination Controls */}
            {currentPagination && currentPagination.pages > 1 && (
              <div className="flex items-center justify-between bg-white px-6 py-3.5 border border-gray-100 rounded-xl shadow-xs text-xs text-gray-600">
                <span>
                  Page <strong>{currentPagination.page}</strong> of <strong>{currentPagination.pages}</strong> ({currentPagination.total} total items)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    disabled={currentPagination.page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="p-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 transition cursor-pointer"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    disabled={currentPagination.page >= currentPagination.pages}
                    onClick={() => setPage((p) => p + 1)}
                    className="p-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 transition cursor-pointer"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default ReportsPage;
