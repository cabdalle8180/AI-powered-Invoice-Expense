// --- expense.types.ts ---

// 1. Noocyada Kharashka (Categories) & Bixinta (Payment Methods)
export type ExpenseCategory = 
  | "rent" 
  | "utilities" 
  | "payroll" 
  | "office_supplies" 
  | "marketing" 
  | "other"; // Ku bedelo categories-ka aad backend-ka ku isticmaasho

export type PaymentMethod = "cash" | "bank_transfer" | "credit_card" | "mobile_money";

// 2. Xogta Qofka Kharashka Galiyay (Laga soo populate gareeyay backend-ka)
export interface ExpenseCreator {
  _id: string;
  name: string;
  email: string;
}

// 3. Qaab-dhismeedka Hal Kharash (Expense Object)
export interface IExpense {
  _id: string;
  businessId: string;
  title: string;
  category: ExpenseCategory;
  amount: number;
  expenseDate: string; // Qaab Date string ah (ISO)
  paymentMethod: PaymentMethod;
  vendor?: string;
  referenceNumber?: string;
  notes?: string;
  createdById: ExpenseCreator | string; // Haddii la populate-gareeyo waa object, haddii kale waa string ID
  createdAt: string;
  updatedAt: string;
}

// 4. Qaab-dhismeedka Pagination-ka
export interface IPagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

// 5. Noocyada Xogta API-ga ay soo celinayaan (API Responses)
export interface GetExpensesResponse {
  success: boolean;
  data: {
    expenses: IExpense[];
    pagination: IPagination;
  };
}

export interface SingleExpenseResponse {
  success: boolean;
  message?: string;
  data: {
    expense: IExpense;
  };
}

export interface DeleteResponse {
  success: boolean;
  message: string;
}

// 6. Noocyada Xogta ee la dirayo (API Requests / Payloads)
export interface CreateExpenseInput {
  title: string;
  amount: number;
  category?: ExpenseCategory;
  expenseDate?: string | Date;
  paymentMethod?: PaymentMethod;
  vendor?: string;
  referenceNumber?: string;
  notes?: string;
}

// Update-ka wuxuu qaadanayaa wixii ku jira CreateExpenseInput balse waa Optional (Partial)
export type UpdateExpenseInput = Partial<CreateExpenseInput>;