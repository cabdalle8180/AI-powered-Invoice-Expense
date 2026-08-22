import api from "../service/api";

export interface OwnerRecord {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  businessId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  business: {
    id: string;
    name: string;
    isActive: boolean;
  } | null;
}

export interface OwnersResponse {
  success: boolean;
  data: {
    owners: OwnerRecord[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  };
}

export interface CreateOwnerData {
  businessName: string;
  ownerName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
}

export interface UpdateOwnerData {
  ownerName?: string;
  businessName?: string;
  email?: string;
  password?: string;
  phone?: string;
}

export const getOwners = async (page = 1, limit = 10, search = "") => {
  const response = await api.get<OwnersResponse>("/users/owners", {
    params: { page, limit, search: search || undefined },
  });
  return response.data;
};

export const getOwnerById = async (id: string) => {
  const response = await api.get(`/users/owners/${id}`);
  return response.data;
};

export const createOwner = async (data: CreateOwnerData) => {
  const response = await api.post("/users/owners", data);
  return response.data;
};

export const updateOwner = async (id: string, data: UpdateOwnerData) => {
  const response = await api.put(`/users/owners/${id}`, data);
  return response.data;
};

export const toggleOwnerStatus = async (id: string, isActive: boolean) => {
  const response = await api.patch(`/users/owners/${id}/status`, { isActive });
  return response.data;
};

export const deleteOwner = async (id: string) => {
  const response = await api.delete(`/users/owners/${id}`);
  return response.data;
};

export default {
  getOwners,
  getOwnerById,
  createOwner,
  updateOwner,
  toggleOwnerStatus,
  deleteOwner,
};
