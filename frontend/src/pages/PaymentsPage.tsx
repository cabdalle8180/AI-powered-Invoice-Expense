
// import React, { useState, useEffect, useCallback } from "react";
// import {
//   Search,
//   Plus,
//   Filter,
//   Landmark,
//   CreditCard,
//   Banknote,
//   ChevronLeft,
//   ChevronRight,
//   TrendingUp,
//   CheckCircle2,
//   X,
//   Trash2,
// } from "lucide-react";
// import { paymentService} from "../api/paymentService";
// import {type PaymentFilterParams } from "../api/paymentService";
// import { invoiceService} from "../api/invoiceService";
// import {  type Invoice } from "../api/invoiceService";

// // Interfaces
// interface Payment {
//   _id: string;
//   amount: number;
//   paymentDate: string;
//   paymentMethod: string;
//   referenceNumber?: string;
//   isVoided: boolean;
//   customerId?: {
//     _id: string;
//     name: string;
//     email: string;
//     companyName?: string;
//   };
//   invoiceId?: {
//     _id: string;
//     invoiceNumber?: string;
//     total: number;
//     balanceDue: number;
//   };
// }

// export const PaymentsPage: React.FC = () => {
//   // States
//   const [payments, setPayments] = useState<Payment[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [page, setPage] = useState<number>(1);
//   const [totalPages, setTotalPages] = useState<number>(1);
//   const [totalEntries, setTotalEntries] = useState<number>(0);
//   const [search, setSearch] = useState<string>("");
//   const [selectedMethod, setSelectedMethod] = useState<string>("");

//   // Invoices for Dropdown
//   const [invoices, setInvoices] = useState<Invoice[]>([]);
//   const [loadingInvoices, setLoadingInvoices] = useState<boolean>(false);

//   // Modal State
//   const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
//   const [submitting, setSubmitting] = useState<boolean>(false);
//   const [formData, setFormData] = useState({
//     invoiceId: "",
//     amount: "",
//     paymentMethod: "cash",
//     referenceNumber: "",
//     notes: "",
//   });

//   // Fetch Payments from Backend
//   const loadPayments = useCallback(async () => {
//     try {
//       setLoading(true);
//       const params: PaymentFilterParams = {
//         page,
//         limit: 10,
//       };
//       if (selectedMethod) params.paymentMethod = selectedMethod;

//       const response = await paymentService.getPayments(params);
//       if (response.success) {
//         setPayments(response.data.payments);
//         setTotalPages(response.data.pagination.pages);
//         setTotalEntries(response.data.pagination.total);
//       }
//     } catch (err) {
//       console.error("Failed to load payments", err);
//     } finally {
//       setLoading(false);
//     }
//   }, [page, selectedMethod]);

//   useEffect(() => {
//     loadPayments();
//   }, [loadPayments]);

//   // Load Invoices for Modal Dropdown
//   useEffect(() => {
//     if (isModalOpen) {
//       const fetchInvoices = async () => {
//         try {
//           setLoadingInvoices(true);
//           const res = await invoiceService.getInvoices();
//           if (res.success) {
//             // Siftay oo soo saar Invoices-ka aan weli buuxin
//             const pendingInvoices = res.data.invoices.filter(
//               (inv) => inv.status !== "paid" && inv.status !== "cancelled"
//             );
//             setInvoices(pendingInvoices.length > 0 ? pendingInvoices : res.data.invoices);
//           }
//         } catch (err) {
//           console.error("Failed to fetch invoices", err);
//         } finally {
//           setLoadingInvoices(false);
//         }
//       };
//       fetchInvoices();
//     }
//   }, [isModalOpen]);

//   // Handle Record Payment Form Submit
//   const handleRecordPayment = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (!formData.invoiceId) {
//       alert("Fadlan dooro Invoice sax ah!");
//       return;
//     }

//     try {
//       setSubmitting(true);
//       await paymentService.recordPayment({
//         invoiceId: formData.invoiceId,
//         amount: parseFloat(formData.amount),
//         paymentMethod: formData.paymentMethod,
//         referenceNumber: formData.referenceNumber || undefined,
//         notes: formData.notes || undefined,
//       });

//       setIsModalOpen(false);
//       setFormData({ invoiceId: "", amount: "", paymentMethod: "cash", referenceNumber: "", notes: "" });
//       loadPayments();
//     } catch (err: any) {
//       alert(err.response?.data?.message || "Cilad ayaa dhacday inta lagu guda jiray kaydinta!");
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   // Handle Void Payment
//   const handleVoidPayment = async (id: string) => {
//     if (!window.confirm("Ma hubtaa inaad baabi'iso (void) lacag bixintan?")) return;
//     try {
//       await paymentService.voidPayment(id);
//       loadPayments();
//     } catch (err: any) {
//       alert(err.response?.data?.message || "Cilad ayaa dhacday!");
//     }
//   };

//   // UI Helper Functions
//   const getInitials = (name?: string) => {
//     if (!name) return "NA";
//     return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
//   };

//   const getMethodIcon = (method: string) => {
//     switch (method.toLowerCase()) {
//       case "bank_transfer":
//       case "bank transfer":
//         return <Landmark className="w-4 h-4 text-gray-500" />;
//       case "card":
//       case "credit card":
//         return <CreditCard className="w-4 h-4 text-gray-500" />;
//       default:
//         return <Banknote className="w-4 h-4 text-gray-500" />;
//     }
//   };

//   // Client-side search filtering
//   const filteredPayments = payments.filter((p) => {
//     const customerName = p.customerId?.name || p.customerId?.companyName || "";
//     const invoiceNum = p.invoiceId?.invoiceNumber || "";
//     const refNum = p.referenceNumber || "";
//     return (
//       customerName.toLowerCase().includes(search.toLowerCase()) ||
//       invoiceNum.toLowerCase().includes(search.toLowerCase()) ||
//       refNum.toLowerCase().includes(search.toLowerCase())
//     );
//   });

//   return (
//     <div className="min-h-screen bg-gray-50/60 font-sans text-gray-800 py-8 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-7xl mx-auto space-y-6">
//         {/* Top Actions */}
//         <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
//           <div>
//             <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
//             <p className="text-sm text-gray-500 mt-0.5">
//               Manage and track your incoming transactions.
//             </p>
//           </div>

//           <div className="flex flex-wrap items-center gap-3">
//             <div className="relative flex-1 sm:w-64 min-w-[200px]">
//               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
//               <input
//                 type="text"
//                 placeholder="Search payments..."
//                 value={search}
//                 onChange={(e) => setSearch(e.target.value)}
//                 className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-sky-500 transition-all shadow-sm"
//               />
//             </div>

//             <div className="relative">
//               <select
//                 value={selectedMethod}
//                 onChange={(e) => setSelectedMethod(e.target.value)}
//                 className="appearance-none bg-white border border-gray-200 px-4 py-2 pr-8 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none cursor-pointer shadow-sm"
//               >
//                 <option value="">All Methods</option>
//                 <option value="cash">Cash</option>
//                 <option value="bank_transfer">Bank Transfer</option>
//                 <option value="card">Credit Card</option>
//               </select>
//               <Filter className="w-4 h-4 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
//             </div>

//             <button
//               onClick={() => setIsModalOpen(true)}
//               className="inline-flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors shadow-sm whitespace-nowrap"
//             >
//               <Plus className="w-4 h-4" />
//               Record Payment
//             </button>
//           </div>
//         </div>

//         {/* Metrics Cards */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
//           <div className="bg-white p-5 rounded-xl border border-gray-200/80 shadow-sm flex justify-between items-start">
//             <div>
//               <span className="text-xs font-semibold uppercase text-gray-400 tracking-wider">
//                 TOTAL RECEIVED (30D)
//               </span>
//               <div className="mt-2 flex items-baseline gap-2">
//                 <span className="text-2xl sm:text-3xl font-bold text-gray-900">$124,500</span>
//                 <span className="inline-flex items-center text-xs font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
//                   <TrendingUp className="w-3 h-3 mr-0.5" /> 12%
//                 </span>
//               </div>
//             </div>
//           </div>

//           <div className="bg-white p-5 rounded-xl border border-gray-200/80 shadow-sm flex justify-between items-start">
//             <div>
//               <span className="text-xs font-semibold uppercase text-gray-400 tracking-wider">
//                 PENDING PAYMENTS
//               </span>
//               <div className="mt-2 flex items-baseline gap-2">
//                 <span className="text-2xl sm:text-3xl font-bold text-gray-900">$18,240</span>
//                 <span className="text-xs font-medium text-amber-600">4 invoices</span>
//               </div>
//             </div>
//           </div>

//           <div className="bg-white p-5 rounded-xl border border-gray-200/80 shadow-sm flex justify-between items-center sm:col-span-2 lg:col-span-1">
//             <div>
//               <span className="text-xs font-semibold uppercase text-gray-400 tracking-wider">
//                 RECENT SUCCESS RATE
//               </span>
//               <div className="mt-2">
//                 <span className="text-2xl sm:text-3xl font-bold text-gray-900">98.5%</span>
//               </div>
//             </div>
//             <div className="p-3 bg-sky-50 rounded-full text-sky-500">
//               <CheckCircle2 className="w-8 h-8" />
//             </div>
//           </div>
//         </div>

//         {/* Data Table */}
//         <div className="bg-white border border-gray-200/80 rounded-xl shadow-sm overflow-hidden">
//           <div className="overflow-x-auto">
//             <table className="w-full text-left border-collapse">
//               <thead>
//                 <tr className="border-b border-gray-100 bg-gray-50/50 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
//                   <th className="py-3.5 px-6">PAYMENT ID</th>
//                   <th className="py-3.5 px-6">INVOICE #</th>
//                   <th className="py-3.5 px-6">CUSTOMER</th>
//                   <th className="py-3.5 px-6">METHOD</th>
//                   <th className="py-3.5 px-6">DATE</th>
//                   <th className="py-3.5 px-6">AMOUNT</th>
//                   <th className="py-3.5 px-6">STATUS</th>
//                   <th className="py-3.5 px-6 text-right">ACTION</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-gray-100 text-sm">
//                 {loading ? (
//                   <tr>
//                     <td colSpan={8} className="py-10 text-center text-gray-400">
//                       Ku shubaya göolka...
//                     </td>
//                   </tr>
//                 ) : filteredPayments.length === 0 ? (
//                   <tr>
//                     <td colSpan={8} className="py-10 text-center text-gray-400">
//                       Lama helin wax lacag bixin ah.
//                     </td>
//                   </tr>
//                 ) : (
//                   filteredPayments.map((item) => {
//                     const payId = `PAY-${item._id.slice(-4).toUpperCase()}`;
//                     const invoiceNum = item.invoiceId?.invoiceNumber || "INV-N/A";
//                     const customerName = item.customerId?.name || "Unknown Customer";

//                     return (
//                       <tr key={item._id} className="hover:bg-gray-50/80 transition-colors">
//                         <td className="py-4 px-6 font-medium text-gray-900 whitespace-nowrap">
//                           {payId}
//                         </td>
//                         <td className="py-4 px-6 text-sky-600 font-medium whitespace-nowrap cursor-pointer hover:underline">
//                           {invoiceNum}
//                         </td>
//                         <td className="py-4 px-6 whitespace-nowrap">
//                           <div className="flex items-center gap-3">
//                             <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-700">
//                               {getInitials(customerName)}
//                             </div>
//                             <span className="font-medium text-gray-800">{customerName}</span>
//                           </div>
//                         </td>
//                         <td className="py-4 px-6 whitespace-nowrap">
//                           <div className="flex items-center gap-2 text-gray-600 capitalize">
//                             {getMethodIcon(item.paymentMethod)}
//                             <span>{item.paymentMethod.replace("_", " ")}</span>
//                           </div>
//                         </td>
//                         <td className="py-4 px-6 text-gray-500 whitespace-nowrap">
//                           {new Date(item.paymentDate).toLocaleDateString("en-US", {
//                             month: "short",
//                             day: "numeric",
//                             year: "numeric",
//                           })}
//                         </td>
//                         <td className="py-4 px-6 font-semibold text-gray-900 whitespace-nowrap">
//                           ${item.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
//                         </td>
//                         <td className="py-4 px-6 whitespace-nowrap">
//                           {item.isVoided ? (
//                             <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
//                               Voided
//                             </span>
//                           ) : (
//                             <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
//                               Completed
//                             </span>
//                           )}
//                         </td>
//                         <td className="py-4 px-6 text-right whitespace-nowrap">
//                           {!item.isVoided && (
//                             <button
//                               onClick={() => handleVoidPayment(item._id)}
//                               title="Void Payment"
//                               className="text-gray-400 hover:text-red-600 transition-colors p-1"
//                             >
//                               <Trash2 className="w-4 h-4" />
//                             </button>
//                           )}
//                         </td>
//                       </tr>
//                     );
//                   })
//                 )}
//               </tbody>
//             </table>
//           </div>

//           {/* Pagination */}
//           <div className="px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
//             <div>
//               Showing {filteredPayments.length > 0 ? (page - 1) * 10 + 1 : 0} to{" "}
//               {Math.min(page * 10, totalEntries)} of {totalEntries} entries
//             </div>

//             <div className="flex items-center gap-1">
//               <button
//                 disabled={page <= 1}
//                 onClick={() => setPage((p) => Math.max(1, p - 1))}
//                 className="p-1.5 rounded-md hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent"
//               >
//                 <ChevronLeft className="w-4 h-4" />
//               </button>

//               {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
//                 <button
//                   key={p}
//                   onClick={() => setPage(p)}
//                   className={`w-7 h-7 rounded-md font-medium transition-colors ${
//                     p === page
//                       ? "bg-sky-500 text-white"
//                       : "text-gray-700 hover:bg-gray-100"
//                   }`}
//                 >
//                   {p}
//                 </button>
//               ))}

//               <button
//                 disabled={page >= totalPages}
//                 onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
//                 className="p-1.5 rounded-md hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent"
//               >
//                 <ChevronRight className="w-4 h-4" />
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Record Payment Modal */}
//       {isModalOpen && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
//           <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
//             <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
//               <h2 className="text-lg font-bold text-gray-900">Record Payment</h2>
//               <button
//                 onClick={() => setIsModalOpen(false)}
//                 className="text-gray-400 hover:text-gray-600 rounded-lg p-1"
//               >
//                 <X className="w-5 h-5" />
//               </button>
//             </div>

//             <form onSubmit={handleRecordPayment} className="p-6 space-y-4">
//               {/* Invoice Selection Dropdown */}
//               <div>
//                 <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
//                   Select Invoice
//                 </label>
//                 <select
//                   required
//                   value={formData.invoiceId}
//                   onChange={(e) => {
//                     const selectedInv = invoices.find((inv) => inv._id === e.target.value);
//                     setFormData({
//                       ...formData,
//                       invoiceId: e.target.value,
//                       amount: selectedInv ? selectedInv.balanceDue.toString() : formData.amount,
//                     });
//                   }}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-sky-500 bg-white"
//                 >
//                   <option value="">-- Dooro Invoice --</option>
//                   {loadingInvoices ? (
//                     <option disabled>Ku shubaya Invoices-ka...</option>
//                   ) : (
//                     invoices.map((inv) => (
//                       <option key={inv._id} value={inv._id}>
//                         {inv.invoiceNumber} - (Baaqiga: ${inv.balanceDue})
//                       </option>
//                     ))
//                   )}
//                 </select>
//               </div>

//               <div>
//                 <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
//                   Amount ($)
//                 </label>
//                 <input
//                   type="number"
//                   step="0.01"
//                   required
//                   placeholder="0.00"
//                   value={formData.amount}
//                   onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-sky-500"
//                 />
//               </div>

//               <div>
//                 <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
//                   Payment Method
//                 </label>
//                 <select
//                   value={formData.paymentMethod}
//                   onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-sky-500 bg-white"
//                 >
//                   <option value="cash">Cash</option>
//                   <option value="bank_transfer">Bank Transfer</option>
//                   <option value="card">Credit Card</option>
//                   <option value="mobile_money">Mobile Money</option>
//                 </select>
//               </div>

//               <div>
//                 <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
//                   Reference Number (Optional)
//                 </label>
//                 <input
//                   type="text"
//                   placeholder="e.g. TXN-998822"
//                   value={formData.referenceNumber}
//                   onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-sky-500"
//                 />
//               </div>

//               <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
//                 <button
//                   type="button"
//                   onClick={() => setIsModalOpen(false)}
//                   className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   disabled={submitting}
//                   className="px-4 py-2 text-sm font-medium text-white bg-sky-500 hover:bg-sky-600 rounded-lg transition-colors disabled:opacity-50"
//                 >
//                   {submitting ? "Saving..." : "Save Payment"}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default PaymentsPage;











































import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  Plus,
  Filter,
  Landmark,
  CreditCard,
  Banknote,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  CheckCircle2,
  X,
  Trash2,
  FileText,
  AlertCircle,
} from "lucide-react";
import { paymentService, type PaymentFilterParams } from "../api/paymentService";
import { invoiceService, type Invoice } from "../api/invoiceService";

interface Payment {
  _id: string;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  referenceNumber?: string;
  notes?: string;
  isVoided: boolean;
  customerId?: {
    _id: string;
    name: string;
    email: string;
    companyName?: string;
  };
  invoiceId?: {
    _id: string;
    invoiceNumber?: string;
    total: number;
    balanceDue: number;
  };
}

export const PaymentsPage: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalEntries, setTotalEntries] = useState<number>(0);
  const [search, setSearch] = useState<string>("");
  const [selectedMethod, setSelectedMethod] = useState<string>("");

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [loadingInvoices, setLoadingInvoices] = useState<boolean>(false);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    invoiceId: "",
    amount: "",
    paymentMethod: "cash",
    referenceNumber: "",
    notes: "",
  });

  const loadPayments = useCallback(async () => {
    try {
      setLoading(true);
      const params: PaymentFilterParams = {
        page,
        limit: 10,
      };
      if (selectedMethod) params.paymentMethod = selectedMethod;

      const response = await paymentService.getPayments(params);
      if (response.success) {
        setPayments(response.data.payments);
        setTotalPages(response.data.pagination.pages);
        setTotalEntries(response.data.pagination.total);
      }
    } catch (err) {
      console.error("Failed to load payments", err);
    } finally {
      setLoading(false);
    }
  }, [page, selectedMethod]);

  useEffect(() => {
    loadPayments();
  }, [loadPayments]);

  useEffect(() => {
    if (isModalOpen) {
      const fetchInvoices = async () => {
        try {
          setLoadingInvoices(true);
          const res = await invoiceService.getInvoices();
          if (res.success) {
            const pendingInvoices = res.data.invoices.filter(
              (inv) => inv.status !== "paid" && inv.status !== "cancelled"
            );
            setInvoices(pendingInvoices.length > 0 ? pendingInvoices : res.data.invoices);
          }
        } catch (err) {
          console.error("Failed to fetch invoices", err);
        } finally {
          setLoadingInvoices(false);
        }
      };
      fetchInvoices();
    }
  }, [isModalOpen]);

  const handleInvoiceSelect = (invoiceId: string) => {
    const inv = invoices.find((item) => item._id === invoiceId) || null;
    setSelectedInvoice(inv);
    setFormData((prev) => ({
      ...prev,
      invoiceId,
      amount: inv ? inv.balanceDue.toString() : "",
    }));
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.invoiceId) {
      alert("Fadlan dooro Invoice sax ah!");
      return;
    }

    const payAmount = parseFloat(formData.amount);
    if (isNaN(payAmount) || payAmount <= 0) {
      alert("Fadlan geli xadiga lacagta oo sax ah!");
      return;
    }

    try {
      setSubmitting(true);

      // 1. Diiwaangeli lacag bixinta
      await paymentService.recordPayment({
        invoiceId: formData.invoiceId,
        amount: payAmount,
        paymentMethod: formData.paymentMethod,
        referenceNumber: formData.referenceNumber || undefined,
        notes: formData.notes || undefined,
      });

      // 2. Dib u cusboonaysii shaxda
      setIsModalOpen(false);
      setFormData({ invoiceId: "", amount: "", paymentMethod: "cash", referenceNumber: "", notes: "" });
      setSelectedInvoice(null);
      loadPayments();
    } catch (err: any) {
      alert(err.response?.data?.message || "Cilad ayaa dhacday inta lagu guda jiray kaydinta!");
    } finally {
      setSubmitting(false);
    }
  };

  const handleVoidPayment = async (id: string) => {
    if (!window.confirm("Ma hubtaa inaad baabi'iso (void) lacag bixintan? Tani waxay dib u soo celin doontaa baaqiga Invoice-ka.")) return;
    try {
      await paymentService.voidPayment(id);
      loadPayments();
    } catch (err: any) {
      alert(err.response?.data?.message || "Cilad ayaa dhacday!");
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return "NA";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const getMethodIcon = (method: string) => {
    switch (method.toLowerCase()) {
      case "bank_transfer":
      case "bank transfer":
        return <Landmark className="w-4 h-4 text-gray-500" />;
      case "card":
      case "credit card":
        return <CreditCard className="w-4 h-4 text-gray-500" />;
      default:
        return <Banknote className="w-4 h-4 text-gray-500" />;
    }
  };

  const filteredPayments = payments.filter((p) => {
    const customerName = p.customerId?.name || p.customerId?.companyName || "";
    const invoiceNum = p.invoiceId?.invoiceNumber || "";
    const refNum = p.referenceNumber || "";
    return (
      customerName.toLowerCase().includes(search.toLowerCase()) ||
      invoiceNum.toLowerCase().includes(search.toLowerCase()) ||
      refNum.toLowerCase().includes(search.toLowerCase())
    );
  });

  // Xisaabi Status-ka Cusub ee Invoice-ka
  const currentPayInput = parseFloat(formData.amount || "0");
  const calculatedStatus = selectedInvoice
    ? currentPayInput >= selectedInvoice.balanceDue
      ? "paid"
      : currentPayInput > 0
      ? "partially_paid"
      : selectedInvoice.status
    : null;

  return (
    <div className="min-h-screen bg-gray-50/60 font-sans text-gray-800 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Manage and track your incoming transactions.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 sm:w-64 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search payments..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-sky-500 transition-all shadow-sm"
              />
            </div>

            <div className="relative">
              <select
                value={selectedMethod}
                onChange={(e) => setSelectedMethod(e.target.value)}
                className="appearance-none bg-white border border-gray-200 px-4 py-2 pr-8 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none cursor-pointer shadow-sm"
              >
                <option value="">All Methods</option>
                <option value="cash">Cash</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="card">Credit Card</option>
              </select>
              <Filter className="w-4 h-4 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors shadow-sm whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              Record Payment
            </button>
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <div className="bg-white p-5 rounded-xl border border-gray-200/80 shadow-sm flex justify-between items-start">
            <div>
              <span className="text-xs font-semibold uppercase text-gray-400 tracking-wider">
                TOTAL RECEIVED (30D)
              </span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-bold text-gray-900">$124,500</span>
                <span className="inline-flex items-center text-xs font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                  <TrendingUp className="w-3 h-3 mr-0.5" /> 12%
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-200/80 shadow-sm flex justify-between items-start">
            <div>
              <span className="text-xs font-semibold uppercase text-gray-400 tracking-wider">
                PENDING PAYMENTS
              </span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-bold text-gray-900">$18,240</span>
                <span className="text-xs font-medium text-amber-600">4 invoices</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-200/80 shadow-sm flex justify-between items-center sm:col-span-2 lg:col-span-1">
            <div>
              <span className="text-xs font-semibold uppercase text-gray-400 tracking-wider">
                RECENT SUCCESS RATE
              </span>
              <div className="mt-2">
                <span className="text-2xl sm:text-3xl font-bold text-gray-900">98.5%</span>
              </div>
            </div>
            <div className="p-3 bg-sky-50 rounded-full text-sky-500">
              <CheckCircle2 className="w-8 h-8" />
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white border border-gray-200/80 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                  <th className="py-3.5 px-6">PAYMENT ID</th>
                  <th className="py-3.5 px-6">INVOICE #</th>
                  <th className="py-3.5 px-6">CUSTOMER</th>
                  <th className="py-3.5 px-6">METHOD</th>
                  <th className="py-3.5 px-6">DATE</th>
                  <th className="py-3.5 px-6">AMOUNT</th>
                  <th className="py-3.5 px-6">STATUS</th>
                  <th className="py-3.5 px-6 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-gray-400">
                      Ku shubaya xogta...
                    </td>
                  </tr>
                ) : filteredPayments.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-gray-400">
                      Lama helin wax lacag bixin ah.
                    </td>
                  </tr>
                ) : (
                  filteredPayments.map((item) => {
                    const payId = `PAY-${item._id.slice(-4).toUpperCase()}`;
                    const invoiceNum = item.invoiceId?.invoiceNumber || "INV-N/A";
                    const customerName = item.customerId?.name || "Unknown Customer";

                    return (
                      <tr key={item._id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="py-4 px-6 font-medium text-gray-900 whitespace-nowrap">
                          {payId}
                        </td>
                        <td className="py-4 px-6 text-sky-600 font-medium whitespace-nowrap hover:underline">
                          {invoiceNum}
                        </td>
                        <td className="py-4 px-6 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-700">
                              {getInitials(customerName)}
                            </div>
                            <span className="font-medium text-gray-800">{customerName}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 whitespace-nowrap">
                          <div className="flex items-center gap-2 text-gray-600 capitalize">
                            {getMethodIcon(item.paymentMethod)}
                            <span>{item.paymentMethod.replace("_", " ")}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-gray-500 whitespace-nowrap">
                          {new Date(item.paymentDate).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </td>
                        <td className="py-4 px-6 font-semibold text-gray-900 whitespace-nowrap">
                          ${item.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-4 px-6 whitespace-nowrap">
                          {item.isVoided ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                              Voided
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                              Completed
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-right whitespace-nowrap">
                          {!item.isVoided && (
                            <button
                              onClick={() => handleVoidPayment(item._id)}
                              title="Void Payment"
                              className="text-gray-400 hover:text-red-600 transition-colors p-1"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
            <div>
              Showing {filteredPayments.length > 0 ? (page - 1) * 10 + 1 : 0} to{" "}
              {Math.min(page * 10, totalEntries)} of {totalEntries} entries
            </div>

            <div className="flex items-center gap-1">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-md hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-7 h-7 rounded-md font-medium transition-colors ${
                    p === page
                      ? "bg-sky-500 text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {p}
                </button>
              ))}

              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded-md hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal - Record Payment */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Record Payment</h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedInvoice(null);
                }}
                className="text-gray-400 hover:text-gray-600 rounded-lg p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Select Invoice
                </label>
                <select
                  required
                  value={formData.invoiceId}
                  onChange={(e) => handleInvoiceSelect(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-sky-500 bg-white"
                >
                  <option value="">-- Dooro Invoice --</option>
                  {loadingInvoices ? (
                    <option disabled>Ku shubaya Invoices-ka...</option>
                  ) : (
                    invoices.map((inv) => (
                      <option key={inv._id} value={inv._id}>
                        {inv.invoiceNumber} - Baaqiga: ${inv.balanceDue}
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* Invoice Summary Box */}
              {selectedInvoice && (
                <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 text-xs space-y-2">
                  <div className="flex justify-between items-center text-gray-600">
                    <span className="flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5 text-slate-400" />
                      Wadarta Guud (Total):
                    </span>
                    <span className="font-semibold text-gray-900">
                      ${selectedInvoice.total.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-gray-600">
                    <span>Baaqiga Hada (Balance Due):</span>
                    <span className="font-semibold text-amber-600">
                      ${selectedInvoice.balanceDue.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                    <span className="font-medium text-gray-700">Status-ka Cusub:</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        calculatedStatus === "paid"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {calculatedStatus}
                    </span>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Amount ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-sky-500"
                />
                {selectedInvoice && currentPayInput > selectedInvoice.balanceDue && (
                  <p className="text-[11px] text-amber-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Lacagta aad gelisay waxay ka badan tahay baaqiga invoice-ka!
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Payment Method
                </label>
                <select
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-sky-500 bg-white"
                >
                  <option value="cash">Cash</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="card">Credit Card</option>
                  <option value="mobile_money">Mobile Money</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Reference Number (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. TXN-998822"
                  value={formData.referenceNumber}
                  onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Faahfaahin ama xusuusin dheeraad ah..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-sky-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setSelectedInvoice(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-sky-500 hover:bg-sky-600 rounded-lg transition-colors disabled:opacity-50"
                >
                  {submitting ? "Saving..." : "Save Payment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentsPage;