import api from "../service/api"; // Faylkii axios aad ku samaysay
import type { 
  ExpenseCategory, 
  CreateExpenseInput, 
  UpdateExpenseInput 
} from "../types/expense.types";
// 1. Soo hel kharashaadka (Get all expenses with filters)
export const getExpenses = async (page = 1, limit = 10, search = "", startDate = "", endDate = "") => {
  const response = await api.get(`/expenses`, {
    params: { page, limit, search, startDate, endDate }
  });
  return response.data;
};

// 2. Soo hel hal kharash (Get single expense)
export const getExpenseById = async (id: string) => {
  const response = await api.get(`/expenses/${id}`);
  return response.data;
};

// 3. Samee kharash cusub (Create expense)
export const createExpense = async (expenseData: {
  title: string;
  amount: number;
  category?: ExpenseCategory;
  expenseDate?: string;
  paymentMethod?: string;
  vendor?: string;
  notes?: string;
}) => {
  const response = await api.post(`/expenses`, expenseData);
  return response.data;
};

// 4. Update garee kharash (Update expense)
export const updateExpense = async (id: string, updateData: any) => {
  const response = await api.put(`/expenses/${id}`, updateData);
  return response.data;
};

// 5. Tirtir kharash (Delete expense)
export const deleteExpense = async (id: string) => {
  const response = await api.delete(`/expenses/${id}`);
  return response.data;
};