"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rolesMatch = exports.normalizeRole = exports.USER_ROLES = exports.LEGACY_ROLES = exports.OFFICIAL_ROLES = void 0;
/**
 * Official application roles — use these in frontend and new backend code.
 * Legacy DB values `admin` and `operator` are mapped via normalizeRole().
 */
exports.OFFICIAL_ROLES = [
    "superAdmin",
    "owner",
    "accountant",
    "staff",
    "customer",
];
/** Legacy roles retained for existing MongoDB documents */
exports.LEGACY_ROLES = ["admin", "operator"];
exports.USER_ROLES = [...exports.OFFICIAL_ROLES, ...exports.LEGACY_ROLES];
const ROLE_ALIASES = {
    admin: "owner",
    businessadmin: "owner",
    operator: "staff",
};
const normalizeRole = (role) => {
    if (!role)
        return "customer";
    const direct = exports.OFFICIAL_ROLES.find((r) => r.toLowerCase() === role.toLowerCase());
    if (direct)
        return direct;
    const alias = ROLE_ALIASES[role.toLowerCase()];
    if (alias)
        return alias;
    return "customer";
};
exports.normalizeRole = normalizeRole;
const rolesMatch = (userRole, ...allowedRoles) => {
    const normalizedUser = (0, exports.normalizeRole)(userRole);
    return allowedRoles.some((allowed) => (0, exports.normalizeRole)(allowed) === normalizedUser);
};
exports.rolesMatch = rolesMatch;
