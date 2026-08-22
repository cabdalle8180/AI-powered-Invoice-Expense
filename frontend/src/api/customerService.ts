import api from '../service/api'; 
export interface Customer { 
  _id: string; 
  name: string; 
  email: string; 
  phone?: string; 
  address?: string;
  position?: string;
  taxNumber?: string;
  isActive: boolean; 
  totalInvoiced: number; 
  totalPaid: number; 
  outstandingBalance: number; 
} 

export interface CustomerMeResponse {
  success: boolean;
  data: { customer: Customer };
}
 
export interface CustomersResponse { 
  success: boolean; 
  data: { 
    customers: Customer[]; 
    pagination: { 
      total: number; 
      page: number; 
      limit: number; 
      pages: number; 
    }; 
  }; 
} 
 
export interface CreateCustomerData { 
  name: string; 
  email: string; 
  password?: string;
  confirmPassword?: string;
  phone?: string; 
  address?: string; 
  position?: string;
  taxNumber?: string; 
} 

export type UpdateCustomerData = Partial<CreateCustomerData>; 
 
// GET ALL CUSTOMERS 
export const getCustomers = async ( 
  page = 1, 
  limit = 10, 
  search = '', 
  isActive?: boolean 
): Promise<CustomersResponse> => { 
  const params: Record<string, unknown> = { page, limit, search }; 
  if (isActive !== undefined) params.isActive = isActive; 
 
  const response = await api.get<CustomersResponse>('/customers', { params }); 
  return response.data; 
}; 
 
export const getCustomerMe = async (): Promise<CustomerMeResponse> => {
  const response = await api.get<CustomerMeResponse>('/customers/me');
  return response.data;
};

export const updateCustomerMe = async (data: Partial<CreateCustomerData>) => {
  const response = await api.put('/customers/me', data);
  return response.data;
};

// CREATE CUSTOMER 
export const createCustomer = async (data: CreateCustomerData) => { 
  const response = await api.post('/customers', data); 
  return response.data; 
}; 
 
// UPDATE CUSTOMER 
export const updateCustomer = async (id: string, data: Partial<CreateCustomerData>) => { 
  const response = await api.put(`/customers/${id}`, data); 
  return response.data; 
}; 
 
// DELETE CUSTOMER (Deactivate) 
export const deleteCustomer = async (id: string) => { 
  const response = await api.delete(`/customers/${id}`); 
  return response.data; 
}; 
 
// TOGGLE CUSTOMER STATUS
export const toggleCustomerStatus = async (id: string, isActive: boolean) => {
  const response = await api.patch(`/customers/${id}/status`, { isActive });
  return response.data;
};

// RESTORE CUSTOMER 
export const restoreCustomer = async (id: string) => { 
  const response = await api.patch(`/customers/${id}/restore`); 
  return response.data; 
}; 