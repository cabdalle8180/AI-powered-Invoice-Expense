import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth.middleware";
import { OfficialRole, rolesMatch, UserRole } from "../constants/roles";

export const authorize = (...allowedRoles: UserRole[]) => {
  return (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    if (!rolesMatch(req.user.role, ...allowedRoles)) {
      res.status(403).json({
        success: false,
        message: "You do not have permission to access this resource",
      });
      return;
    }

    next();
  };
};

export type { OfficialRole };
