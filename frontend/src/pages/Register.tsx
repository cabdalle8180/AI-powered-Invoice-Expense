import { Link } from "react-router-dom";

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-[480px]">
        <div className="bg-white py-12 px-6 sm:rounded-2xl sm:px-12 border border-gray-100 shadow-sm text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Registration Unavailable</h1>
          <p className="text-sm text-gray-500 mb-8 leading-relaxed">
            Customer accounts are created by your business owner. If you need access,
            please contact your business administrator.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center justify-center px-4 py-2.5 bg-sky-500 hover:bg-sky-600 text-white text-sm font-semibold rounded-lg transition"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
