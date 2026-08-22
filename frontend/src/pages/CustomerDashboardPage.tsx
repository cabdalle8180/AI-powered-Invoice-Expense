import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, AlertCircle } from "lucide-react";
import { getCustomerMe } from "../api/customerService";
import invoiceService, { type Invoice } from "../api/invoiceService";
import paymentService from "../api/paymentService";
import { StatusBadge } from "../components/StatusBadge";
import { usePermission } from "../hooks/usePermission";

const formatCurrency = (value: number) =>
  `$${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const CustomerDashboardPage: React.FC = () => {
  const { user } = usePermission();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [totals, setTotals] = useState({
    totalInvoiced: 0,
    totalPaid: 0,
    outstandingBalance: 0,
    overdueAmount: 0,
  });
  const [recentInvoices, setRecentInvoices] = useState<Invoice[]>([]);
  const [recentPayments, setRecentPayments] = useState<
    Array<{
      _id: string;
      amount: number;
      paymentDate: string;
      paymentMethod: string;
      invoiceId?: { invoiceNumber?: string };
    }>
  >([]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const [profile, invoicesRes, paymentsRes] = await Promise.all([
          getCustomerMe(),
          invoiceService.getInvoices({ page: 1, limit: 5 }),
          paymentService.getPayments({ page: 1, limit: 5 }),
        ]);

        const customer = profile.data.customer;
        setCustomerName(customer.name);

        const invoices = invoicesRes.data.invoices;
        const now = new Date();
        const overdueAmount = invoices
          .filter(
            (inv) =>
              (inv.balanceDue || 0) > 0 &&
              (inv.status === "overdue" || new Date(inv.dueDate) < now)
          )
          .reduce((sum, inv) => sum + (inv.balanceDue || 0), 0);

        setTotals({
          totalInvoiced: customer.totalInvoiced || 0,
          totalPaid: customer.totalPaid || 0,
          outstandingBalance: customer.outstandingBalance || 0,
          overdueAmount,
        });

        setRecentInvoices(invoices);
        setRecentPayments(paymentsRes.data.payments || []);
      } catch {
        setError("Unable to load your dashboard. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa]">
        <Loader2 className="animate-spin text-blue-500" size={32} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa] p-6">
        <div className="bg-white border border-red-100 rounded-xl p-6 text-center max-w-md">
          <AlertCircle className="mx-auto text-red-500 mb-3" size={32} />
          <p className="text-gray-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <main className="flex-1 bg-[#f8f9fa] min-h-screen font-sans">
      <div className="px-4 sm:px-8 py-6 max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome, {customerName || user?.name}
          </h1>
          <p className="text-gray-500 text-sm mt-1">Your account summary and recent activity.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Invoiced", value: formatCurrency(totals.totalInvoiced) },
            { label: "Total Paid", value: formatCurrency(totals.totalPaid) },
            { label: "Outstanding Balance", value: formatCurrency(totals.outstandingBalance) },
            { label: "Overdue Amount", value: formatCurrency(totals.overdueAmount) },
          ].map((card) => (
            <div key={card.label} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500 mb-2">{card.label}</p>
              <p className="text-xl font-bold text-gray-900">{card.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Recent Invoices</h3>
              <Link to="/my-invoices" className="text-sm text-blue-600 hover:text-blue-800">
                View All
              </Link>
            </div>
            {recentInvoices.length === 0 ? (
              <p className="text-sm text-gray-400 py-6 text-center">No invoices found.</p>
            ) : (
              <div className="space-y-3">
                {recentInvoices.map((inv) => (
                  <div key={inv._id} className="flex items-center justify-between text-sm border-b border-gray-50 pb-3">
                    <div>
                      <p className="font-medium text-gray-900">{inv.invoiceNumber}</p>
                      <p className="text-gray-500">{new Date(inv.issueDate).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{formatCurrency(inv.total)}</p>
                      <StatusBadge status={inv.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Recent Payments</h3>
              <Link to="/my-payments" className="text-sm text-blue-600 hover:text-blue-800">
                View All
              </Link>
            </div>
            {recentPayments.length === 0 ? (
              <p className="text-sm text-gray-400 py-6 text-center">No payments recorded.</p>
            ) : (
              <div className="space-y-3">
                {recentPayments.map((payment) => (
                  <div key={payment._id} className="flex items-center justify-between text-sm border-b border-gray-50 pb-3">
                    <div>
                      <p className="font-medium text-gray-900">
                        {typeof payment.invoiceId === "object"
                          ? payment.invoiceId?.invoiceNumber || "Payment"
                          : "Payment"}
                      </p>
                      <p className="text-gray-500">
                        {new Date(payment.paymentDate).toLocaleDateString()} · {payment.paymentMethod}
                      </p>
                    </div>
                    <p className="font-semibold text-emerald-600">{formatCurrency(payment.amount)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default CustomerDashboardPage;
