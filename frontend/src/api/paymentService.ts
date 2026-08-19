import api from "../service/api"; // Soojiid Axios instance-kaaga

// Types/Interfaces
export interface RecordPaymentPayload {
  invoiceId: string;
  amount: number;
  paymentDate?: string | Date;
  paymentMethod?: "cash" | "card" | "bank_transfer" | "mobile_money" | string;
  referenceNumber?: string;
  notes?: string;
}

export interface PaymentFilterParams {
  page?: number;
  limit?: number;
  invoiceId?: string;
  customerId?: string;
  paymentMethod?: string;
}

export const paymentService = {
  /**
   * 1. Subag lacag bixin cusub (POST /api/payments)
   */
  recordPayment: async (data: RecordPaymentPayload) => {
    const response = await api.post("/payments", data);
    return response.data;
  },

  /**
   * 2. Soo saar dhammaan lacag bixinnada (GET /api/payments)
   */
  getPayments: async (params?: PaymentFilterParams) => {
    const response = await api.get("/payments", { params });
    return response.data;
  },

  /**
   * 3. Burin/Kansal lacag bixin (PATCH /api/payments/:id/void)
   */
  voidPayment: async (id: string) => {
    const response = await api.patch(`/payments/${id}/void`);
    return response.data;
  },
};

export default paymentService;