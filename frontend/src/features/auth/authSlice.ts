import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { AuthState, AuthResponse, MeResponse, User } from "../../types/auth";
import { normalizeRole } from "../../constants/permissions";
import api from "../../service/api";

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

const storedUser = localStorage.getItem("user");

const parseStoredUser = (): User | null => {
  if (!storedUser) return null;
  try {
    const parsed = JSON.parse(storedUser) as User;
    return { ...parsed, role: normalizeRole(parsed.role) };
  } catch {
    return null;
  }
};

const initialState: AuthState = {
  user: parseStoredUser(),
  token: localStorage.getItem("token") || null,
  isAuthenticated: !!localStorage.getItem("token"),
  isLoading: false,
  isSessionChecking: !!localStorage.getItem("token"),
  error: null,
};

const persistAuth = (user: User, token: string) => {
  const normalizedUser = { ...user, role: normalizeRole(user.role) };
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(normalizedUser));
  return normalizedUser;
};

export const loginUser = createAsyncThunk(
  "auth/login",
  async (credentials: Record<string, string>, { rejectWithValue }) => {
    try {
      const response = await api.post<AuthResponse>("/auth/login", credentials);
      return response.data.data;
    } catch (error: unknown) {
      const apiError = error as ApiError;
      return rejectWithValue(
        apiError.response?.data?.message || "An unexpected error occurred during login"
      );
    }
  }
);

export const registerUser = createAsyncThunk(
  "auth/register",
  async (userData: Record<string, string>, { rejectWithValue }) => {
    try {
      const response = await api.post<AuthResponse>("/auth/register", userData);
      return response.data.data;
    } catch (error: unknown) {
      const apiError = error as ApiError;
      return rejectWithValue(
        apiError.response?.data?.message || "An unexpected error occurred during registration"
      );
    }
  }
);

export const verifySession = createAsyncThunk(
  "auth/verifySession",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get<MeResponse>("/users/me");
      return response.data.data.user;
    } catch (error: unknown) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      const apiError = error as ApiError;
      return rejectWithValue(
        apiError.response?.data?.message || "Session expired. Please login again."
      );
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      state.isSessionChecking = false;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.isSessionChecking = false;
        state.user = persistAuth(action.payload.user, action.payload.token);
        state.token = action.payload.token;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.isSessionChecking = false;
        state.user = persistAuth(action.payload.user, action.payload.token);
        state.token = action.payload.token;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(verifySession.pending, (state) => {
        state.isSessionChecking = true;
      })
      .addCase(verifySession.fulfilled, (state, action) => {
        state.isSessionChecking = false;
        state.isAuthenticated = true;
        state.user = { ...action.payload, role: normalizeRole(action.payload.role) };
        localStorage.setItem("user", JSON.stringify(state.user));
      })
      .addCase(verifySession.rejected, (state) => {
        state.isSessionChecking = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
