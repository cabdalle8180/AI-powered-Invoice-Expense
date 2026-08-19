// import React, { useState } from "react";
// import { MoreVertical, Send, CheckCircle, Trash2, Edit } from "lucide-react";
// import invoiceService, { type Invoice } from "../api/invoiceService";
// import { StatusBadge } from "./StatusBadge";
// import { EditInvoiceModal } from "./EditInvoiceModal";

// interface InvoiceTableProps {
//   invoices: Invoice[];
//   loading: boolean;
//   totalEntries: number;
//   page: number;
//   setPage: React.Dispatch<React.SetStateAction<number>>;
//   onRefresh: () => void;
// }

// export const InvoiceTable: React.FC<InvoiceTableProps> = ({
//   invoices,
//   loading,
//   totalEntries,
//   page,
//   setPage,
//   onRefresh,
// }) => {
//   const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
//   const [actionLoading, setActionLoading] = useState<boolean>(false);

//   // State-ka Edit Modal
//   const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
//   const [isEditOpen, setIsEditOpen] = useState<boolean>(false);

//   const toggleMenu = (id: string) => {
//     setActiveMenuId(activeMenuId === id ? null : id);
//   };

//   // Open Edit Modal
//   const handleOpenEdit = (inv: Invoice) => {
//     setSelectedInvoice(inv);
//     setIsEditOpen(true);
//     setActiveMenuId(null);
//   };

//   // Send Invoice Action
//   const handleSendInvoice = async (id: string) => {
//     try {
//       setActionLoading(true);
//       await invoiceService.sendInvoice(id);
//       alert("Invoice-ka waa la diray!");
//       onRefresh();
//     } catch (err: any) {
//       alert(err.response?.data?.message || "Cillad ayaa dhacday marka invoice-ka la dirayay.");
//     } finally {
//       setActionLoading(false);
//       setActiveMenuId(null);
//     }
//   };

//   // Mark as Paid Action
//   const handleMarkAsPaid = async (id: string) => {
//     try {
//       setActionLoading(true);
//       await invoiceService.updateInvoiceStatus(id, "paid");
//       alert("Invoice-ka waxaa loo calaamadeeyay Paid!");
//       onRefresh();
//     } catch (err: any) {
//       alert(err.response?.data?.message || "Cillad ayaa dhacday.");
//     } finally {
//       setActionLoading(false);
//       setActiveMenuId(null);
//     }
//   };

//   // Delete Invoice Action
//   const handleDeleteInvoice = async (id: string) => {
//     if (!window.confirm("Ma xaqiijinaysaa inaad tirto invoice-kan?")) return;
//     try {
//       setActionLoading(true);
//       await invoiceService.deleteInvoice(id);
//       alert("Invoice-ka waa la tirtiray!");
//       onRefresh();
//     } catch (err: any) {
//       alert(err.response?.data?.message || "Cillad ayaa dhacday marka la tirtirayay.");
//     } finally {
//       setActionLoading(false);
//       setActiveMenuId(null);
//     }
//   };

//   return (
//     <>
//       <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
//         <div className="overflow-x-auto">
//           <table className="w-full text-left text-sm min-w-[750px]">
//             <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium">
//               <tr>
//                 <th className="py-3.5 px-4 sm:px-6">Invoice #</th>
//                 <th className="py-3.5 px-4 sm:px-6">Customer</th>
//                 <th className="py-3.5 px-4 sm:px-6">Issue Date</th>
//                 <th className="py-3.5 px-4 sm:px-6">Due Date</th>
//                 <th className="py-3.5 px-4 sm:px-6">Amount</th>
//                 <th className="py-3.5 px-4 sm:px-6">Paid</th>
//                 <th className="py-3.5 px-4 sm:px-6">Balance</th>
//                 <th className="py-3.5 px-4 sm:px-6">Status</th>
//                 <th className="py-3.5 px-4 sm:px-6 text-center">Actions</th>
//               </tr>
//             </thead>

//             <tbody className="divide-y divide-slate-100 text-slate-700">
//               {loading ? (
//                 <tr>
//                   <td colSpan={9} className="text-center py-8 text-slate-400">
//                     Loading invoices...
//                   </td>
//                 </tr>
//               ) : invoices.length === 0 ? (
//                 <tr>
//                   <td colSpan={9} className="text-center py-8 text-slate-400">
//                     No invoices found.
//                   </td>
//                 </tr>
//               ) : (
//                 invoices.map((inv) => (
//                   <tr key={inv._id} className="hover:bg-slate-50/80 transition">
//                     <td className="py-4 px-4 sm:px-6 font-medium text-sky-600 cursor-pointer hover:underline">
//                       {inv.invoiceNumber}
//                     </td>
//                     <td className="py-4 px-4 sm:px-6 font-medium text-slate-900">
//                       {typeof inv.customerId === "object" ? inv.customerId?.name : inv.customerId}
//                     </td>
//                     <td className="py-4 px-4 sm:px-6 text-slate-500">
//                       {new Date(inv.issueDate).toLocaleDateString()}
//                     </td>
//                     <td className="py-4 px-4 sm:px-6 text-slate-500">
//                       {new Date(inv.dueDate).toLocaleDateString()}
//                     </td>
//                     <td className="py-4 px-4 sm:px-6 font-semibold text-slate-900">
//                       ${inv.total?.toLocaleString() ?? 0}
//                     </td>
//                     <td className="py-4 px-4 sm:px-6 text-slate-500">
//                       ${inv.paidAmount?.toLocaleString() ?? 0}
//                     </td>
//                     <td className="py-4 px-4 sm:px-6 font-medium text-slate-900">
//                       ${inv.balanceDue?.toLocaleString() ?? 0}
//                     </td>
//                     <td className="py-4 px-4 sm:px-6">
//                       <StatusBadge status={inv.status} />
//                     </td>

//                     {/* ACTION DROPDOWN MENU */}
//                     <td className="py-4 px-4 sm:px-6 text-center relative">
//                       <button
//                         onClick={() => toggleMenu(inv._id)}
//                         className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition"
//                       >
//                         <MoreVertical size={18} />
//                       </button>

//                       {activeMenuId === inv._id && (
//                         <>
//                           <div
//                             className="fixed inset-0 z-10"
//                             onClick={() => setActiveMenuId(null)}
//                           />

//                           <div className="absolute right-6 top-12 z-20 w-44 bg-white border border-slate-200 rounded-xl shadow-lg py-1 text-left text-xs font-medium text-slate-700">
//                             {/* UPDATE / EDIT BUTTON */}
//                             <button
//                               onClick={() => handleOpenEdit(inv)}
//                               disabled={actionLoading}
//                               className="w-full px-3 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
//                             >
//                               <Edit size={14} className="text-amber-500" />
//                               Edit Invoice
//                             </button>

//                             {/* SEND BUTTON */}
//                             <button
//                               onClick={() => handleSendInvoice(inv._id)}
//                               disabled={actionLoading}
//                               className="w-full px-3 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
//                             >
//                               <Send size={14} className="text-sky-500" />
//                               Send Invoice
//                             </button>

//                             {/* MARK AS PAID BUTTON */}
//                             {inv.status !== "paid" && (
//                               <button
//                                 onClick={() => handleMarkAsPaid(inv._id)}
//                                 disabled={actionLoading}
//                                 className="w-full px-3 py-2 hover:bg-slate-50 flex items-center gap-2 text-emerald-600"
//                               >
//                                 <CheckCircle size={14} />
//                                 Mark as Paid
//                               </button>
//                             )}

//                             {/* DELETE BUTTON */}
//                             <button
//                               onClick={() => handleDeleteInvoice(inv._id)}
//                               disabled={actionLoading}
//                               className="w-full px-3 py-2 hover:bg-slate-50 flex items-center gap-2 text-rose-600 border-t border-slate-100"
//                             >
//                               <Trash2 size={14} />
//                               Delete Invoice
//                             </button>
//                           </div>
//                         </>
//                       )}
//                     </td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>
//         </div>

//         {/* PAGINATION */}
//         <div className="py-4 px-4 sm:px-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-slate-500">
//           <span>Showing {invoices.length} of {totalEntries} entries</span>
//           <div className="flex items-center gap-2">
//             <button
//               disabled={page === 1}
//               onClick={() => setPage((p) => Math.max(1, p - 1))}
//               className="px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 text-slate-700 transition"
//             >
//               Prev
//             </button>
//             <button
//               onClick={() => setPage((p) => p + 1)}
//               className="px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-700 transition"
//             >
//               Next
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* EDIT MODAL */}
//       <EditInvoiceModal
//         isOpen={isEditOpen}
//         invoice={selectedInvoice}
//         onClose={() => {
//           setIsEditOpen(false);
//           setSelectedInvoice(null);
//         }}
//         onSuccess={onRefresh}
//       />
//     </>
//   );
// };











import React, { useState } from "react";
import { Eye, CheckCircle, Trash2, Edit } from "lucide-react";
import invoiceService, { type Invoice } from "../api/invoiceService";
import { StatusBadge } from "./StatusBadge";
import { EditInvoiceModal } from "./EditInvoiceModal";
import { ViewInvoiceModal } from "./ViewInvoiceModal"; // KUDAR SOO DEJINTAN (IMPORT)

interface InvoiceTableProps {
  invoices: Invoice[];
  loading: boolean;
  totalEntries: number;
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  onRefresh: () => void;
}

export const InvoiceTable: React.FC<InvoiceTableProps> = ({
  invoices,
  loading,
  totalEntries,
  page,
  setPage,
  onRefresh,
}) => {
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  // States-ka Edit Modal
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false);

  // States-ka View Modal (CUSUB)
  const [viewInvoice, setViewInvoice] = useState<Invoice | null>(null);
  const [isViewOpen, setIsViewOpen] = useState<boolean>(false);

  // Open Edit Modal
  const handleOpenEdit = (inv: Invoice) => {
    setSelectedInvoice(inv);
    setIsEditOpen(true);
  };

  // Open View Modal (CUSUB)
  const handleView = (inv: Invoice) => {
    setViewInvoice(inv);
    setIsViewOpen(true);
  };

  // Mark as Paid Action
  const handleMarkAsPaid = async (id: string) => {
    try {
      setActionLoading(true);
      await invoiceService.updateInvoiceStatus(id, "paid");
      alert("Invoice-ka waxaa loo calaamadeeyay Paid!");
      onRefresh();
    } catch (err: any) {
      alert(err.response?.data?.message || "Cillad ayaa dhacday.");
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Action
  const handleDeleteInvoice = async (id: string) => {
    if (!window.confirm("Ma xaqiijinaysaa inaad tirto invoice-kan?")) return;
    try {
      setActionLoading(true);
      await invoiceService.deleteInvoice(id);
      alert("Invoice-ka waa la tirtiray!");
      onRefresh();
    } catch (err: any) {
      alert(err.response?.data?.message || "Cillad ayaa dhacday marka la tirtirayay.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[750px]">
            {/* HEAD-KA TABLE-KA (Sidiisii buu ahaanayaa) */}
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium">
              <tr>
                <th className="py-3.5 px-4 sm:px-6">Invoice #</th>
                <th className="py-3.5 px-4 sm:px-6">Customer</th>
                <th className="py-3.5 px-4 sm:px-6">Issue Date</th>
                <th className="py-3.5 px-4 sm:px-6">Due Date</th>
                <th className="py-3.5 px-4 sm:px-6">Amount</th>
                <th className="py-3.5 px-4 sm:px-6">Paid</th>
                <th className="py-3.5 px-4 sm:px-6">Balance</th>
                <th className="py-3.5 px-4 sm:px-6">Status</th>
                <th className="py-3.5 px-4 sm:px-6 text-center">Actions</th>
              </tr>
            </thead>

            {/* BODY-GA TABLE-KA */}
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-slate-400">Loading invoices...</td>
                </tr>
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-slate-400">No invoices found.</td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv._id} className="hover:bg-slate-50/80 transition">
                    <td className="py-4 px-4 sm:px-6 font-medium text-sky-600 cursor-pointer hover:underline" onClick={() => handleView(inv)}>
                      {inv.invoiceNumber}
                    </td>
                    <td className="py-4 px-4 sm:px-6 font-medium text-slate-900">
                      {typeof inv.customerId === "object" ? inv.customerId?.name : inv.customerId}
                    </td>
                    <td className="py-4 px-4 sm:px-6 text-slate-500">
                      {new Date(inv.issueDate).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4 sm:px-6 text-slate-500">
                      {new Date(inv.dueDate).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4 sm:px-6 font-semibold text-slate-900">
                      ${inv.total?.toLocaleString() ?? 0}
                    </td>
                    <td className="py-4 px-4 sm:px-6 text-slate-500">
                      ${inv.paidAmount?.toLocaleString() ?? 0}
                    </td>
                    <td className="py-4 px-4 sm:px-6 font-medium text-slate-900">
                      ${inv.balanceDue?.toLocaleString() ?? 0}
                    </td>
                    <td className="py-4 px-4 sm:px-6">
                      <StatusBadge status={inv.status} />
                    </td>

                    {/* ACTIONS */}
                    <td className="py-4 px-4 sm:px-6">
                      <div className="flex items-center justify-center gap-2">
                        {/* VIEW BUTTON */}
                        <button
                          title="View Invoice"
                          onClick={() => handleView(inv)}
                          disabled={actionLoading}
                          className="p-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 hover:text-indigo-700 rounded-md transition disabled:opacity-50"
                        >
                          <Eye size={16} />
                        </button>

                        <button
                          title="Edit Invoice"
                          onClick={() => handleOpenEdit(inv)}
                          disabled={actionLoading}
                          className="p-1.5 bg-amber-50 text-amber-600 hover:bg-amber-100 hover:text-amber-700 rounded-md transition disabled:opacity-50"
                        >
                          <Edit size={16} />
                        </button>

                        {inv.status !== "paid" && (
                          <button
                            title="Mark as Paid"
                            onClick={() => handleMarkAsPaid(inv._id)}
                            disabled={actionLoading}
                            className="p-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700 rounded-md transition disabled:opacity-50"
                          >
                            <CheckCircle size={16} />
                          </button>
                        )}

                        <button
                          title="Delete Invoice"
                          onClick={() => handleDeleteInvoice(inv._id)}
                          disabled={actionLoading}
                          className="p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 hover:text-rose-700 rounded-md transition disabled:opacity-50"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* PAGINATION */}
        <div className="py-4 px-4 sm:px-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-slate-500">
          <span>Showing {invoices.length} of {totalEntries} entries</span>
          <div className="flex items-center gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 text-slate-700 transition"
            >
              Prev
            </button>
            <button
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-700 transition"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* EDIT MODAL */}
      <EditInvoiceModal
        isOpen={isEditOpen}
        invoice={selectedInvoice}
        onClose={() => {
          setIsEditOpen(false);
          setSelectedInvoice(null);
        }}
        onSuccess={onRefresh}
      />

      {/* VIEW MODAL (CUSUB) */}
      <ViewInvoiceModal
        isOpen={isViewOpen}
        invoice={viewInvoice}
        onClose={() => {
          setIsViewOpen(false);
          setViewInvoice(null);
        }}
      />
    </>
  );
};