import React, { useEffect, useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import paymentService from "../api/paymentService";

const formatCurrency = (value: number) =>
  `$${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const CustomerPaymentsPage: React.FC = () => {
  const [payments, setPayments] = useState<
    Array<{
      _id: string;
      amount: number;
      paymentDate: string;
      paymentMethod: string;
      referenceNumber?: string;
      invoiceId?: { invoiceNumber?: string; total?: number };
    }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await paymentService.getPayments({ page, limit: 10 });
        setPayments(res.data.payments || []);
        setTotalPages(res.data.pagination?.pages || 1);
      } catch {
        setError("Unable to load your payments. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [page]);

  return (
    <div className="min-h-screen bg-[#f8f9fa] font-sans">
      <div className="px-4 sm:px-8 py-6 max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">My Payments</h1>
        <p className="text-sm text-gray-500 mb-6">Payments recorded against your invoices.</p>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-700 text-sm rounded-xl p-4 mb-6 flex items-center gap-3">
            <AlertCircle size={20} />
            {error}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="py-16 flex justify-center">
              <Loader2 className="animate-spin text-blue-500" size={28} />
            </div>
          ) : payments.length === 0 ? (
            <p className="text-center text-gray-400 py-12 text-sm">No payments found.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Date</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Invoice</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Method</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-gray-400 uppercase">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {payments.map((p) => (
                  <tr key={p._id} className="hover:bg-gray-50/60">
                    <td className="px-5 py-4 text-gray-600">
                      {new Date(p.paymentDate).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4 font-medium text-gray-900">
                      {typeof p.invoiceId === "object" ? p.invoiceId?.invoiceNumber || "—" : "—"}
                    </td>
                    <td className="px-5 py-4 text-gray-600 capitalize">
                      {p.paymentMethod?.replace("_", " ") || "—"}
                    </td>
                    <td className="px-5 py-4 text-right font-semibold text-emerald-600">
                      {formatCurrency(p.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 text-sm text-gray-500">
            <span>Page {page} of {totalPages}</span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1 border rounded-lg disabled:opacity-40"
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1 border rounded-lg disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerPaymentsPage;
