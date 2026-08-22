// import api from "../service/api";

// // ==========================================
// // TYPES & INTERFACES
// // ==========================================

// export type InvoiceStatus =
//   | "draft"
//   | "sent"
//   | "partially_paid"
//   | "paid"
//   | "overdue"
//   | "cancelled";

// export interface IInvoiceItem {
//   description: string;
//   quantity: number;
//   unitPrice: number;
//   total?: number;
// }

// export interface CreateInvoicePayload {
//   customerId: string;
//   invoiceNumber: string;
//   dueDate: string | Date;
//   items: IInvoiceItem[];
//   issueDate?: string | Date;
//   taxRate?: number;
//   discount?: number;
//   paidAmount?: number;
//   currency?: string;
//   notes?: string;
// }

// export interface UpdateInvoicePayload {
//   customerId?: string;
//   invoiceNumber?: string;
//   issueDate?: string | Date;
//   dueDate?: string | Date;
//   items?: IInvoiceItem[];
//   taxRate?: number;
//   discount?: number;
//   paidAmount?: number;
//   currency?: string;
//   notes?: string;
// }

// export interface InvoiceQueryParams {
//   page?: number;
//   limit?: number;
//   search?: string;
//   status?: InvoiceStatus;
//   customerId?: string;
// }

// export interface Invoice {
//   _id: string;
//   businessId: string;
//   customerId: any;
//   invoiceNumber: string;
//   issueDate: string;
//   dueDate: string;
//   items: IInvoiceItem[];
//   subtotal: number;
//   taxRate: number;
//   taxAmount: number;
//   discount: number;
//   total: number;
//   paidAmount: number;
//   balanceDue: number;
//   currency: string;
//   status: InvoiceStatus;
//   notes?: string;
//   sentAt?: string;
//   createdAt: string;
//   updatedAt: string;
// }

// export interface PaginationMeta {
//   total: number;
//   page: number;
//   limit: number;
//   pages: number;
// }

// export interface ApiResponse<T> {
//   success: boolean;
//   message?: string;
//   data: T;
// }

// // ==========================================
// // INVOICE API SERVICES
// // ==========================================

// export const invoiceService = {
//   /**
//    * Create a new invoice
//    * POST /api/invoices
//    */
//   createInvoice: async (payload: CreateInvoicePayload) => {
//     const response = await api.post<ApiResponse<{ invoice: Invoice }>>(
//       "/invoices",
//       payload
//     );
//     return response.data;
//   },

//   /**
//    * Get all invoices with optional pagination and filters
//    * GET /api/invoices
//    */
//   getInvoices: async (params?: InvoiceQueryParams) => {
//     const response = await api.get<
//       ApiResponse<{ invoices: Invoice[]; pagination: PaginationMeta }>
//     >("/invoices", { params });
//     return response.data;
//   },

//   /**
//    * Get a single invoice by ID
//    * GET /api/invoices/:id
//    */
//   getInvoiceById: async (id: string) => {
//     const response = await api.get<ApiResponse<{ invoice: Invoice }>>(
//       `/invoices/${id}`
//     );
//     return response.data;
//   },

//   /**
//    * Update an existing invoice
//    * PUT /api/invoices/:id
//    */
//   updateInvoice: async (id: string, payload: UpdateInvoicePayload) => {
//     const response = await api.put<ApiResponse<{ invoice: Invoice }>>(
//       `/invoices/${id}`,
//       payload
//     );
//     return response.data;
//   },

//   /**
//    * Soft delete / Cancel an invoice
//    * DELETE /api/invoices/:id
//    */
//   deleteInvoice: async (id: string) => {
//     const response = await api.delete<ApiResponse<{ invoice: Invoice }>>(
//       `/invoices/${id}`
//     );
//     return response.data;
//   },

//   /**
//    * Update invoice status specifically
//    * PATCH /api/invoices/:id/status
//    */
//   updateInvoiceStatus: async (id: string, status: InvoiceStatus) => {
//     const response = await api.patch<ApiResponse<{ invoice: Invoice }>>(
//       `/invoices/${id}/status`,
//       { status }
//     );
//     return response.data;
//   },

//   /**
//    * Mark invoice as sent
//    * PATCH /api/invoices/:id/send
//    */
//   sendInvoice: async (id: string) => {
//     const response = await api.patch<ApiResponse<{ invoice: Invoice }>>(
//       `/invoices/${id}/send`
//     );
//     return response.data;
//   },
// };

// export default invoiceService;





















import api from "../service/api";

export type InvoiceStatus =
  | "draft"
  | "sent"
  | "partially_paid"
  | "paid"
  | "overdue"
  | "cancelled";

export interface IInvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total?: number;
}

export interface CreateInvoicePayload {
  customerId: string;
  invoiceNumber: string;
  dueDate: string | Date;
  items: IInvoiceItem[];
  issueDate?: string | Date;
  taxRate?: number;
  discount?: number;
  paidAmount?: number;
  currency?: string;
  notes?: string;
  status?: InvoiceStatus; // <-- Lagu daray
}

export interface UpdateInvoicePayload {
  customerId?: string;
  invoiceNumber?: string;
  issueDate?: string | Date;
  dueDate?: string | Date;
  items?: IInvoiceItem[];
  taxRate?: number;
  discount?: number;
  paidAmount?: number;
  currency?: string;
  notes?: string;
  status?: InvoiceStatus; // <-- Lagu daray
}

export interface InvoiceQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: InvoiceStatus;
  customerId?: string;
}

export interface Invoice {
  _id: string;
  businessId: string;
  customerId: string | { _id?: string; name?: string; email?: string };
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  items: IInvoiceItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discount: number;
  total: number;
  paidAmount: number;
  balanceDue: number;
  currency: string;
  status: InvoiceStatus;
  notes?: string;
  sentAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export const invoiceService = {
  createInvoice: async (payload: CreateInvoicePayload) => {
    const response = await api.post<ApiResponse<{ invoice: Invoice }>>(
      "/invoices",
      payload
    );
    return response.data;
  },

  getInvoices: async (params?: InvoiceQueryParams) => {
    const response = await api.get<
      ApiResponse<{ invoices: Invoice[]; pagination: PaginationMeta }>
    >("/invoices", { params });
    return response.data;
  },

  getInvoiceById: async (id: string) => {
    const response = await api.get<ApiResponse<{ invoice: Invoice }>>(
      `/invoices/${id}`
    );
    return response.data;
  },

  updateInvoice: async (id: string, payload: UpdateInvoicePayload) => {
    const response = await api.put<ApiResponse<{ invoice: Invoice }>>(
      `/invoices/${id}`,
      payload
    );
    return response.data;
  },

  deleteInvoice: async (id: string) => {
    const response = await api.delete<ApiResponse<{ invoice: Invoice }>>(
      `/invoices/${id}`
    );
    return response.data;
  },

  updateInvoiceStatus: async (id: string, status: InvoiceStatus) => {
    const response = await api.patch<ApiResponse<{ invoice: Invoice }>>(
      `/invoices/${id}/status`,
      { status }
    );
    return response.data;
  },

  sendInvoice: async (id: string) => {
    const response = await api.patch<ApiResponse<{ invoice: Invoice }>>(
      `/invoices/${id}/send`
    );
    return response.data;
  },
};

export default invoiceService;