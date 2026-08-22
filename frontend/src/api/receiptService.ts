import api from "../service/api";

export interface ReceiptItem {
  id: string;
  date: string;
  merchant: string;
  category: string;
  amount: number;
  status: "Reviewed" | "Pending";
  notes?: string;
  createdByName?: string;
}

export interface ReceiptsResponse {
  success: boolean;
  data: {
    receipts: ReceiptItem[];
    stats: {
      totalScanned: number;
      pendingReview: number;
      totalAmountYTD: number;
    };
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
      pages: number;
    };
  };
}

export interface GetReceiptsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export const getReceipts = async (
  params: GetReceiptsParams = {}
): Promise<ReceiptsResponse["data"]> => {
  const response = await api.get<ReceiptsResponse>("/receipts", { params });
  return response.data.data;
};

export const getReceiptById = async (id: string) => {
  const response = await api.get(`/receipts/${id}`);
  return response.data.data.receipt as ReceiptItem;
};

export const createReceipt = async (data: {
  merchant: string;
  amount: number;
  category?: string;
  date?: string;
  notes?: string;
}) => {
  const response = await api.post("/receipts", data);
  return response.data;
};

export const updateReceipt = async (
  id: string,
  data: Partial<{
    merchant: string;
    amount: number;
    category: string;
    date: string;
    notes: string;
  }>
) => {
  const response = await api.put(`/receipts/${id}`, data);
  return response.data;
};

export const deleteReceipt = async (id: string) => {
  const response = await api.delete(`/receipts/${id}`);
  return response.data;
};

export default {
  getReceipts,
  getReceiptById,
  createReceipt,
  updateReceipt,
  deleteReceipt,
};
