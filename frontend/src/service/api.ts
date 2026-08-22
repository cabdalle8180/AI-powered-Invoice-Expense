import axios from "axios";
import toast from "react-hot-toast";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

let isRedirectingToLogin = false;

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const message = error?.response?.data?.message;

    if (status === 403) {
      toast.error(message || "Xaq uma lihid inaad fuliso ama akhrido xogtan");
    } else if (status === 401 && !window.location.pathname.includes("/login")) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      if (!isRedirectingToLogin) {
        isRedirectingToLogin = true;
        toast.error(message || "Session expired. Please login again.");
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;
