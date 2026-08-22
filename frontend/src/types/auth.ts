export type UserRole =
  | "superAdmin"
  | "owner"
  | "accountant"
  | "staff"
  | "customer";

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  businessId?: string;
  customerId?: string;
  avatar?: {
    url: string;
    public_id?: string;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isSessionChecking: boolean;
  error: string | null;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

export interface MeResponse {
  success: boolean;
  data: {
    user: User;
  };
}
