
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";

import {
  useAppDispatch,
  useAppSelector,
} from "../hooks/reduxHooks";

import {
  loginUser,
  clearError,
} from "../features/auth/authSlice";

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { isLoading, error, token } = useAppSelector(
    (state) => state.auth
  );

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // ==========================================
  // LOGIN SUCCESS
  // ==========================================

  useEffect(() => {
    if (token) {
      toast.success("Login successful! Welcome back.");

      navigate("/overview", {
        replace: true,
      });
    }
  }, [token, navigate]);

  // ==========================================
  // LOGIN ERROR
  // ==========================================

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // ==========================================
  // SUBMIT
  // ==========================================

  const handleSubmit = (
    e
  ) => {
    e.preventDefault();

    // Clear previous error
    dispatch(clearError());

    // Basic validation
    if (!email.trim()) {
      toast.error("Please enter your email.");
      return;
    }

    if (!password.trim()) {
      toast.error("Please enter your password.");
      return;
    }

    // Login
    dispatch(
      loginUser({
        email: email.trim(),
        password,
      })
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">

      <div className="sm:mx-auto sm:w-full sm:max-w-[480px]">

        <div className="bg-white py-12 px-6 sm:rounded-2xl sm:px-12 border border-gray-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)]">

          {/* =====================================
              LOGO
          ====================================== */}

          <div className="flex justify-center items-center gap-2 mb-10">

            <div className="flex items-center justify-center w-8 h-8 rounded bg-sky-100 text-[#0ea5e9]">

              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
                />
              </svg>

            </div>

            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              AI Invoice{" "}
              <span className="font-semibold text-gray-700">
                and Expense
              </span>
            </h1>

          </div>

          {/* =====================================
              WELCOME
          ====================================== */}

          <div className="text-center mb-8">

            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
              Welcome back
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Please enter your details to sign in.
            </p>

          </div>

          {/* =====================================
              FORM
          ====================================== */}

          <form
            className="space-y-5"
            onSubmit={handleSubmit}
          >

            {/* EMAIL */}

            <div>

              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-900"
              >
                Email
              </label>

              <div className="mt-1">

                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="name@company.com"
                  required
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  className="appearance-none block w-full px-3 py-2.5 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                />

              </div>

            </div>

            {/* PASSWORD */}

            <div>

              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-900"
              >
                Password
              </label>

              <div className="mt-1">

                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  className="appearance-none block w-full px-3 py-2.5 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                />

              </div>

            </div>

            {/* REMEMBER + FORGOT */}

            <div className="flex items-center justify-between pt-1">

              <div className="flex items-center">

                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-[#0ea5e9] focus:ring-[#0ea5e9] border-gray-300 rounded"
                />

                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-gray-700"
                >
                  Remember me
                </label>

              </div>

              <div className="text-sm">

                <Link
                  to="/forgot-password"
                  className="font-medium text-[#0ea5e9] hover:text-[#0284c7] transition-colors"
                >
                  Forgot password?
                </Link>

              </div>

            </div>

            {/* LOGIN BUTTON */}

            <div className="pt-2">

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-[#0ea5e9] hover:bg-[#0284c7] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >

                {isLoading
                  ? "Logging in..."
                  : "Login"}

                {!isLoading && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-4 h-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                    />
                  </svg>
                )}

              </button>

            </div>

          </form>

          {/* =====================================
              REGISTER
          ====================================== */}

          <div className="mt-8 text-center">

            <p className="text-sm text-gray-600">

              Don't have an account?{" "}

              <Link
                to="/register"
                className="font-medium text-[#0ea5e9] hover:text-[#0284c7] transition-colors"
              >
                Sign up
              </Link>

            </p>

          </div>

        </div>

      </div>

    </div>
  );
}