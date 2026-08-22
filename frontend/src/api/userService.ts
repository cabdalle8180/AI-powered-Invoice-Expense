import api from "../service/api";
import type { User } from "../types/auth";

export interface UserResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
  };
}

export interface BusinessLogoResponse {
  success: boolean;
  message: string;
  data: {
    business: {
      _id: string;
      name: string;
      logo?: {
        url: string;
        public_id?: string;
      };
      [key: string]: unknown;
    };
  };
}

/**
 * Uploads user avatar image via Cloudinary.
 */
export const uploadAvatar = async (file: File): Promise<User> => {
  const formData = new FormData();
  formData.append("avatar", file);

  const response = await api.post<UserResponse>("/users/me/avatar", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data.data.user;
};

/**
 * Removes user avatar image.
 */
export const deleteAvatar = async (): Promise<User> => {
  const response = await api.delete<UserResponse>("/users/me/avatar");
  return response.data.data.user;
};

/**
 * Uploads business logo image via Cloudinary.
 */
export const uploadBusinessLogo = async (
  businessId: string,
  file: File
): Promise<BusinessLogoResponse["data"]["business"]> => {
  const formData = new FormData();
  formData.append("logo", file);

  const response = await api.post<BusinessLogoResponse>(
    `/businesses/${businessId}/logo`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data.data.business;
};

/**
 * Updates current authenticated user profile.
 */
export const updateMe = async (data: {
  name?: string;
  phone?: string;
}): Promise<User> => {
  const response = await api.put<UserResponse>("/users/me", data);
  return response.data.data.user;
};

/**
 * Updates current user password.
 */
export const updatePassword = async (data: {
  currentPassword: string;
  newPassword: string;
}): Promise<{ success: boolean; message: string }> => {
  const response = await api.put<{ success: boolean; message: string }>(
    "/users/me/password",
    data
  );
  return response.data;
};

export default {
  uploadAvatar,
  deleteAvatar,
  uploadBusinessLogo,
  updateMe,
  updatePassword,
};
