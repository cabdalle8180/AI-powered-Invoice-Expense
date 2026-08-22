import React, { useEffect, useState } from 'react';
import { 
  getCustomers, 
  createCustomer, 
  updateCustomer, 
  deleteCustomer, 
  restoreCustomer 
} from "../api/customerService"; 
import type { 
  Customer, 
  CreateCustomerData,
  UpdateCustomerData
} from '../api/customerService';
import { 
  Search, 
  Plus, 
  Pencil, 
  Trash2, 
  RotateCcw, 
  ChevronLeft, 
  ChevronRight,
  Users,
  CheckCircle,
  Wallet,
  Filter,
  Download
} from 'lucide-react';

import { usePermission } from "../hooks/usePermission";

export const Customers: React.FC = () => {
  const { can } = usePermission();
  const canCreate = can("customer:create");
  const canUpdate = can("customer:update");
  const canDelete = can("customer:delete");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Refresh Trigger State
  const [refreshKey, setRefreshKey] = useState(0);
  const refetch = () => setRefreshKey((prev) => prev + 1);

  // Modal States (Create & Edit)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const [formData, setFormData] = useState<CreateCustomerData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
    position: 'customer',
    taxNumber: '',
  });
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch Customers Effect
  useEffect(() => {
    let isMounted = true;

    const loadCustomers = async () => {
      setLoading(true);
      try {
        const response = await getCustomers(page, 10, search);
        if (response.success && isMounted) {
          setCustomers(response.data.customers);
          setTotalPages(response.data.pagination.pages);
        }
      } catch (err) {
        if (isMounted) {
          const error = err as { response?: { data?: { message?: string } } };
          console.error(error.response?.data?.message || 'Error fetching customers');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadCustomers();

    return () => {
      isMounted = false;
    };
  }, [page, search, refreshKey]);

  // Open Modal for Create
  const handleOpenCreateModal = () => {
    setEditingCustomer(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
      address: '',
      position: 'customer',
      taxNumber: '',
    });
    setErrorMsg('');
    setIsModalOpen(true);
  };

  // Open Modal for Edit
  const handleOpenEditModal = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      email: customer.email,
      phone: customer.phone || '',
      address: customer.address || '',
      position: customer.position || 'customer',
      taxNumber: customer.taxNumber || '',
    });
    setErrorMsg('');
    setIsModalOpen(true);
  };

  // Submit Handler (Create or Update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      if (editingCustomer) {
        const { password, confirmPassword, ...updateData } = formData;
        await updateCustomer(editingCustomer._id, updateData as UpdateCustomerData);
      } else {
        if (!formData.password || !formData.confirmPassword) {
          setErrorMsg('Password and confirm password are required.');
          return;
        }
        if (formData.password !== formData.confirmPassword) {
          setErrorMsg('Passwords do not match.');
          return;
        }
        await createCustomer(formData);
      }
      setIsModalOpen(false);
      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        address: '',
        position: 'customer',
        taxNumber: '',
      });
      setEditingCustomer(null);
      refetch();
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setErrorMsg(error.response?.data?.message || 'Wax ka qaldamay kaydinta macaamilka');
    }
  };

  // Delete Customer
  const handleDelete = async (id: string) => {
    if (confirm('Ma hubaal tahay inaad damiso macaamilkan?')) {
      try {
        await deleteCustomer(id);
        refetch();
      } catch (err) {
        const error = err as { response?: { data?: { message?: string } } };
        alert(error.response?.data?.message || 'Ka tirtiridda waa lagu dhibtooday');
      }
    }
  };

  // Restore Customer
  const handleRestore = async (id: string) => {
    try {
      await restoreCustomer(id);
      refetch();
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      alert(error.response?.data?.message || 'Soo celinta waa lagu dhibtooday');
    }
  };

  // Helper to get initials
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const activeCount = customers.filter(c => c.isActive).length;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Macaamiisha (Customers)</h1>
            <p className="text-sm text-slate-500 mt-1">Maaree macluumaadka macaamiishaada iyo xaaladahooda</p>
          </div>
          {canCreate && (
          <button
            onClick={handleOpenCreateModal}
            className="bg-sky-500 hover:bg-sky-600 text-white font-semibold px-4 py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 shadow-sm transition cursor-pointer"
          >
            <Plus size={18} /> Ku dar Macaamil
          </button>
          )}
        </div>

        {/* KPI Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
              <span>Warta Macaamiisha</span>
              <div className="w-8 h-8 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center">
                <Users size={16} />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-extrabold text-slate-900">{customers.length}</span>
              <p className="text-xs text-slate-400 font-medium mt-2">Boggan ku jira</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
              <span>Macaamiisha Shaqaynaysa</span>
              <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle size={16} />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-extrabold text-slate-900">{activeCount}</span>
              <p className="text-xs text-emerald-600 font-medium mt-2">Active now</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
              <span>Ammarrada/Xaaladda</span>
              <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
                <Wallet size={16} />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-extrabold text-slate-900">{totalPages}</span>
              <p className="text-xs text-slate-400 font-medium mt-2">Warta Bogagga (Total Pages)</p>
            </div>
          </div>
        </div>

        {/* Search, Filters & Table Section */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative max-w-xs w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Raadso magac, email, ama telefoon..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 shadow-sm"
              />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <button className="flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition shadow-sm cursor-pointer">
                <Filter size={16} /> Filter
              </button>
              <button className="flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition shadow-sm cursor-pointer">
                <Download size={16} /> Export
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50/60 border-b border-slate-200 text-slate-500 font-semibold text-xs">
                    <th className="py-3.5 px-6">Magaca Macaamilka</th>
                    <th className="py-3.5 px-6">Email</th>
                    <th className="py-3.5 px-6">Telefoonka</th>
                    <th className="py-3.5 px-6">Position</th>
                    <th className="py-3.5 px-6 text-center">Xaalka (Status)</th>
                    <th className="py-3.5 px-6 text-right">Aksyon (Actions)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-slate-400 font-medium">Waxaa lagu jiraa soo rarida macaamiisha...</td>
                    </tr>
                  ) : customers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-slate-400 font-medium">Wax macaamil ah lagu ma helin.</td>
                    </tr>
                  ) : (
                    customers.map((c) => (
                      <tr key={c._id} className="hover:bg-slate-50/80 transition">
                        
                        {/* Name & Avatar */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-600 font-bold text-xs flex items-center justify-center shrink-0 border border-slate-200">
                              {getInitials(c.name)}
                            </div>
                            <span className="font-semibold text-slate-900">{c.name}</span>
                          </div>
                        </td>

                        {/* Email */}
                        <td className="py-4 px-6 text-slate-600 font-medium">{c.email}</td>

                        {/* Phone */}
                        <td className="py-4 px-6 text-slate-600 font-medium">{c.phone || '-'}</td>

                        {/* Company */}
                        <td className="py-4 px-6 text-slate-600 font-medium capitalize">{c.position || 'customer'}</td>

                        {/* Status Badge */}
                        <td className="py-4 px-6 text-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            c.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
                          }`}>
                            {c.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>

                        {/* Action Buttons */}
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {/* Edit Button */}
                            {canUpdate && (
                            <button
                              onClick={() => handleOpenEditModal(c)}
                              className="p-2 hover:bg-sky-50 text-slate-400 hover:text-sky-600 rounded-lg transition cursor-pointer"
                              title="Wax ka beddel"
                            >
                              <Pencil size={16} />
                            </button>
                            )}

                            {/* Delete / Restore Button */}
                            {canDelete && (
                            c.isActive ? (
                              <button
                                onClick={() => handleDelete(c._id)}
                                className="p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition cursor-pointer"
                                title="Dami Macaamilka"
                              >
                                <Trash2 size={16} />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleRestore(c._id)}
                                className="p-2 hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 rounded-lg transition cursor-pointer"
                                title="Soo celi Macaamilka"
                              >
                                <RotateCcw size={16} />
                              </button>
                            )
                            )}
                          </div>
                        </td>

                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer / Pagination */}
            <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <span>Bogga {page} ee {totalPages}</span>
              
              <div className="flex items-center gap-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 transition cursor-pointer disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={16} />
                </button>

                <span className="px-3 py-1 bg-sky-50 text-sky-600 rounded-lg font-bold">{page}</span>

                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 transition cursor-pointer disabled:cursor-not-allowed"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Modal - Create / Update Customer */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-100">
            <h2 className="text-lg font-bold text-slate-900 mb-4">
              {editingCustomer ? 'Wax ka beddel Macaamilka' : 'Diiwaangali Macaamil Cusub'}
            </h2>
            
            {errorMsg && (
              <div className="bg-rose-50 text-rose-600 text-xs p-3 rounded-xl mb-4 border border-rose-200">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Magaca Buuxa *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Email *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
                />
              </div>
              {!editingCustomer && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Password *</label>
                    <input
                      type="password"
                      required
                      minLength={8}
                      value={formData.password || ''}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Confirm Password *</label>
                    <input
                      type="password"
                      required
                      minLength={8}
                      value={formData.confirmPassword || ''}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
                    />
                  </div>
                </>
              )}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Telefoonka</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Cinwaanka</label>
                <input
                  type="text"
                  value={formData.address || ''}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Position</label>
                <select
                  value={formData.position || 'customer'}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
                >
                  <option value="customer">Customer</option>
                  <option value="Shop Owner">Shop Owner</option>
                  <option value="Manager">Manager</option>
                  <option value="Cashier">Cashier</option>
                  <option value="Accountant">Accountant</option>
                  <option value="Employee">Employee</option>
                  <option value="Director">Director</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Tax Number</label>
                <input
                  type="text"
                  value={formData.taxNumber || ''}
                  onChange={(e) => setFormData({ ...formData, taxNumber: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium hover:bg-slate-50 transition cursor-pointer"
                >
                  Ka noqod
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-sky-500 text-white rounded-xl text-sm font-semibold hover:bg-sky-600 transition shadow-sm cursor-pointer"
                >
                  {editingCustomer ? 'Cusboonaysii' : 'Kaydi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Customers;