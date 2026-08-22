import mongoose from "mongoose";
import Customer from "../models/Customer";
import { AuthRequest } from "../middleware/auth.middleware";
import { normalizeRole } from "../constants/roles";

export const isValidObjectId = (id: unknown): id is string =>
  typeof id === "string" && mongoose.Types.ObjectId.isValid(id);

export const getCustomerRecordForUser = async (
  req: AuthRequest
): Promise<{ _id: mongoose.Types.ObjectId } | null> => {
  if (!req.user?.userId || !req.user.businessId) {
    return null;
  }

  if (normalizeRole(req.user.role) !== "customer") {
    return null;
  }

  if (req.user.customerId) {
    return { _id: new mongoose.Types.ObjectId(req.user.customerId) };
  }

  return Customer.findOne({
    businessId: req.user.businessId,
    userId: req.user.userId,
    isActive: true,
  }).select("_id");
};

export const buildBusinessFilter = (
  req: AuthRequest
): Record<string, unknown> | null => {
  if (!req.user?.businessId) {
    return null;
  }
  return { businessId: req.user.businessId };
};

export const buildCustomerSelfFilter = (
  req: AuthRequest
): Record<string, unknown> | null => {
  const businessFilter = buildBusinessFilter(req);
  if (!businessFilter) {
    return null;
  }
  if (normalizeRole(req.user?.role || "") !== "customer") {
    return businessFilter;
  }
  if (!req.user?.customerId) {
    return null;
  }
  return {
    ...businessFilter,
    customerId: req.user.customerId,
  };
};
