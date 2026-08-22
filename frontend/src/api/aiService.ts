import api from "../service/api";

export interface ScannedReceipt {
  merchant: string;
  date: string;
  amount: number;
  category: string;
  items?: { description: string; amount: number }[];
  notes?: string;
}

export interface InsightCard {
  id: string;
  type: "alert-warning" | "alert-overdue" | "category" | "cashflow" | "processing";
  title: string;
  subtitle?: string;
  body: string;
  actionLabel?: string;
  badge?: string;
}

export interface AiInsightsResponse {
  success: boolean;
  data: {
    role: string;
    isExecutive: boolean;
    insights: InsightCard[];
    generatedAt: string;
  };
}

/**
 * GET /api/ai/insights
 * Fetches dynamic AI financial and operational insights
 */
export const getAiInsights = async (): Promise<AiInsightsResponse["data"]> => {
  const response = await api.get<AiInsightsResponse>("/ai/insights");
  return response.data.data;
};

/**
 * POST /api/ai/scan-receipt
 * Sends a receipt image/PDF to the AI for extraction.
 * @param file - The receipt file (JPG, PNG, WEBP, or PDF, max 10MB)
 */
export const scanReceipt = async (file: File): Promise<ScannedReceipt> => {
  const formData = new FormData();
  formData.append("receiptFile", file);

  const response = await api.post("/ai/scan-receipt", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return response.data.data?.extracted || response.data;
};

export default {
  getAiInsights,
  scanReceipt,
};
