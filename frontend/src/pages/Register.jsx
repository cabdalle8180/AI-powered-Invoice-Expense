import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";

import {
  useAppDispatch,
  useAppSelector,
} from "../hooks/reduxHooks";

import {
  registerUser,
  clearError,
} from "../features/auth/authSlice";

export default function RegisterPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const {
    isLoading,
    error,
    token,
  } = useAppSelector((state) => state.auth);

  // ==========================================
  // FORM STATE
  // ==========================================

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // ==========================================
  // REGISTER SUCCESS
  // ==========================================

  useEffect(() => {
    if (token) {
      toast.success("Account created successfully! 🎉");

      navigate("/overview", {
        replace: true,
      });
    }
  }, [token, navigate]);

  // ==========================================
  // REGISTER ERROR
  // ==========================================

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // ==========================================
  // SUBMIT
  // ==========================================

  const handleSubmit = (e) => {
    e.preventDefault();

    // Clear previous error
    dispatch(clearError());

    // Basic validation
    if (!name.trim()) {
      toast.error("Please enter your full name.");
      return;
    }

    if (!email.trim()) {
      toast.error("Please enter your email.");
      return;
    }

    if (!password.trim()) {
      toast.error("Please enter your password.");
      return;
    }

    if (password.length < 6) {
      toast.error(
        "Password must be at least 6 characters."
      );
      return;
    }

    // Register user
    dispatch(
      registerUser({
        name: name.trim(),
        email: email.trim(),
        password,
      })
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">

      {/* ==========================================
          TITLE
      =========================================== */}

      <div className="sm:mx-auto sm:w-full sm:max-w-md mb-8">
        <h1 className="text-center text-3xl font-bold text-[#005b82]">
          AI Invoice{" "}
          <span className="font-semibold text-[#006b96]">
            and Expense
          </span>
        </h1>
      </div>

      {/* ==========================================
          CARD
      =========================================== */}

      <div className="sm:mx-auto sm:w-full sm:max-w-[480px]">

        <div className="bg-white py-10 px-6 sm:rounded-2xl sm:px-12 border border-gray-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)]">

          {/* ========================================
              HEADER
          ======================================== */}

          <div className="text-center mb-8">

            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
              Create an account
            </h2>

            <p className="mt-2 text-[15px] text-gray-600">
              Start tracking your business intelligence today.
            </p>

          </div>

          {/* ========================================
              FORM
          ======================================== */}

          <form
            className="space-y-5"
            onSubmit={handleSubmit}
          >

            {/* FULL NAME */}

            <div>

              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-900"
              >
                Full Name
              </label>

              <div className="mt-1">

                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  placeholder="Jane Doe"
                  required
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                  className="appearance-none block w-full px-3 py-2.5 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                />

              </div>

            </div>

            {/* EMAIL */}

            <div>

              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-900"
              >
                Email Address
              </label>

              <div className="mt-1">

                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="jane@example.com"
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

              <div className="mt-1 relative">

                <input
                  id="password"
                  name="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  autoComplete="new-password"
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  className="appearance-none block w-full px-3 py-2.5 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm pr-10"
                />

                {/* SHOW / HIDE PASSWORD */}

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      (prev) => !prev
                    )
                  }
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500 focus:outline-none"
                >

                  {showPassword ? (

                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                      />
                    </svg>

                  ) : (

                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                      />

                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>

                  )}

                </button>

              </div>

            </div>

            {/* TERMS */}

            <div className="flex items-start pt-2">

              <div className="flex items-center h-5">

                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  required
                  className="h-4 w-4 text-sky-500 focus:ring-sky-500 border-gray-300 rounded"
                />

              </div>

              <div className="ml-3 text-sm">

                <label
                  htmlFor="terms"
                  className="font-medium text-gray-700"
                >
                  By signing up, you agree to the{" "}

                  <a
                    href="#"
                    className="text-[#005b82] hover:underline"
                  >
                    Terms of Service
                  </a>{" "}

                  and{" "}

                  <a
                    href="#"
                    className="text-[#005b82] hover:underline"
                  >
                    Privacy Policy
                  </a>
                  .
                </label>

              </div>

            </div>

            {/* SUBMIT */}

            <div className="pt-2">

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-[#0ea5e9] hover:bg-[#0284c7] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >

                {isLoading
                  ? "Creating Account..."
                  : "Create Account"}

              </button>

            </div>

          </form>

          {/* ========================================
              LOGIN LINK
          ======================================== */}

          <div className="mt-8 text-center">

            <p className="text-sm text-gray-600">

              Already have an account?{" "}

              <Link
                to="/login"
                className="font-medium text-[#005b82] hover:underline"
              >
                Login
              </Link>

            </p>

          </div>

        </div>

      </div>

    </div>
  );
}