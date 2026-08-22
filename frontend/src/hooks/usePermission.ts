import { useAppSelector } from "./reduxHooks";
import type { UserRole } from "../types/auth";
import {
  canPerform,
  hasRoleAccess,
  normalizeRole,
  type PermissionAction,
} from "../constants/permissions";

export const usePermission = () => {
  const { user } = useAppSelector((state) => state.auth);
  const role = normalizeRole(user?.role || "customer");

  const hasPermission = (allowedRoles: UserRole[]): boolean => {
    if (!user) return false;
    return hasRoleAccess(role, allowedRoles);
  };

  const can = (action: PermissionAction): boolean => {
    if (!user) return false;
    return canPerform(role, action);
  };

  const isSuperAdmin = role === "superAdmin";
  const isOwner = role === "owner";
  const isAdmin = ["superAdmin", "owner"].includes(role);
  const isAccountant = ["superAdmin", "owner", "accountant"].includes(role);
  const isStaff = role === "staff";
  const isCustomer = role === "customer";

  return {
    user,
    role,
    hasPermission,
    can,
    isSuperAdmin,
    isOwner,
    isAdmin,
    isAccountant,
    isStaff,
    isCustomer,
  };
};

export default usePermission;
