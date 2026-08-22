import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "../hooks/reduxHooks";
import { usePermission } from "../hooks/usePermission";
import type { UserRole } from "../types/auth";
import PermissionDenied from "./PermissionDenied";

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
  children?: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  allowedRoles,
  children,
}) => {
  const { isAuthenticated, isSessionChecking } = useAppSelector((state) => state.auth);
  const { role } = usePermission();

  if (isSessionChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-sm text-gray-500">Verifying session...</div>
      </div>
    );
  }

  if (!isAuthenticated || !localStorage.getItem("token")) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const isAuthorized = allowedRoles.includes(role);

    if (!isAuthorized) {
      return (
        <PermissionDenied
          requiredRole={allowedRoles.join(", ")}
          message="Ma haysatid ogolaansho buuxa oo aad ku gasho qaybtan xogta ah."
        />
      );
    }
  }

  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
