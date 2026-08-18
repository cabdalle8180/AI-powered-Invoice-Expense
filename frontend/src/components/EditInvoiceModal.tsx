import React, { useState, useEffect } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import invoiceService, { type Invoice, type UpdateInvoicePayload, type IInvoiceItem } from "../api/invoiceService";
import { getCustomers, type Customer } from "../api/customerService";

interface EditInvoiceModalProps {
  isOpen: boolean;
  invoice: Invoice | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const EditInvoiceModal: React.FC<EditInvoiceModalProps> = ({
  isOpen,
  invoice,
  onClose,
  onSuccess,
}) => {
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState<boolean>(false);

  const [formData, setFormData] = useState<UpdateInvoicePayload>({
    customerId: "",
    invoiceNumber: "",
    issueDate: "",
    dueDate: "",
    items: [],
    notes: "",
  });

  // Soo qaad Customer-yada iyo xogta Invoice-ka marka modal-ka la furo
  useEffect(() => {
    if (isOpen && invoice) {
      const fetchCustomers = async () => {
        try {
          setLoadingCustomers(true);
          const res = await getCustomers(1, 100, "", true);
          setCustomers(res.data?.customers || []);
        } catch (err) {
          console.error("Error fetching customers:", err);
        } finally {
          setLoadingCustomers(false);
        }
      };

      fetchCustomers();

      // Shub xogta invoice-ka la doortay
      setFormData({
        customerId: typeof invoice.customerId === "object" ? invoice.customerId._id : invoice.customerId,
        invoiceNumber: invoice.invoiceNumber,
        issueDate: invoice.issueDate ? new Date(invoice.issueDate).toISOString().split("T")[0] : "",
        dueDate: invoice.dueDate ? new Date(invoice.dueDate).toISOString().split("T")[0] : "",
        items: invoice.items && invoice.items.length > 0 
          ? invoice.items 
          : [{ description: "", quantity: 1, unitPrice: 0 }],
        notes: invoice.notes || "",
      });
    }
  }, [isOpen, invoice]);

  if (!isOpen || !invoice) return null;

  const handleItemChange = (index: number, field: keyof IInvoiceItem, value: any) => {
    const updatedItems = [...(formData.items || [])];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setFormData({ ...formData, items: updatedItems });
  };

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [...(formData.items || []), { description: "", quantity: 1, unitPrice: 0 }],
    });
  };

  const handleRemoveItem = (index: number) => {
    if (!formData.items || formData.items.length === 1) return;
    const updatedItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: updatedItems });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      await invoiceService.updateInvoice(invoice._id, formData);
      alert("Invoice-ka waa la cusbooneysiiyay!");
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Error updating invoice:", err);
      alert(err.response?.data?.message || "Cillad ayaa dhacday marka la cusbooneysiinayay invoice-ka.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl border border-slate-100 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
          <h3 className="text-lg font-bold text-slate-900">Edit Invoice ({invoice.invoiceNumber})</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Customer
              </label>
              <select
                required
                value={formData.customerId}
                onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:border-sky-500"
              >
                <option value="">
                  {loadingCustomers ? "Loading customers..." : "-- Select Customer --"}
                </option>
                {customers.map((cust) => (
                  <option key={cust._id} value={cust._id}>
                    {cust.name} {cust.companyName ? `(${cust.companyName})` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Invoice Number
              </label>
              <input
                type="text"
                required
                value={formData.invoiceNumber}
                onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Issue Date
              </label>
              <input
                type="date"
                required
                value={formData.issueDate as string}
                onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Due Date
              </label>
              <input
                type="date"
                required
                value={formData.dueDate as string}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div className="pt-2">
            <label className="block text-xs font-semibold text-slate-600 mb-2">
              Invoice Items
            </label>
            {formData.items?.map((item, index) => (
              <div key={index} className="flex items-center gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Description"
                  required
                  value={item.description}
                  onChange={(e) => handleItemChange(index, "description", e.target.value)}
                  className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-sky-500"
                />
                <input
                  type="number"
                  placeholder="Qty"
                  min="1"
                  required
                  value={item.quantity}
                  onChange={(e) => handleItemChange(index, "quantity", Number(e.target.value))}
                  className="w-20 px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-sky-500"
                />
                <input
                  type="number"
                  placeholder="Price"
                  min="0"
                  required
                  value={item.unitPrice}
                  onChange={(e) => handleItemChange(index, "unitPrice", Number(e.target.value))}
                  className="w-24 px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-sky-500"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveItem(index)}
                  className="p-2 text-rose-500 hover:text-rose-700"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddItem}
              className="mt-1 text-xs font-medium text-sky-600 hover:text-sky-700 flex items-center gap-1"
            >
              <Plus size={14} /> Add Item
            </button>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Notes</label>
            <textarea
              rows={2}
              placeholder="Additional details..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition"
            >
              {submitting ? "Updating..." : "Update Invoice"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};