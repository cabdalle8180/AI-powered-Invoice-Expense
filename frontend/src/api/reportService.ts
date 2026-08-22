import api from "../service/api";

export interface ReportCard {
  id: string;
  title: string;
  subtitle: string;
  amount: string;
  change: string;
  changeDir: "up" | "down";
  changeColor: string;
  chartColor: string;
  chartType: "bar" | "line" | "progress" | "donut";
  extra?: string;
}

export interface RecentReport {
  name: string;
  range: string;
  generatedBy: string;
}

export interface ReportsSummaryResponse {
  success: boolean;
  data: {
    period: string;
    cards: ReportCard[];
    recentReports: RecentReport[];
    metrics: {
      totalRevenue: number;
      totalExpenses: number;
      netProfit: number;
      profitMargin: number;
      totalOutstanding: number;
      totalOverdue: number;
      overduePercentage: number;
      overdueInvoiceCount?: number;
      outstandingInvoiceCount?: number;
    };
  };
}

export interface ReportPagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface InvoiceReportItem {
  _id: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  subtotal: number;
  taxAmount: number;
  total: number;
  paidAmount: number;
  balanceDue: number;
  currency: string;
  status: string;
  notes?: string;
  customerId?: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  businessId?: {
    _id: string;
    name: string;
  };
}

export interface InvoiceReportResponse {
  success: boolean;
  data: InvoiceReportItem[];
  summary: {
    totalInvoiced: number;
    totalPaid: number;
    totalBalanceDue: number;
    invoiceCount: number;
  };
  pagination: ReportPagination;
}

export interface ExpenseReportItem {
  _id: string;
  title: string;
  category: string;
  amount: number;
  expenseDate: string;
  paymentMethod: string;
  vendor?: string;
  referenceNumber?: string;
  notes?: string;
  createdById?: {
    _id: string;
    name: string;
    email: string;
  };
  businessId?: {
    _id: string;
    name: string;
  };
}

export interface ExpenseReportResponse {
  success: boolean;
  data: ExpenseReportItem[];
  summary: {
    totalExpenses: number;
    expenseCount: number;
    categoryBreakdown: Record<string, number>;
    paymentMethodBreakdown: Record<string, number>;
  };
  pagination: ReportPagination;
}

export interface PaymentReportItem {
  _id: string;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  referenceNumber?: string;
  notes?: string;
  isVoided: boolean;
  customerId?: {
    _id: string;
    name: string;
    email: string;
  };
  invoiceId?: {
    _id: string;
    invoiceNumber: string;
    total: number;
  };
  businessId?: {
    _id: string;
    name: string;
  };
}

export interface PaymentReportResponse {
  success: boolean;
  data: PaymentReportItem[];
  summary: {
    totalPayments: number;
    paymentCount: number;
    paymentMethodBreakdown: Record<string, number>;
  };
  pagination: ReportPagination;
}

export interface CustomerReportItem {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  totalInvoiced: number;
  totalPaid: number;
  outstandingBalance: number;
  isActive: boolean;
  createdAt: string;
  businessId?: {
    _id: string;
    name: string;
  };
}

export interface CustomerReportResponse {
  success: boolean;
  data: CustomerReportItem[];
  summary: {
    totalCustomers: number;
    activeCustomers: number;
    totalInvoiced: number;
    totalPaid: number;
    totalOutstanding: number;
  };
  pagination: ReportPagination;
}

export interface RevenueReportResponse {
  success: boolean;
  data: InvoiceReportItem[];
  summary: {
    period: string;
    totalGrossRevenue: number;
    totalCollected: number;
    totalUncollected: number;
    collectionRate: number;
    statusBreakdown: Record<string, number>;
    invoiceCount: number;
  };
  pagination: ReportPagination;
}

export interface OutstandingReportResponse {
  success: boolean;
  data: InvoiceReportItem[];
  summary: {
    totalOutstanding: number;
    totalOverdue: number;
    overdueCount: number;
    pendingCount: number;
    aging: {
      current: number;
      days1_30: number;
      days31_60: number;
      days61_90: number;
      days90Plus: number;
    };
  };
  pagination: ReportPagination;
}

export interface ReportQueryParams {
  period?: string;
  startDate?: string;
  endDate?: string;
  dateFrom?: string;
  dateTo?: string;
  status?: string;
  category?: string;
  paymentMethod?: string;
  customerId?: string;
  businessId?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  isVoided?: string;
  isActive?: string;
}

/**
 * GET /api/reports/summary
 */
export const getReportsSummary = async (
  period: string = "This Month",
  params?: Record<string, unknown>
): Promise<ReportsSummaryResponse["data"]> => {
  const response = await api.get<ReportsSummaryResponse>("/reports/summary", {
    params: { period, ...params },
  });
  return response.data.data;
};

/**
 * GET /api/reports/invoices
 */
export const getInvoiceReport = async (
  params?: ReportQueryParams
): Promise<InvoiceReportResponse> => {
  const response = await api.get<InvoiceReportResponse>("/reports/invoices", {
    params,
  });
  return response.data;
};

/**
 * GET /api/reports/expenses
 */
export const getExpenseReport = async (
  params?: ReportQueryParams
): Promise<ExpenseReportResponse> => {
  const response = await api.get<ExpenseReportResponse>("/reports/expenses", {
    params,
  });
  return response.data;
};

/**
 * GET /api/reports/payments
 */
export const getPaymentReport = async (
  params?: ReportQueryParams
): Promise<PaymentReportResponse> => {
  const response = await api.get<PaymentReportResponse>("/reports/payments", {
    params,
  });
  return response.data;
};

/**
 * GET /api/reports/customers
 */
export const getCustomerReport = async (
  params?: ReportQueryParams
): Promise<CustomerReportResponse> => {
  const response = await api.get<CustomerReportResponse>("/reports/customers", {
    params,
  });
  return response.data;
};

/**
 * GET /api/reports/revenue
 */
export const getRevenueReport = async (
  params?: ReportQueryParams
): Promise<RevenueReportResponse> => {
  const response = await api.get<RevenueReportResponse>("/reports/revenue", {
    params,
  });
  return response.data;
};

/**
 * GET /api/reports/outstanding
 */
export const getOutstandingReport = async (
  params?: ReportQueryParams
): Promise<OutstandingReportResponse> => {
  const response = await api.get<OutstandingReportResponse>("/reports/outstanding", {
    params,
  });
  return response.data;
};

export default {
  getReportsSummary,
  getInvoiceReport,
  getExpenseReport,
  getPaymentReport,
  getCustomerReport,
  getRevenueReport,
  getOutstandingReport,
};
