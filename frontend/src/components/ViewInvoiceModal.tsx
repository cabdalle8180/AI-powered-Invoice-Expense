// import React from "react";
// import { X } from "lucide-react";
// import { type Invoice } from "../api/invoiceService";
// import { StatusBadge } from "./StatusBadge";

// interface ViewInvoiceModalProps {
//   isOpen: boolean;
//   invoice: Invoice | null;
//   onClose: () => void;
// }

// export const ViewInvoiceModal: React.FC<ViewInvoiceModalProps> = ({
//   isOpen,
//   invoice,
//   onClose,
// }) => {
//   if (!isOpen || !invoice) return null;

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
//       <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
//         <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100">
//           <h2 className="text-xl font-semibold text-slate-800">Invoice Details</h2>
//           <button
//             onClick={onClose}
//             className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
//           >
//             <X size={20} />
//           </button>
//         </div>

//         <div className="p-6 overflow-y-auto space-y-6">
//           <div className="flex justify-between items-start">
//             <div>
//               <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Invoice Number</p>
//               <h3 className="text-2xl font-bold text-slate-900">{invoice.invoiceNumber}</h3>
//             </div>
//             <StatusBadge status={invoice.status} />
//           </div>

//           <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
//             <div>
//               <p className="text-xs text-slate-500 mb-1">Customer</p>
//               <p className="font-medium text-slate-900 text-sm">
//                 {typeof invoice.customerId === "object" ? invoice.customerId?.name : invoice.customerId}
//               </p>
//             </div>
//             <div>
//               <p className="text-xs text-slate-500 mb-1">Total Amount</p>
//               <p className="font-bold text-slate-900 text-sm">${invoice.total?.toLocaleString() ?? 0}</p>
//             </div>
//             <div>
//               <p className="text-xs text-slate-500 mb-1">Issue Date</p>
//               <p className="font-medium text-slate-900 text-sm">{new Date(invoice.issueDate).toLocaleDateString()}</p>
//             </div>
//             <div>
//               <p className="text-xs text-slate-500 mb-1">Due Date</p>
//               <p className="font-medium text-slate-900 text-sm">{new Date(invoice.dueDate).toLocaleDateString()}</p>
//             </div>
//           </div>
//         </div>

//         <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end">
//           <button
//             onClick={onClose}
//             className="px-4 py-2 bg-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-300 text-sm transition"
//           >
//             Close
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };




























import React from "react";
import { X } from "lucide-react";
import type { Invoice } from "../api/invoiceService";
import { StatusBadge } from "./StatusBadge";

interface ViewInvoiceModalProps {
  isOpen: boolean;
  invoice: Invoice | null;
  onClose: () => void;
}

export const ViewInvoiceModal: React.FC<ViewInvoiceModalProps> = ({
  isOpen,
  invoice,
  onClose,
}) => {
  if (!isOpen || !invoice) return null;

  const customerName =
    typeof invoice.customerId === "object"
      ? invoice.customerId?.name
      : "N/A";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100">
          <h2 className="text-xl font-semibold text-slate-800">Invoice Details</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">
                Invoice Number
              </p>
              <h3 className="text-2xl font-bold text-slate-900">{invoice.invoiceNumber}</h3>
            </div>
            <StatusBadge status={invoice.status} />
          </div>

          <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div>
              <p className="text-xs text-slate-500 mb-1">Customer</p>
              <p className="font-medium text-slate-900 text-sm">{customerName}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Total Amount</p>
              <p className="font-bold text-slate-900 text-sm">
                ${invoice.total?.toLocaleString() ?? 0}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Issue Date</p>
              <p className="font-medium text-slate-900 text-sm">
                {new Date(invoice.issueDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Due Date</p>
              <p className="font-medium text-slate-900 text-sm">
                {new Date(invoice.dueDate).toLocaleDateString()}
              </p>
            </div>
          </div>

          {invoice.items && invoice.items.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Items
              </h4>
              <div className="border border-slate-100 rounded-lg overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-500 text-xs uppercase border-b border-slate-100">
                    <tr>
                      <th className="p-3">Item</th>
                      <th className="p-3">Qty</th>
                      <th className="p-3">Price</th>
                      <th className="p-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {invoice.items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="p-3">{item.description}</td>
                        <td className="p-3">{item.quantity}</td>
                        <td className="p-3">${item.unitPrice}</td>
                        <td className="p-3 text-right font-medium">
                          ${(item.quantity * item.unitPrice).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-300 text-sm transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};