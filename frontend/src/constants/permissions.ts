import type { UserRole } from "../types/auth";

export type PermissionAction =
  | "invoice:create"
  | "invoice:update"
  | "invoice:delete"
  | "invoice:view"
  | "invoice:send"
  | "invoice:cancel"
  | "receipt:create"
  | "receipt:update"
  | "receipt:delete"
  | "receipt:view"
  | "receipt:scan"
  | "customer:create"
  | "customer:update"
  | "customer:delete"
  | "customer:view"
  | "expense:create"
  | "expense:update"
  | "expense:delete"
  | "expense:view"
  | "payment:create"
  | "payment:view"
  | "payment:void"
  | "report:view"
  | "report:export"
  | "ai:insights"
  | "business:manage"
  | "owner:manage";

const ROLE_ALIASES: Record<string, UserRole> = {
  admin: "owner",
  businessAdmin: "owner",
  operator: "staff",
};

export const normalizeRole = (role: string): UserRole => {
  if (!role) return "customer";

  const official: UserRole[] = [
    "superAdmin",
    "owner",
    "accountant",
    "staff",
    "customer",
  ];

  const matched = official.find((r) => r.toLowerCase() === role.toLowerCase());
  if (matched) return matched;

  return ROLE_ALIASES[role] ?? "customer";
};

export interface NavItemConfig {
  name: string;
  to: string;
  roles: UserRole[];
}

export const ADMIN_ROLES: UserRole[] = [
  "superAdmin",
  "owner",
  "accountant",
  "staff",
];

export const getDashboardPath = (role: UserRole): string =>
  role === "customer" ? "/customer-dashboard" : "/dashboard";

const SUPER_ADMIN_NAV: NavItemConfig[] = [
  { name: "Dashboard", to: "/dashboard", roles: ["superAdmin"] },
  { name: "User Management", to: "/user-management", roles: ["superAdmin"] },
  { name: "Businesses", to: "/businesses", roles: ["superAdmin"] },
  { name: "Reports", to: "/reports", roles: ["superAdmin"] },
  { name: "Settings", to: "/settings", roles: ["superAdmin"] },
];

const OWNER_NAV: NavItemConfig[] = [
  { name: "Dashboard", to: "/dashboard", roles: ["owner"] },
  { name: "Customers", to: "/customers", roles: ["owner"] },
  { name: "Invoices", to: "/invoices", roles: ["owner"] },
  { name: "Payments", to: "/payments", roles: ["owner"] },
  { name: "Expenses", to: "/expenses", roles: ["owner"] },
  { name: "Receipts", to: "/receipts", roles: ["owner"] },
  { name: "Reports", to: "/reports", roles: ["owner"] },
  { name: "AI Insights", to: "/ai-insights", roles: ["owner"] },
  { name: "Settings", to: "/settings", roles: ["owner"] },
];

const ACCOUNTANT_NAV: NavItemConfig[] = [
  { name: "Dashboard", to: "/dashboard", roles: ["accountant"] },
  { name: "Invoices", to: "/invoices", roles: ["accountant"] },
  { name: "Payments", to: "/payments", roles: ["accountant"] },
  { name: "Expenses", to: "/expenses", roles: ["accountant"] },
  { name: "Receipts", to: "/receipts", roles: ["accountant"] },
  { name: "Reports", to: "/reports", roles: ["accountant"] },
  { name: "AI Insights", to: "/ai-insights", roles: ["accountant"] },
  { name: "Settings", to: "/settings", roles: ["accountant"] },
];

const STAFF_NAV: NavItemConfig[] = [
  { name: "Dashboard", to: "/dashboard", roles: ["staff"] },
  { name: "Customers", to: "/customers", roles: ["staff"] },
  { name: "Invoices", to: "/invoices", roles: ["staff"] },
  { name: "Payments", to: "/payments", roles: ["staff"] },
  { name: "Receipts", to: "/receipts", roles: ["staff"] },
  { name: "AI Insights", to: "/ai-insights", roles: ["staff"] },
  { name: "Settings", to: "/settings", roles: ["staff"] },
];

export const CUSTOMER_NAV_ITEMS: NavItemConfig[] = [
  { name: "Dashboard", to: "/customer-dashboard", roles: ["customer"] },
  { name: "My Invoices", to: "/my-invoices", roles: ["customer"] },
  { name: "My Payments", to: "/my-payments", roles: ["customer"] },
  { name: "My Profile", to: "/my-profile", roles: ["customer"] },
];

export const getNavItemsForRole = (role: UserRole): NavItemConfig[] => {
  switch (role) {
    case "superAdmin":
      return SUPER_ADMIN_NAV;
    case "owner":
      return OWNER_NAV;
    case "accountant":
      return ACCOUNTANT_NAV;
    case "staff":
      return STAFF_NAV;
    case "customer":
      return CUSTOMER_NAV_ITEMS;
    default:
      return [];
  }
};

/** @deprecated Use getNavItemsForRole(role) */
export const ADMIN_NAV_ITEMS = [
  ...SUPER_ADMIN_NAV,
  ...OWNER_NAV,
  ...ACCOUNTANT_NAV,
  ...STAFF_NAV,
];

const PERMISSIONS: Record<UserRole, PermissionAction[]> = {
  superAdmin: [
    "report:view",
    "report:export",
    "business:manage",
    "owner:manage",
  ],
  owner: [
    "invoice:create",
    "invoice:update",
    "invoice:delete",
    "invoice:view",
    "invoice:send",
    "invoice:cancel",
    "receipt:create",
    "receipt:update",
    "receipt:delete",
    "receipt:view",
    "receipt:scan",
    "customer:create",
    "customer:update",
    "customer:delete",
    "customer:view",
    "expense:create",
    "expense:update",
    "expense:delete",
    "expense:view",
    "payment:create",
    "payment:view",
    "payment:void",
    "report:view",
    "report:export",
    "ai:insights",
  ],
  accountant: [
    "invoice:create",
    "invoice:update",
    "invoice:delete",
    "invoice:view",
    "invoice:send",
    "invoice:cancel",
    "receipt:create",
    "receipt:update",
    "receipt:delete",
    "receipt:view",
    "receipt:scan",
    "customer:view",
    "expense:create",
    "expense:update",
    "expense:delete",
    "expense:view",
    "payment:create",
    "payment:view",
    "payment:void",
    "report:view",
    "report:export",
    "ai:insights",
  ],
  staff: [
    "invoice:view",
    "customer:view",
    "payment:view",
    "receipt:create",
    "receipt:view",
    "receipt:scan",
    "ai:insights",
  ],
  customer: ["invoice:view", "customer:view", "payment:view"],
};

export const canPerform = (
  role: UserRole,
  action: PermissionAction
): boolean => PERMISSIONS[role]?.includes(action) ?? false;

export const hasRoleAccess = (
  role: UserRole,
  allowedRoles: UserRole[]
): boolean => allowedRoles.includes(role);
