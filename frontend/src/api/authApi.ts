import api from '../service/api';
import type { AuthResponse } from '../types/auth';

export interface LoginData {
  email: string;
  password: string;
  [key: string]: string; // Allows indexing flexibility if needed
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  [key: string]: string;
}

export const loginUser = async (data: LoginData): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/login', data);
  return response.data;
};

export const signupUser = async (data: RegisterData): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/register', data);
  return response.data;
};