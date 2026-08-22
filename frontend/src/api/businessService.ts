import api from "../service/api";

export interface BusinessRecord {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  currency: string;
  isActive: boolean;
  ownerId: string;
  createdAt: string;
}

export const getBusinesses = async (page = 1, limit = 10, search = "") => {
  const response = await api.get("/businesses", {
    params: { page, limit, search: search || undefined },
  });
  return response.data;
};

export default { getBusinesses };
