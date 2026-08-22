import React from "react";
import { Navigate } from "react-router-dom";
import { useAppSelector } from "../hooks/reduxHooks";
import { getDashboardPath, normalizeRole } from "../constants/permissions";

const RoleHomeRedirect: React.FC = () => {
  const { isAuthenticated, user, isSessionChecking } = useAppSelector((state) => state.auth);

  if (isSessionChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-sm text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/" replace />;
  }

  return <Navigate to={getDashboardPath(normalizeRole(user.role))} replace />;
};

export default RoleHomeRedirect;
