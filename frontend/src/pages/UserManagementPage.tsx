import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Eye,
  Loader2,
  Users,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import {
  getOwners,
  createOwner,
  updateOwner,
  toggleOwnerStatus,
  deleteOwner,
  type OwnerRecord,
  type CreateOwnerData,
} from "../api/ownerService";

const UserManagementPage: React.FC = () => {
  const [owners, setOwners] = useState<OwnerRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [viewOwner, setViewOwner] = useState<OwnerRecord | null>(null);
  const [editingOwner, setEditingOwner] = useState<OwnerRecord | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    type: "deactivate" | "activate" | "delete";
    owner: OwnerRecord;
  } | null>(null);

  const [form, setForm] = useState<CreateOwnerData>({
    businessName: "",
    ownerName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const loadOwners = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getOwners(page, 10, search);
      setOwners(res.data.owners);
      setTotalPages(res.data.pagination.pages);
    } catch {
      setError("Unable to load owners. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOwners();
  }, [page, search]);

  const openCreate = () => {
    setEditingOwner(null);
    setForm({
      businessName: "",
      ownerName: "",
      email: "",
      password: "",
      confirmPassword: "",
      phone: "",
    });
    setFormError("");
    setModalOpen(true);
  };

  const openEdit = (owner: OwnerRecord) => {
    setEditingOwner(owner);
    setForm({
      businessName: owner.business?.name || "",
      ownerName: owner.name,
      email: owner.email,
      password: "",
      confirmPassword: "",
      phone: owner.phone || "",
    });
    setFormError("");
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);

    try {
      if (editingOwner) {
        await updateOwner(editingOwner.id, {
          ownerName: form.ownerName,
          businessName: form.businessName,
          email: form.email,
          phone: form.phone,
          ...(form.password ? { password: form.password } : {}),
        });
        toast.success("Owner updated successfully.");
      } else {
        if (form.password !== form.confirmPassword) {
          setFormError("Passwords do not match.");
          return;
        }
        await createOwner(form);
        toast.success("Owner and business created successfully.");
      }
      setModalOpen(false);
      loadOwners();
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { message?: string } } };
      setFormError(apiErr.response?.data?.message || "Operation failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirm = async () => {
    if (!confirmAction) return;
    try {
      if (confirmAction.type === "delete") {
        await deleteOwner(confirmAction.owner.id);
        toast.success("Owner deactivated.");
      } else {
        await toggleOwnerStatus(
          confirmAction.owner.id,
          confirmAction.type === "activate"
        );
        toast.success(
          confirmAction.type === "activate" ? "Owner activated." : "Owner deactivated."
        );
      }
      setConfirmAction(null);
      loadOwners();
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { message?: string } } };
      toast.error(apiErr.response?.data?.message || "Action failed.");
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
            <p className="text-sm text-slate-500 mt-1">Manage business owners across the platform.</p>
          </div>
          <button
            onClick={openCreate}
            className="bg-sky-500 hover:bg-sky-600 text-white font-semibold px-4 py-2.5 rounded-xl text-sm flex items-center gap-2"
          >
            <Plus size={18} /> Create Owner
          </button>
        </div>

        <div className="relative max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search owners..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm"
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-700 text-sm rounded-xl p-4">{error}</div>
        )}

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="py-16 flex justify-center">
              <Loader2 className="animate-spin text-sky-500" size={28} />
            </div>
          ) : owners.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <Users className="mx-auto mb-3 opacity-40" size={32} />
              <p>No owners found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase">
                    <th className="px-6 py-3 text-left">Owner Name</th>
                    <th className="px-6 py-3 text-left">Business Name</th>
                    <th className="px-6 py-3 text-left">Email</th>
                    <th className="px-6 py-3 text-left">Role</th>
                    <th className="px-6 py-3 text-center">Status</th>
                    <th className="px-6 py-3 text-left">Created</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {owners.map((owner) => (
                    <tr key={owner.id} className="hover:bg-slate-50/80">
                      <td className="px-6 py-4 font-semibold text-slate-900">{owner.name}</td>
                      <td className="px-6 py-4 text-slate-600">{owner.business?.name || "—"}</td>
                      <td className="px-6 py-4 text-slate-600">{owner.email}</td>
                      <td className="px-6 py-4 capitalize text-slate-600">{owner.role}</td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            owner.isActive
                              ? "bg-emerald-50 text-emerald-600"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {owner.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        {new Date(owner.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setViewOwner(owner)}
                            className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-sky-600"
                            title="View"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => openEdit(owner)}
                            className="p-2 hover:bg-sky-50 rounded-lg text-slate-400 hover:text-sky-600"
                            title="Edit"
                          >
                            <Pencil size={16} />
                          </button>
                          {owner.isActive ? (
                            <button
                              onClick={() =>
                                setConfirmAction({ type: "deactivate", owner })
                              }
                              className="p-2 hover:bg-amber-50 rounded-lg text-slate-400 hover:text-amber-600 text-xs font-medium px-2"
                            >
                              Deactivate
                            </button>
                          ) : (
                            <button
                              onClick={() =>
                                setConfirmAction({ type: "activate", owner })
                              }
                              className="p-2 hover:bg-emerald-50 rounded-lg text-slate-400 hover:text-emerald-600 text-xs font-medium px-2"
                            >
                              Activate
                            </button>
                          )}
                          <button
                            onClick={() => setConfirmAction({ type: "delete", owner })}
                            className="p-2 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
            <span>Page {page} of {totalPages}</span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="p-1.5 border rounded-lg disabled:opacity-40"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="p-1.5 border rounded-lg disabled:opacity-40"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900">
                {editingOwner ? "Edit Owner" : "Create Owner"}
              </h2>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X size={20} />
              </button>
            </div>
            {formError && (
              <div className="bg-rose-50 text-rose-600 text-xs p-3 rounded-xl mb-4 border border-rose-200">
                {formError}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Business Name *</label>
                <input
                  required
                  value={form.businessName}
                  onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Owner Name *</label>
                <input
                  required
                  value={form.ownerName}
                  onChange={(e) => setForm({ ...form, ownerName: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Email *</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Password {editingOwner ? "(optional)" : "*"}
                </label>
                <input
                  type="password"
                  required={!editingOwner}
                  minLength={8}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm"
                />
              </div>
              {!editingOwner && (
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Confirm Password *</label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={form.confirmPassword}
                    onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm"
                  />
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Phone</label>
                <input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-sky-500 text-white rounded-xl text-sm font-semibold disabled:opacity-60"
                >
                  {submitting ? "Saving..." : editingOwner ? "Update" : "Create Owner"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewOwner && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900">Owner Details</h2>
              <button onClick={() => setViewOwner(null)} className="text-slate-400">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-2 text-sm">
              <p><span className="font-semibold">Owner:</span> {viewOwner.name}</p>
              <p><span className="font-semibold">Business:</span> {viewOwner.business?.name || "—"}</p>
              <p><span className="font-semibold">Email:</span> {viewOwner.email}</p>
              <p><span className="font-semibold">Role:</span> {viewOwner.role}</p>
              <p><span className="font-semibold">Status:</span> {viewOwner.isActive ? "Active" : "Inactive"}</p>
              <p><span className="font-semibold">Created:</span> {new Date(viewOwner.createdAt).toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}

      {confirmAction && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="font-bold text-slate-900 mb-2">Confirm Action</h3>
            <p className="text-sm text-slate-600 mb-4">
              {confirmAction.type === "delete"
                ? `Deactivate owner "${confirmAction.owner.name}" and their business?`
                : confirmAction.type === "activate"
                  ? `Activate owner "${confirmAction.owner.name}"?`
                  : `Deactivate owner "${confirmAction.owner.name}" and their business?`}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmAction(null)}
                className="px-4 py-2 border rounded-xl text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="px-4 py-2 bg-sky-500 text-white rounded-xl text-sm font-semibold"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagementPage;
