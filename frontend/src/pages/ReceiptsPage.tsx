import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Bell,
  HelpCircle,
  Upload,
  ScanLine,
  Plus,
  Eye,
  ChevronLeft,
  ChevronRight,
  X,
  FileText,
  Sparkles,
  CheckCircle,
  Clock,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { scanReceipt, type ScannedReceipt } from "../api/aiService";
import { getReceipts, createReceipt, type ReceiptItem } from "../api/receiptService";
import { usePermission } from "../hooks/usePermission";

// ─── Category Badge ───────────────────────────────────────────────────────────
const CategoryBadge: React.FC<{ label: string }> = ({ label }) => {
  const colorMap: Record<string, string> = {
    Travel: "bg-blue-50 text-blue-700 border-blue-100",
    Meals: "bg-amber-50 text-amber-700 border-amber-100",
    Equipment: "bg-purple-50 text-purple-700 border-purple-100",
    Software: "bg-indigo-50 text-indigo-700 border-indigo-100",
    Office: "bg-orange-50 text-orange-700 border-orange-100",
    Rent: "bg-emerald-50 text-emerald-700 border-emerald-100",
    Salaries: "bg-cyan-50 text-cyan-700 border-cyan-100",
    Utilities: "bg-rose-50 text-rose-700 border-rose-100",
  };
  return (
    <span
      className={`px-2.5 py-0.5 text-xs font-medium rounded-md border ${
        colorMap[label] ?? "bg-gray-50 text-gray-700 border-gray-100"
      }`}
    >
      {label}
    </span>
  );
};

// ─── Manual Add Receipt Modal ──────────────────────────────────────────────────
const AddManualModal: React.FC<{ onClose: () => void; onSuccess: () => void }> = ({
  onClose,
  onSuccess,
}) => {
  const [merchant, setMerchant] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("other");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!merchant || !amount) {
      setError("Please fill in all required fields.");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await createReceipt({
        merchant,
        amount: parseFloat(amount),
        category,
        date,
        notes,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to create receipt.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900 text-lg">Add Receipt Manually</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 text-xs p-3 rounded-xl mb-4 border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Merchant / Vendor *</label>
            <input
              type="text"
              required
              value={merchant}
              onChange={(e) => setMerchant(e.target.value)}
              placeholder="e.g. Amazon, Delta Airlines"
              className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Amount ($) *</label>
              <input
                type="number"
                step="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100"
            >
              <option value="other">Other</option>
              <option value="equipment">Equipment</option>
              <option value="supplies">Supplies</option>
              <option value="marketing">Marketing</option>
              <option value="utilities">Utilities</option>
              <option value="rent">Rent</option>
              <option value="salaries">Salaries</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Notes</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional details..."
              className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm py-2.5 rounded-lg transition disabled:opacity-60"
          >
            {submitting ? "Saving..." : "Save Receipt"}
          </button>
        </form>
      </div>
    </div>
  );
};

// ─── AI Scanner Modal ─────────────────────────────────────────────────────────
const ScannerModal: React.FC<{ onClose: () => void; onSuccess: () => void }> = ({
  onClose,
  onSuccess,
}) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ScannedReceipt | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFile = (f: File) => {
    setFile(f);
    setResult(null);
    setError(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleScan = async () => {
    if (!file) return;
    setScanning(true);
    setError(null);
    try {
      const data = await scanReceipt(file);
      setResult(data);
      onSuccess();
    } catch (err: any) {
      setError(
        err?.response?.data?.message ??
          "AI extraction failed. Please try a clearer image."
      );
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col md:flex-row overflow-hidden max-h-[90vh]">
        {/* Left — Upload */}
        <div className="flex-1 p-6 flex flex-col gap-4 border-b md:border-b-0 md:border-r border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">AI Receipt Scanner</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition">
              <X size={20} />
            </button>
          </div>
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            className={`flex-1 flex flex-col items-center justify-center border-2 border-dashed rounded-xl cursor-pointer transition-colors min-h-[200px] ${
              dragging
                ? "border-blue-400 bg-blue-50"
                : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
            }`}
          >
            <input
              ref={fileRef}
              type="file"
              accept=".jpg,.jpeg,.png,.webp,.pdf"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
            <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mb-3">
              <Upload size={24} className="text-blue-500" />
            </div>
            {file ? (
              <p className="text-sm font-medium text-gray-800 text-center px-4">📄 {file.name}</p>
            ) : (
              <>
                <p className="text-sm font-semibold text-gray-700">Drag &amp; Drop Receipt</p>
                <p className="text-xs text-gray-400 mt-1">Support for JPG, PNG, WEBP, and PDF up to 5MB.</p>
              </>
            )}
          </div>
          <p className="text-center text-xs text-gray-400">— OR —</p>
          <button
            onClick={() => fileRef.current?.click()}
            className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition"
          >
            <FileText size={16} /> Browse Files
          </button>
          {file && !scanning && (
            <button
              onClick={handleScan}
              className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition"
            >
              <Sparkles size={16} /> Extract with AI
            </button>
          )}
          {scanning && (
            <div className="flex items-center justify-center gap-2 text-sm text-indigo-600 font-medium animate-pulse">
              <Sparkles size={16} /> Analyzing receipt...
            </div>
          )}
        </div>

        {/* Right — Result */}
        <div className="flex-1 p-6 flex flex-col gap-4 overflow-y-auto">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">AI Extraction</h3>
            {result ? (
              <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full border border-green-100 font-medium">
                Extracted &amp; Saved
              </span>
            ) : (
              <span className="text-xs bg-gray-50 text-gray-500 px-2 py-0.5 rounded-full border border-gray-100 font-medium">
                Draft
              </span>
            )}
          </div>
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-700 text-sm rounded-xl p-3">
              {error}
            </div>
          )}
          {!result && !scanning && !error && (
            <div className="flex-1 flex flex-col items-center justify-center text-center gap-3 py-12">
              <div className="w-14 h-14 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-center">
                <FileText size={28} className="text-gray-300" />
              </div>
              <p className="text-sm text-gray-400">Upload a receipt to see extracted data here.</p>
            </div>
          )}
          {result && (
            <div className="space-y-3">
              {[
                { label: "Merchant", value: result.merchant || "General Vendor" },
                { label: "Date", value: result.date || new Date().toLocaleDateString() },
                { label: "Amount", value: `$${(result.amount || 0).toFixed(2)}` },
                { label: "Category", value: result.category || "General" },
                ...(result.notes ? [{ label: "Notes", value: result.notes }] : []),
              ].map(({ label, value }) => (
                <div key={label} className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs font-medium text-gray-400 mb-1">{label}</p>
                  <p className="text-sm font-semibold text-gray-800">{value}</p>
                </div>
              ))}
              {result.items && result.items.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs font-medium text-gray-400 mb-2">Line Items</p>
                  {result.items.map((item, i) => (
                    <div key={i} className="flex justify-between text-xs text-gray-700">
                      <span>{item.description}</span>
                      <span className="font-medium">${item.amount.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}
              <button
                onClick={onClose}
                className="w-full bg-green-500 hover:bg-green-600 text-white text-sm font-medium px-5 py-2.5 rounded-lg flex items-center justify-center gap-2 transition"
              >
                <CheckCircle size={16} /> Complete &amp; View in Ledger
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Main Page Component ───────────────────────────────────────────────────────
const ReceiptsPage: React.FC = () => {
  const { can } = usePermission();
  const [receipts, setReceipts] = useState<ReceiptItem[]>([]);
  const [stats, setStats] = useState({
    totalScanned: 0,
    pendingReview: 0,
    totalAmountYTD: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"All" | "Pending" | "Reviewed">("All");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEntries, setTotalEntries] = useState(0);

  const [showScanner, setShowScanner] = useState(false);
  const [showManualAdd, setShowManualAdd] = useState(false);

  const fetchReceipts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getReceipts({
        page,
        limit: 10,
        search: search.trim() || undefined,
        status: tab !== "All" ? tab.toLowerCase() : undefined,
      });

      setReceipts(data.receipts);
      setStats(data.stats);
      setTotalPages(data.pagination.pages);
      setTotalEntries(data.pagination.total);
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { message?: string } } };
      setError(apiErr.response?.data?.message || "Failed to load receipts from server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReceipts();
  }, [page, search, tab]);

  const canCreate = can("receipt:scan");

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-3.5 flex items-center justify-between gap-4">
        <div className="relative w-80">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search receipts..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
          />
        </div>
        <div className="flex items-center gap-4">
          <button className="text-gray-500 hover:text-gray-800 transition">
            <Bell size={20} />
          </button>
          <button className="text-gray-500 hover:text-gray-800 transition">
            <HelpCircle size={20} />
          </button>
          <img
            src="https://i.pravatar.cc/150?img=47"
            alt="avatar"
            className="w-8 h-8 rounded-full object-cover border border-gray-200"
          />
        </div>
      </header>

      <main className="px-6 py-6 max-w-6xl mx-auto">
        {/* Title + RBAC-Guarded Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Receipts</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Manage and digitize your expense documentation.
            </p>
          </div>

          {canCreate && (
            <div className="flex gap-2">
              <button
                onClick={() => setShowManualAdd(true)}
                className="flex items-center gap-1.5 border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg transition"
              >
                <Plus size={15} /> Add Manually
              </button>
              <button
                onClick={() => setShowScanner(true)}
                className="flex items-center gap-1.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition shadow-sm"
              >
                <ScanLine size={15} /> Scan Receipt
              </button>
            </div>
          )}
        </div>

        {/* Error Notification */}
        {error && (
          <div className="bg-red-50 border border-red-100 text-red-700 text-sm rounded-xl p-4 mb-6 flex items-center gap-3">
            <AlertCircle size={20} className="shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* Dynamic Backend Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
            <p className="text-sm text-gray-500 mb-1">Total Scanned</p>
            <p className="text-3xl font-bold text-gray-900">
              {stats.totalScanned.toLocaleString()}
            </p>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
            <p className="text-sm text-gray-500 mb-1">Pending Review</p>
            <p className="text-3xl font-bold text-blue-600">{stats.pendingReview}</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
            <p className="text-sm text-gray-500 mb-1">Total Amount (YTD)</p>
            <p className="text-3xl font-bold text-gray-900">
              ${stats.totalAmountYTD.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        {/* Receipts Table Card */}
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 pt-4 pb-0 border-b border-gray-100">
            <div className="flex gap-1">
              {(["All", "Pending", "Reviewed"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    setTab(t);
                    setPage(1);
                  }}
                  className={`px-4 py-2 text-sm font-medium rounded-t-md transition-colors border-b-2 ${
                    tab === t
                      ? "text-blue-600 border-blue-600"
                      : "text-gray-500 border-transparent hover:text-gray-700"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="py-16 flex flex-col items-center justify-center gap-3 text-gray-400">
                <Loader2 size={28} className="animate-spin text-blue-500" />
                <p className="text-sm">Loading receipts from server...</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">
                      Date
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">
                      Merchant
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">
                      Category
                    </th>
                    <th className="px-5 py-3 text-right text-xs font-semibold text-gray-400 uppercase tracking-wide">
                      Amount
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">
                      Status
                    </th>
                    <th className="px-5 py-3 text-center text-xs font-semibold text-gray-400 uppercase tracking-wide">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {receipts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-gray-400 text-sm">
                        No receipts found.
                      </td>
                    </tr>
                  ) : (
                    receipts.map((r) => (
                      <tr key={r.id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="px-5 py-4 text-gray-600">{r.date}</td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-bold">
                              {r.merchant.charAt(0).toUpperCase()}
                            </span>
                            <div>
                              <p className="font-medium text-gray-800">{r.merchant}</p>
                              {r.createdByName && (
                                <p className="text-[11px] text-gray-400">By: {r.createdByName}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <CategoryBadge label={r.category} />
                        </td>
                        <td className="px-5 py-4 text-right font-semibold text-gray-800">
                          ${r.amount.toFixed(2)}
                        </td>
                        <td className="px-5 py-4">
                          {r.status === "Reviewed" ? (
                            <span className="flex items-center gap-1.5 text-xs font-medium text-blue-600">
                              <CheckCircle size={13} /> Reviewed
                            </span>
                          ) : (
                            <span className="flex items-center gap-1.5 text-xs font-medium text-gray-400">
                              <Clock size={13} /> Pending
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-center">
                          <button className="text-gray-400 hover:text-blue-500 transition">
                            <Eye size={18} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 text-sm text-gray-500">
            <span>
              Showing {receipts.length > 0 ? (page - 1) * 10 + 1 : 0}–
              {Math.min(page * 10, totalEntries)} of {totalEntries}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || totalPages === 0}
                className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </main>

      {showScanner && (
        <ScannerModal onClose={() => setShowScanner(false)} onSuccess={fetchReceipts} />
      )}
      {showManualAdd && (
        <AddManualModal onClose={() => setShowManualAdd(false)} onSuccess={fetchReceipts} />
      )}
    </div>
  );
};

export default ReceiptsPage;
