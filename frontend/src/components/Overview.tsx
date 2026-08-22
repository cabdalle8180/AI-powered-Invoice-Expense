import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Bell,
  HelpCircle,
  TrendingUp,
  Clock,
  AlertTriangle,
  Lightbulb,
  Loader2,
  AlertCircle,
  Building2,
  Users,
  FileText,
  Wallet,
  CheckCircle,
  Plus,
  BarChart3,
} from "lucide-react";
import { getReportsSummary } from "../api/reportService";
import { getAdminStats, type AdminStatsResponse } from "../api/adminService";
import invoiceService, { type Invoice } from "../api/invoiceService";
import { StatusBadge } from "./StatusBadge";
import { usePermission } from "../hooks/usePermission";

interface KpiCardProps {
  title: string;
  amount: string;
  trendText: string;
  trendType: "up-blue" | "up-red" | "pending" | "alert" | "neutral";
  icon?: React.ReactNode;
}

const KpiCard: React.FC<KpiCardProps> = ({ title, amount, trendText, trendType, icon }) => {
  const getTrendStyles = () => {
    switch (trendType) {
      case "up-blue":
        return { text: "text-blue-500", icon: <TrendingUp size={14} className="mr-1" /> };
      case "up-red":
        return { text: "text-red-500", icon: <TrendingUp size={14} className="mr-1" /> };
      case "pending":
        return { text: "text-amber-600", icon: <Clock size={14} className="mr-1" /> };
      case "alert":
        return { text: "text-red-600", icon: <AlertTriangle size={14} className="mr-1" /> };
      case "neutral":
        return { text: "text-slate-500", icon: null };
    }
  };

  const trendStyle = getTrendStyles();

  return (
    <div className="bg-white p-5 rounded-xl shadow-xs border border-gray-100 flex-1 min-w-0 flex flex-col justify-between">
      <div className="flex items-center justify-between gap-2 mb-2">
        <h3 className="text-sm font-medium text-gray-500 truncate">{title}</h3>
        {icon && <div className="text-slate-400">{icon}</div>}
      </div>
      <p className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">{amount}</p>
      <div className={`flex items-center text-xs font-medium ${trendStyle.text}`}>
        {trendStyle.icon}
        <span className="truncate">{trendText}</span>
      </div>
    </div>
  );
};

const formatCurrency = (value: number) =>
  `$${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const Overview: React.FC = () => {
  const { isSuperAdmin, isAccountant, isAdmin } = usePermission();
  const canViewFinancialSummary = isAccountant || isAdmin || isSuperAdmin;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Admin Stats
  const [adminStats, setAdminStats] = useState<AdminStatsResponse["data"] | null>(null);

  // Business Owner / Accountant / Staff Stats
  const [businessMetrics, setBusinessMetrics] = useState({
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
    totalOutstanding: 0,
    totalOverdue: 0,
    overdueInvoiceCount: 0,
    outstandingInvoiceCount: 0,
    profitMargin: 0,
  });
  const [topInsight, setTopInsight] = useState<string>("");
  const [recentInvoices, setRecentInvoices] = useState<Invoice[]>([]);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError(null);

        if (isSuperAdmin) {
          const stats = await getAdminStats();
          setAdminStats(stats);
        } else {
          const invoicesRes = await invoiceService.getInvoices({ page: 1, limit: 5 });
          setRecentInvoices(invoicesRes.data.invoices);

          if (canViewFinancialSummary) {
            const summary = await getReportsSummary("This Month");
            setBusinessMetrics({
              totalRevenue: summary.metrics.totalRevenue,
              totalExpenses: summary.metrics.totalExpenses,
              netProfit: summary.metrics.netProfit,
              totalOutstanding: summary.metrics.totalOutstanding,
              totalOverdue: summary.metrics.totalOverdue,
              overdueInvoiceCount: summary.metrics.overdueInvoiceCount ?? 0,
              outstandingInvoiceCount: summary.metrics.outstandingInvoiceCount ?? 0,
              profitMargin: summary.metrics.profitMargin,
            });

            const profitCard = summary.cards.find((c) => c.title === "Profit & Loss");
            setTopInsight(
              profitCard?.extra ||
                `Net profit margin: ${summary.metrics.profitMargin}% for this month.`
            );
          } else {
            const allInvoicesRes = await invoiceService.getInvoices({ page: 1, limit: 100 });
            const invoices = allInvoicesRes.data.invoices;
            const now = new Date();

            const totalOutstanding = invoices.reduce(
              (sum, inv) => sum + (inv.balanceDue || 0),
              0
            );
            const totalPaid = invoices.reduce(
              (sum, inv) => sum + (inv.paidAmount || 0),
              0
            );
            const overdueInvoices = invoices.filter(
              (inv) =>
                inv.status === "overdue" ||
                ((inv.balanceDue || 0) > 0 && new Date(inv.dueDate) < now)
            );
            const totalOverdue = overdueInvoices.reduce(
              (sum, inv) => sum + (inv.balanceDue || 0),
              0
            );
            const outstandingInvoices = invoices.filter((inv) => (inv.balanceDue || 0) > 0);

            setBusinessMetrics({
              totalRevenue: totalPaid,
              totalExpenses: 0,
              netProfit: totalPaid,
              totalOutstanding,
              totalOverdue,
              overdueInvoiceCount: overdueInvoices.length,
              outstandingInvoiceCount: outstandingInvoices.length,
              profitMargin: 0,
            });
            setTopInsight(
              overdueInvoices.length > 0
                ? `${overdueInvoices.length} invoice(s) are overdue. Review your outstanding balance.`
                : `${invoices.length} invoice(s) on record.`
            );
          }
        }
      } catch (err) {
        console.error("Dashboard error:", err);
        setError("Unable to load dashboard data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [isSuperAdmin, canViewFinancialSummary]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa]">
        <div className="text-center space-y-3">
          <Loader2 className="animate-spin text-sky-500 mx-auto" size={32} />
          <p className="text-sm text-slate-500 font-medium">Loading dashboard insights...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa] p-6">
        <div className="bg-white border border-red-100 rounded-2xl p-6 text-center max-w-md shadow-xs">
          <AlertCircle className="mx-auto text-red-500 mb-3" size={32} />
          <p className="text-gray-800 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <main className="flex-1 bg-[#f8f9fa] min-h-screen font-sans overflow-x-hidden">
      {/* Header bar */}
      <header className="flex flex-col-reverse sm:flex-row items-center justify-between gap-4 px-4 sm:px-8 py-4 bg-white border-b border-gray-200">
        <div className="relative w-full sm:w-80 md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search platform..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-100 focus:border-sky-400"
          />
        </div>
        <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4">
          <button className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition">
            <Bell size={18} />
          </button>
          <button className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition">
            <HelpCircle size={18} />
          </button>
        </div>
      </header>

      <div className="px-4 sm:px-8 py-6 max-w-7xl mx-auto space-y-6">
        {/* ================================================================= */}
        {/* SUPERADMIN DASHBOARD VIEW */}
        {/* ================================================================= */}
        {isSuperAdmin && adminStats ? (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-gray-500 text-sm mt-0.5">
                  Platform-wide intelligence and business oversight.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  to="/user-management"
                  className="inline-flex items-center gap-1.5 bg-sky-500 hover:bg-sky-600 text-white font-semibold text-xs px-3.5 py-2 rounded-xl transition shadow-xs"
                >
                  <Plus size={15} /> Create Owner
                </Link>
                <Link
                  to="/reports"
                  className="inline-flex items-center gap-1.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold text-xs px-3.5 py-2 rounded-xl transition shadow-xs"
                >
                  <BarChart3 size={15} /> View Reports
                </Link>
              </div>
            </div>

            {/* System Overview KPI Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
              <KpiCard
                title="Businesses"
                amount={String(adminStats.overview.totalBusinesses)}
                trendText={`${adminStats.overview.activeBusinesses} Active`}
                trendType="up-blue"
                icon={<Building2 size={16} />}
              />
              <KpiCard
                title="Total Users"
                amount={String(adminStats.overview.totalUsers)}
                trendText={`${adminStats.overview.activeUsers} Active`}
                trendType="neutral"
                icon={<Users size={16} />}
              />
              <KpiCard
                title="Total Customers"
                amount={String(adminStats.overview.totalCustomers)}
                trendText={`${adminStats.overview.activeCustomers} Active`}
                trendType="neutral"
                icon={<Users size={16} />}
              />
              <KpiCard
                title="Total Invoices"
                amount={String(adminStats.overview.totalInvoices)}
                trendText={`${adminStats.invoiceStats.paid} Paid`}
                trendType="up-blue"
                icon={<FileText size={16} />}
              />
              <KpiCard
                title="This Month Revenue"
                amount={formatCurrency(adminStats.financial.thisMonth.revenue)}
                trendText={`${adminStats.financial.growth.revenue >= 0 ? "+" : ""}${adminStats.financial.growth.revenue}% MoM`}
                trendType={adminStats.financial.growth.revenue >= 0 ? "up-blue" : "alert"}
                icon={<TrendingUp size={16} />}
              />
              <KpiCard
                title="Outstanding"
                amount={formatCurrency(adminStats.financial.outstanding.total)}
                trendText={`${adminStats.financial.outstanding.pendingCount} Invoices`}
                trendType="pending"
                icon={<Clock size={16} />}
              />
            </div>

            {/* Trends and Status Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Monthly Trend Chart */}
              <div className="lg:col-span-2 bg-white p-5 sm:p-6 rounded-2xl border border-gray-100 shadow-xs">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm sm:text-base">Revenue vs Expense Trend</h3>
                    <p className="text-xs text-gray-400 mt-0.5">Aggregated performance across all businesses</p>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="flex items-center gap-1.5 font-medium text-sky-600">
                      <span className="w-2.5 h-2.5 rounded-full bg-sky-500" /> Revenue
                    </span>
                    <span className="flex items-center gap-1.5 font-medium text-rose-500">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-400" /> Expenses
                    </span>
                  </div>
                </div>

                {/* Monthly Bars Visualization */}
                <div className="space-y-4">
                  {adminStats.financial.monthlyTrends.map((t, idx) => {
                    const maxVal = Math.max(
                      ...adminStats.financial.monthlyTrends.map((m) => Math.max(m.revenue, m.expenses)),
                      1
                    );
                    const revPct = Math.round((t.revenue / maxVal) * 100);
                    const expPct = Math.round((t.expenses / maxVal) * 100);

                    return (
                      <div key={idx} className="space-y-1">
                        <div className="flex items-center justify-between text-xs font-semibold text-gray-700">
                          <span>{t.month} {t.year}</span>
                          <span className="text-gray-500 font-normal">
                            Rev: <strong className="text-sky-600">${t.revenue.toLocaleString()}</strong> • Exp: <strong className="text-rose-500">${t.expenses.toLocaleString()}</strong>
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 h-2.5 bg-gray-50 rounded-full overflow-hidden">
                          <div
                            className="bg-sky-500 rounded-full h-full transition-all"
                            style={{ width: `${Math.max(4, revPct)}%` }}
                          />
                          <div
                            className="bg-rose-400 rounded-full h-full transition-all"
                            style={{ width: `${Math.max(4, expPct)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Invoice Status Distribution */}
              <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-100 shadow-xs flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-gray-900 text-sm sm:text-base mb-1">Invoice Status Breakdown</h3>
                  <p className="text-xs text-gray-400 mb-6">Total invoices on record: {adminStats.invoiceStats.total}</p>

                  <div className="space-y-3 text-xs">
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 text-emerald-800 font-semibold">
                      <span>Paid Invoices</span>
                      <span>{adminStats.invoiceStats.paid}</span>
                    </div>
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-sky-50 text-sky-800 font-semibold">
                      <span>Sent / Pending</span>
                      <span>{adminStats.invoiceStats.sent}</span>
                    </div>
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-rose-50 text-rose-800 font-semibold">
                      <span>Overdue Invoices</span>
                      <span>{adminStats.invoiceStats.overdue}</span>
                    </div>
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 text-gray-700 font-semibold">
                      <span>Draft Invoices</span>
                      <span>{adminStats.invoiceStats.draft}</span>
                    </div>
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 text-slate-500 font-medium">
                      <span>Cancelled</span>
                      <span>{adminStats.invoiceStats.cancelled}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 mt-4">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500">Overdue Amount</span>
                    <span className="font-bold text-rose-600">{formatCurrency(adminStats.financial.outstanding.overdue)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Platform Activities */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-5 sm:p-6">
              <h3 className="font-bold text-gray-900 text-sm sm:text-base mb-4">Recent Activity Feed</h3>
              <div className="divide-y divide-gray-50">
                {adminStats.recentActivities.length === 0 ? (
                  <p className="text-center py-8 text-xs text-gray-400">No recent activities recorded.</p>
                ) : (
                  adminStats.recentActivities.map((act, i) => (
                    <div key={i} className="py-3 flex items-center justify-between gap-4 text-xs">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                            act.type === "invoice"
                              ? "bg-sky-50 text-sky-600"
                              : act.type === "payment"
                              ? "bg-emerald-50 text-emerald-600"
                              : "bg-amber-50 text-amber-600"
                          }`}
                        >
                          {act.type === "invoice" ? <FileText size={14} /> : act.type === "payment" ? <CheckCircle size={14} /> : <Wallet size={14} />}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{act.description}</p>
                          <p className="text-gray-400 text-[11px]">{new Date(act.time).toLocaleString()}</p>
                        </div>
                      </div>
                      {act.amount && (
                        <span className="font-bold text-gray-900">{act.amount}</span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        ) : (
          /* =============================================================== */
          /* BUSINESS DASHBOARD VIEW (Owner / Accountant / Staff) */
          /* =============================================================== */
          <>
            <div className="my-2">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Overview</h1>
              <p className="text-gray-500 text-sm mt-0.5">Live business performance from your database.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <KpiCard
                title="Total Revenue"
                amount={formatCurrency(businessMetrics.totalRevenue)}
                trendText="This month"
                trendType="up-blue"
              />
              <KpiCard
                title="Total Expenses"
                amount={formatCurrency(businessMetrics.totalExpenses)}
                trendText="This month"
                trendType="up-red"
              />
              <KpiCard
                title="Net Profit"
                amount={formatCurrency(businessMetrics.netProfit)}
                trendText={`${businessMetrics.profitMargin}% margin`}
                trendType={businessMetrics.netProfit >= 0 ? "up-blue" : "alert"}
              />
              <KpiCard
                title="Outstanding"
                amount={formatCurrency(businessMetrics.totalOutstanding)}
                trendText={`${businessMetrics.outstandingInvoiceCount} invoices`}
                trendType="pending"
              />
              <KpiCard
                title="Overdue"
                amount={formatCurrency(businessMetrics.totalOverdue)}
                trendText={`${businessMetrics.overdueInvoiceCount} invoices`}
                trendType="alert"
              />
            </div>

            <div className="bg-[#eff6ff] border border-blue-100 rounded-xl p-4 flex flex-col sm:flex-row items-start gap-3 shadow-xs">
              <div className="bg-sky-500 text-white p-2 rounded-xl shrink-0">
                <Lightbulb size={20} />
              </div>
              <div>
                <h4 className="text-[#1e3a8a] font-semibold text-sm mb-0.5">Financial Insight</h4>
                <p className="text-blue-900/80 text-sm leading-relaxed">{topInsight}</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xs border border-gray-100 p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Recent Invoices</h3>
                <Link to="/invoices" className="text-xs font-semibold text-sky-600 hover:text-sky-800">
                  View All
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[500px] text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 text-gray-400 text-xs uppercase font-semibold">
                      <th className="pb-3">Invoice ID</th>
                      <th className="pb-3">Client</th>
                      <th className="pb-3">Date</th>
                      <th className="pb-3">Amount</th>
                      <th className="pb-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {recentInvoices.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-sm text-gray-400">
                          No recent invoices to display.
                        </td>
                      </tr>
                    ) : (
                      recentInvoices.map((inv) => (
                        <tr key={inv._id} className="hover:bg-gray-50/50">
                          <td className="py-3 font-semibold text-gray-900">{inv.invoiceNumber}</td>
                          <td className="py-3 text-gray-600">
                            {typeof inv.customerId === "object" && inv.customerId?.name
                              ? inv.customerId.name
                              : "—"}
                          </td>
                          <td className="py-3 text-gray-600">
                            {new Date(inv.issueDate).toLocaleDateString()}
                          </td>
                          <td className="py-3 font-semibold text-gray-900">{formatCurrency(inv.total)}</td>
                          <td className="py-3">
                            <StatusBadge status={inv.status} />
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
};

export default Overview;
