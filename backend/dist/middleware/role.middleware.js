"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = void 0;
const roles_1 = require("../constants/roles");
const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: "Authentication required",
            });
            return;
        }
        if (!(0, roles_1.rolesMatch)(req.user.role, ...allowedRoles)) {
            res.status(403).json({
                success: false,
                message: "You do not have permission to access this resource",
            });
            return;
        }
        next();
    };
};
exports.authorize = authorize;
