/**
 * Official application roles — use these in frontend and new backend code.
 * Legacy DB values `admin` and `operator` are mapped via normalizeRole().
 */
export const OFFICIAL_ROLES = [
  "superAdmin",
  "owner",
  "accountant",
  "staff",
  "customer",
] as const;

export type OfficialRole = (typeof OFFICIAL_ROLES)[number];

/** Legacy roles retained for existing MongoDB documents */
export const LEGACY_ROLES = ["admin", "operator"] as const;

export const USER_ROLES = [...OFFICIAL_ROLES, ...LEGACY_ROLES] as const;
export type UserRole = (typeof USER_ROLES)[number];

const ROLE_ALIASES: Record<string, OfficialRole> = {
  admin: "owner",
  businessadmin: "owner",
  operator: "staff",
};

export const normalizeRole = (role: string): OfficialRole => {
  if (!role) return "customer";

  const direct = OFFICIAL_ROLES.find(
    (r) => r.toLowerCase() === role.toLowerCase()
  );
  if (direct) return direct;

  const alias = ROLE_ALIASES[role.toLowerCase()];
  if (alias) return alias;

  return "customer";
};

export const rolesMatch = (
  userRole: UserRole | string,
  ...allowedRoles: UserRole[]
): boolean => {
  const normalizedUser = normalizeRole(userRole);
  return allowedRoles.some(
    (allowed) => normalizeRole(allowed) === normalizedUser
  );
};
