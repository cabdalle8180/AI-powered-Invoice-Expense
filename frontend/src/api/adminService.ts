import api from "../service/api";

export interface MonthlyTrend {
  month: string;
  year: number;
  revenue: number;
  expenses: number;
}

export interface ActivityItem {
  type: "invoice" | "expense" | "payment" | string;
  description: string;
  amount?: string;
  time: string;
  status?: string;
}

export interface AdminStatsResponse {
  success: boolean;
  data: {
    overview: {
      totalBusinesses: number;
      activeBusinesses: number;
      inactiveBusinesses: number;
      totalUsers: number;
      activeUsers: number;
      totalCustomers: number;
      activeCustomers: number;
      totalInvoices: number;
      totalExpenses: number;
      totalPayments: number;
      totalRevenue?: number;
      totalOutstanding?: number;
    };
    financial: {
      thisMonth: {
        revenue: number;
        expenses: number;
        payments: number;
        netProfit: number;
      };
      growth: {
        revenue: number;
        expenses: number;
        payments: number;
      };
      outstanding: {
        total: number;
        overdue: number;
        overdueCount: number;
        pendingCount: number;
      };
      monthlyTrends: MonthlyTrend[];
    };
    invoiceStats: {
      draft: number;
      sent: number;
      paid: number;
      overdue: number;
      cancelled: number;
      total: number;
    };
    recentActivities: ActivityItem[];
  };
}

export const getAdminStats = async (): Promise<AdminStatsResponse["data"]> => {
  const response = await api.get<AdminStatsResponse>("/admin/stats");
  return response.data.data;
};

export default {
  getAdminStats,
};
