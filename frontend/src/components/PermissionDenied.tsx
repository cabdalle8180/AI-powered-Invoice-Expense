import React from "react";
import { ShieldAlert, ArrowLeft, Home } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { usePermission } from "../hooks/usePermission";
import { getDashboardPath } from "../constants/permissions";

interface PermissionDeniedProps {
  requiredRole?: string;
  message?: string;
}

export const PermissionDenied: React.FC<PermissionDeniedProps> = ({
  requiredRole,
  message = "Xaq uma lihid inaad gasho ama akhriso boggan.",
}) => {
  const navigate = useNavigate();
  const { role } = usePermission();

  const formattedRole = role.charAt(0).toUpperCase() + role.slice(1);

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6 bg-gray-50/50">
      <div className="max-w-md w-full bg-white rounded-2xl border border-gray-100 shadow-xl p-8 text-center">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-inner">
          <ShieldAlert size={32} />
        </div>

        <span className="inline-block text-xs font-bold uppercase tracking-widest text-red-600 bg-red-50 px-3 py-1 rounded-full border border-red-100 mb-3">
          403 — Permission Denied
        </span>

        <h2 className="text-xl font-bold text-gray-900 mb-2">Access Restricted</h2>

        <p className="text-sm text-gray-500 mb-6 leading-relaxed">
          {message}
        </p>

        <div className="bg-gray-50 rounded-xl p-3.5 mb-6 text-left border border-gray-100 text-xs text-gray-600 space-y-1">
          <div className="flex justify-between">
            <span className="text-gray-400">Your Current Role:</span>
            <span className="font-semibold text-gray-800">{formattedRole}</span>
          </div>
          {requiredRole && (
            <div className="flex justify-between">
              <span className="text-gray-400">Required Role:</span>
              <span className="font-semibold text-red-600">{requiredRole}</span>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="flex-1 flex items-center justify-center gap-2 border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-medium px-4 py-2.5 rounded-xl transition"
          >
            <ArrowLeft size={16} /> Go Back
          </button>
          <Link
            to={getDashboardPath(role)}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition shadow-sm shadow-blue-200"
          >
            <Home size={16} /> Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PermissionDenied;
