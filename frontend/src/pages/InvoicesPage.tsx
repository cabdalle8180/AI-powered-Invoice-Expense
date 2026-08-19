// import React, { useState, useEffect } from "react";
// import { Search, Bell, HelpCircle, Plus } from "lucide-react";
// import invoiceService from "../api/invoiceService";
// import type { Invoice } from "../api/invoiceService";
// import { CreateInvoiceModal } from "../components/CreateInvoiceModal";
// import { InvoiceTable } from "../components/InvoiceTable";
// // import InvoiceTable from "../components/InvoiceTable";

// export const InvoicesPage: React.FC = () => {
//   const [invoices, setInvoices] = useState<Invoice[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [search, setSearch] = useState<string>("");
//   const [statusFilter, setStatusFilter] = useState<string>("all");
//   const [page, setPage] = useState<number>(1);
//   const [totalEntries, setTotalEntries] = useState<number>(0);
//   const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

//   const fetchInvoices = async () => {
//     try {
//       setLoading(true);
//       const res = await invoiceService.getInvoices({
//         page,
//         limit: 10,
//         search: search || undefined,
//         status: statusFilter !== "all" ? (statusFilter as any) : undefined,
//       });
//       setInvoices(res.data.invoices);
//       setTotalEntries(res.data.pagination.total);
//     } catch (err) {
//       console.error("Error fetching invoices:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchInvoices();
//   }, [page, search, statusFilter]);

//   return (
//     <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
//       {/* TOP NAVBAR */}
//       <header className="border-b border-slate-200 bg-white px-4 sm:px-8 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-4">
//         <div className="relative w-full sm:w-80 md:w-96">
//           <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
//           <input
//             type="text"
//             placeholder="Search invoices..."
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//             className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
//           />
//         </div>

//         <div className="flex items-center justify-between w-full sm:w-auto gap-4">
//           <div className="flex items-center gap-3">
//             <button className="text-slate-500 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition">
//               <Bell size={20} />
//             </button>
//             <button className="text-slate-500 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition">
//               <HelpCircle size={20} />
//             </button>
//           </div>
//           <div className="w-8 h-8 rounded-full bg-slate-300 overflow-hidden cursor-pointer">
//             <img
//               src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80"
//               alt="User Profile"
//               className="w-full h-full object-cover"
//             />
//           </div>
//         </div>
//       </header>

//       {/* MAIN CONTENT AREA */}
//       <main className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
//         <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
//           <h2 className="text-2xl font-bold text-slate-900">Invoices</h2>

//           <div className="flex flex-wrap items-center gap-2 sm:gap-3">
//             <select
//               value={statusFilter}
//               onChange={(e) => setStatusFilter(e.target.value)}
//               className="flex-1 sm:flex-none bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:border-sky-500"
//             >
//               <option value="all">All Statuses</option>
//               <option value="paid">Paid</option>
//               <option value="overdue">Overdue</option>
//               <option value="sent">Sent</option>
//               <option value="draft">Draft</option>
//             </select>

//             <button
//               onClick={() => setIsModalOpen(true)}
//               className="w-full sm:w-auto bg-sky-500 hover:bg-sky-600 text-white font-medium px-4 py-2 rounded-lg flex items-center justify-center gap-1.5 shadow-sm transition text-sm"
//             >
//               <Plus size={16} /> Create Invoice
//             </button>
//           </div>
//         </div>

//         {/* INVOICE TABLE */}
//         {/* <InvoiceTable
//           invoices={invoices}
//           loading={loading}
//           totalEntries={totalEntries}
//           page={page}
//           setPage={setPage}
//         /> */}

//         <InvoiceTable
//   invoices={invoices}
//   loading={loading}
//   totalEntries={totalEntries}
//   page={page}
//   setPage={setPage}
//   onRefresh={fetchInvoices} // <-- Ku dar halkan
// />
//       </main>

//       {/* MODAL */}
//       <CreateInvoiceModal
//         isOpen={isModalOpen}
//         onClose={() => setIsModalOpen(false)}
//         onSuccess={fetchInvoices}
//       />
//     </div>
//   );
// };

// export default InvoicesPage;



















import React, { useState, useEffect } from "react";
import { Search, Bell, HelpCircle, Plus } from "lucide-react";
import invoiceService from "../api/invoiceService";
import type { Invoice } from "../api/invoiceService";
import { CreateInvoiceModal } from "../components/CreateInvoiceModal";
import { InvoiceTable } from "../components/InvoiceTable";

export const InvoicesPage: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState<number>(1);
  const [totalEntries, setTotalEntries] = useState<number>(0);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const res = await invoiceService.getInvoices({
        page,
        limit: 10,
        search: search || undefined,
        status: statusFilter !== "all" ? (statusFilter as any) : undefined,
      });
      setInvoices(res.data.invoices);
      setTotalEntries(res.data.pagination.total);
    } catch (err) {
      console.error("Error fetching invoices:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [page, search, statusFilter]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      {/* TOP NAVBAR */}
      <header className="border-b border-slate-200 bg-white px-4 sm:px-8 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80 md:w-96">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search invoices..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
          />
        </div>

        <div className="flex items-center justify-between w-full sm:w-auto gap-4">
          <div className="flex items-center gap-3">
            <button className="text-slate-500 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition">
              <Bell size={20} />
            </button>
            <button className="text-slate-500 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition">
              <HelpCircle size={20} />
            </button>
          </div>
          <div className="w-8 h-8 rounded-full bg-slate-300 overflow-hidden cursor-pointer">
            <img
              src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80"
              alt="User Profile"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-2xl font-bold text-slate-900">Invoices</h2>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="flex-1 sm:flex-none bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:border-sky-500"
            >
              <option value="all">All Statuses</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
              <option value="sent">Sent</option>
              <option value="draft">Draft</option>
            </select>

            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full sm:w-auto bg-sky-500 hover:bg-sky-600 text-white font-medium px-4 py-2 rounded-lg flex items-center justify-center gap-1.5 shadow-sm transition text-sm"
            >
              <Plus size={16} /> Create Invoice
            </button>
          </div>
        </div>

        {/* INVOICE TABLE */}
        <InvoiceTable
          invoices={invoices}
          loading={loading}
          totalEntries={totalEntries}
          page={page}
          setPage={setPage}
          onRefresh={fetchInvoices}
        />
      </main>

      {/* MODAL */}
      <CreateInvoiceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchInvoices}
      />
    </div>
  );
};

export default InvoicesPage;