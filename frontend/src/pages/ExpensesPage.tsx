import React, { useState, useEffect } from "react";
import {
  Search,
  Bell,
  HelpCircle,
  Plus,
  Scan,
  Filter,
  Download,
  CreditCard,
  TrendingUp,
  PieChart,
  Menu,
  X,
  Loader2,
  Trash2,
  Edit3,
  Calendar,
  Building2,
  DollarSign,
  Receipt,
} from "lucide-react";
import {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
} from "../api/expenseService";
import type { IExpense, CreateExpenseInput } from "../types/expense.types";

export default function ExpensesPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expenses, setExpenses] = useState<IExpense[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10 });

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<IExpense | null>(null);

  // Form State
  const [formData, setFormData] = useState<CreateExpenseInput>({
    title: "",
    amount: 0,
    category: "other",
    paymentMethod: "cash",
    vendor: "",
    notes: "",
  });

  useEffect(() => {
    fetchExpenses();
  }, [searchTerm]);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const res = await getExpenses(1, 10, searchTerm);
      if (res.success) {
        setExpenses(res.data.expenses);
        setPagination(res.data.pagination);
      }
    } catch (error) {
      console.error("Error fetching expenses:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingExpense) {
        const res = await updateExpense(editingExpense._id, formData);
        if (res.success) {
          setEditingExpense(null);
        }
      } else {
        const res = await createExpense(formData);
        if (res.success) {
          setIsAddModalOpen(false);
        }
      }
      resetForm();
      fetchExpenses();
    } catch (error: any) {
      const msg =
        error?.response?.data?.message ||
        "Qalad ayaa dhacay marka hawsha la fulinayay.";
      alert(msg);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Ma xaqiijinaysaa inaad tirtirto kharashkan?")) {
      try {
        const res = await deleteExpense(id);
        if (res.success) {
          fetchExpenses();
        }
      } catch (error) {
        alert("Waa lagu guuldareystay tirtirista.");
      }
    }
  };

  const handleEditClick = (expense: IExpense) => {
    setEditingExpense(expense);
    setFormData({
      title: expense.title,
      amount: expense.amount,
      category: expense.category,
      paymentMethod: expense.paymentMethod,
      vendor: expense.vendor || "",
      notes: expense.notes || "",
    });
  };

  const resetForm = () => {
    setFormData({
      title: "",
      amount: 0,
      category: "other",
      paymentMethod: "cash",
      vendor: "",
      notes: "",
    });
  };

  const getCategoryBadge = (category: string) => {
    const styles: Record<string, string> = {
      rent: "bg-purple-50 text-purple-700 border-purple-200/60",
      utilities: "bg-amber-50 text-amber-700 border-amber-200/60",
      payroll: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
      office_supplies: "bg-blue-50 text-blue-700 border-blue-200/60",
      marketing: "bg-rose-50 text-rose-700 border-rose-200/60",
      other: "bg-slate-100 text-slate-700 border-slate-200",
    };
    return styles[category] || styles.other;
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans antialiased selection:bg-indigo-500 selection:text-white">
      {/* TOP NAVIGATION BAR */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            
            {/* Search Input */}
            <div className="hidden md:flex flex-1 max-w-md">
              <div className="relative w-full group">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                <input
                  type="text"
                  placeholder="Kharash raadi (Title, Vendor, Note)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-100/70 hover:bg-slate-100 border border-transparent rounded-full pl-10 pr-4 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500/30 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all"
                />
              </div>
            </div>

            {/* Profile & Notifications */}
            <div className="hidden md:flex items-center gap-3 ml-auto">
              <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100/80 rounded-full transition-all relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-600 rounded-full ring-2 ring-white"></span>
              </button>
              <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100/80 rounded-full transition-all">
                <HelpCircle className="w-5 h-5" />
              </button>
              <div className="h-5 w-px bg-slate-200 mx-1" />
              <div className="flex items-center gap-3 pl-1 cursor-pointer">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"
                  alt="Avatar"
                  className="w-9 h-9 rounded-full ring-2 ring-slate-100 object-cover"
                />
              </div>
            </div>

            {/* Mobile Header */}
            <div className="flex md:hidden items-center justify-between w-full">
              <div className="relative flex-1 mr-3">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Raadi..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-100 border-0 rounded-xl pl-10 pr-4 py-2 text-sm"
                />
              </div>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Page Title & Main Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Kharashaadka
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                Live Overview
              </span>
            </div>
            <p className="text-slate-500 text-sm mt-1">
              Maamul oo la soco dhammaan kharashaadka ganacsigaaga.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200/80 hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-xl shadow-sm hover:shadow transition-all active:scale-[0.98]">
              <Scan className="w-4 h-4 text-slate-500" />
              <span>Scan Receipt</span>
            </button>

            <button
              onClick={() => {
                resetForm();
                setIsAddModalOpen(true);
              }}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-indigo-200 hover:shadow-lg transition-all active:scale-[0.98]"
            >
              <Plus className="w-4.5 h-4.5" />
              <span>Geli Kharash Cusub</span>
            </button>
          </div>
        </div>

        {/* METRICS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Total Expense Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/70 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Warta Kharashka (MTD)
              </span>
              <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 group-hover:scale-110 transition-transform">
                <CreditCard className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-black text-slate-900 tracking-tight mb-2">
              ${expenses.reduce((acc, curr) => acc + curr.amount, 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </div>
            <div className="flex items-center gap-1 text-emerald-600 text-xs font-semibold">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Mooshan waa la cusbooneysiiyay</span>
            </div>
          </div>

          {/* Total Items Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/70 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Tirada Diiwaangelinta
              </span>
              <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 group-hover:scale-110 transition-transform">
                <Receipt className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-black text-slate-900 tracking-tight mb-2">
              {pagination.total}
            </div>
            <p className="text-slate-400 text-xs font-medium">
              Kharashaad diiwaan gashan
            </p>
          </div>

          {/* Active Status Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/70 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Bogga Hadda
              </span>
              <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 group-hover:scale-110 transition-transform">
                <PieChart className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-black text-slate-900 tracking-tight mb-2">
              Page {pagination.page}
            </div>
            <p className="text-slate-400 text-xs font-medium">
              Waxaa muuqda {expenses.length} kharash
            </p>
          </div>
        </div>

        {/* TABLE CONTAINER */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          
          {/* Controls Header */}
          <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Ku dhex raadi kharashaadka..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200/80 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
              <button className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors">
                <Filter className="w-4 h-4 text-slate-500" />
                <span>Filter</span>
              </button>
              <button className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors">
                <Download className="w-4 h-4 text-slate-500" />
                <span>Export</span>
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                <span className="text-sm font-medium">Soo xaraynaya xogta kharashaadka...</span>
              </div>
            ) : expenses.length === 0 ? (
              <div className="text-center py-16 text-slate-400">
                <Receipt className="w-12 h-12 mx-auto mb-3 text-slate-300 stroke-[1.5]" />
                <p className="font-semibold text-slate-700">Wax kharash ah ma jiraan</p>
                <p className="text-xs text-slate-400 mt-1">Diiwaangeli kharash cusub ama beddel raadintaada.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] uppercase tracking-wider font-bold text-slate-400">
                    <th className="py-4 px-6">Taariikhda</th>
                    <th className="py-4 px-6">Kharashka / Vendor</th>
                    <th className="py-4 px-6">Category</th>
                    <th className="py-4 px-6">Qiimaha</th>
                    <th className="py-4 px-6">Qaabka Bixinta</th>
                    <th className="py-4 px-6 text-right">Tallaabooyin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {expenses.map((expense) => (
                    <tr
                      key={expense._id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      <td className="py-4 px-6 text-slate-500 font-medium whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          <span>
                            {new Date(expense.expenseDate).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                          {expense.title}
                        </div>
                        <div className="text-slate-400 text-xs mt-0.5 flex items-center gap-1">
                          {expense.vendor && (
                            <>
                              <Building2 className="w-3 h-3" />
                              <span>{expense.vendor}</span>
                            </>
                          )}
                          {expense.notes && !expense.vendor && (
                            <span>{expense.notes}</span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border capitalize ${getCategoryBadge(
                            expense.category
                          )}`}
                        >
                          {expense.category.replace("_", " ")}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-extrabold text-slate-900 whitespace-nowrap">
                        ${expense.amount.toFixed(2)}
                      </td>
                      <td className="py-4 px-6 text-slate-600 whitespace-nowrap capitalize">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold">
                          <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                          {expense.paymentMethod.replace("_", " ")}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1 opacity-90 group-hover:opacity-100">
                          <button
                            onClick={() => handleEditClick(expense)}
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                            title="Beddel"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(expense._id)}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                            title="Tirtir"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>

      {/* CREATE & UPDATE MODAL */}
      {(isAddModalOpen || editingExpense) && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative">
            
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {editingExpense ? "Beddel Kharashka" : "Kharash Cusub Geli"}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Faqri xogta kharashka si aad u kaydiso.
                </p>
              </div>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingExpense(null);
                }}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                  Magaca Kharashka (Title) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Tusaale: Rent, Office Supplies..."
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                  Lacagta ($) *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={formData.amount || ""}
                    onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value as any })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 capitalize"
                  >
                    <option value="rent">Rent</option>
                    <option value="utilities">Utilities</option>
                    <option value="payroll">Payroll</option>
                    <option value="office_supplies">Office Supplies</option>
                    <option value="marketing">Marketing</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                    Qaabka Bixinta
                  </label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) =>
                      setFormData({ ...formData, paymentMethod: e.target.value as any })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 capitalize"
                  >
                    <option value="cash">Cash</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="credit_card">Credit Card</option>
                    <option value="mobile_money">Mobile Money</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                  Vendor / Shirkadda (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Tusaale: Hormuud, Dahabshiil, Amazon..."
                  value={formData.vendor}
                  onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white transition-all"
                />
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm shadow-lg shadow-indigo-200 transition-all active:scale-[0.98]"
                >
                  {editingExpense ? "Kaydi Beddelka" : "Diiwaangeli Kharashka"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}