import { Response } from "express";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User, { IUser } from "../models/user";
import Business from "../models/Business";
import Customer from "../models/Customer";
import { AuthRequest } from "../middleware/auth.middleware";
import { executeWithTransactionFallback } from "../utils/safeTransaction";

const isNonEmptyString = (val: unknown): val is string =>
  typeof val === "string" && val.trim().length > 0;

const isValidObjectId = (id: unknown): id is string =>
  typeof id === "string" && mongoose.Types.ObjectId.isValid(id);

const isValidEmail = (email: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

import { UserRole } from "../constants/roles";

const OWNER_ROLES: UserRole[] = ["owner", "admin"];

const cascadeBusinessActiveStatus = async (
  businessId: mongoose.Types.ObjectId,
  isActive: boolean
): Promise<void> => {
  await Business.findByIdAndUpdate(businessId, { isActive });

  await User.updateMany(
    { businessId, role: { $ne: "superAdmin" } },
    { isActive }
  );

  await Customer.updateMany({ businessId }, { isActive });
};

const sanitizeOwner = (user: IUser, business?: { _id: mongoose.Types.ObjectId; name: string; isActive: boolean } | null) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  businessId: user.businessId,
  isActive: user.isActive,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
  business: business
    ? {
        id: business._id,
        name: business.name,
        isActive: business.isActive,
      }
    : null,
});

/**
 * GET /api/users/owners
 */
export const getOwners = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string, 10) || 10));
    const skip = (page - 1) * limit;
    const search = typeof req.query.search === "string" ? req.query.search.trim() : "";

    const filter: Record<string, unknown> = { role: { $in: OWNER_ROLES } };

    if (search) {
      const regex = new RegExp(search, "i");
      filter.$or = [{ name: regex }, { email: regex }];
    }

    const [owners, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(filter),
    ]);

    const businessIds = owners
      .map((o) => o.businessId)
      .filter((id): id is mongoose.Types.ObjectId => !!id);

    const businesses = await Business.find({ _id: { $in: businessIds } }).select(
      "_id name isActive ownerId"
    );

    const businessMap = new Map(businesses.map((b) => [b._id.toString(), b]));

    const ownersWithBusiness = owners.map((owner) => {
      const business = owner.businessId
        ? businessMap.get(owner.businessId.toString()) ?? null
        : null;
      return sanitizeOwner(owner, business);
    });

    res.status(200).json({
      success: true,
      data: {
        owners: ownersWithBusiness,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit) || 1,
        },
      },
    });
  } catch (error) {
    console.error("getOwners error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * GET /api/users/owners/:id
 */
export const getOwnerById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      res.status(400).json({ success: false, message: "Invalid owner ID" });
      return;
    }

    const owner = await User.findOne({ _id: id, role: { $in: OWNER_ROLES } });

    if (!owner) {
      res.status(404).json({ success: false, message: "Owner not found" });
      return;
    }

    const business = owner.businessId
      ? await Business.findById(owner.businessId).select("_id name email phone address isActive")
      : null;

    res.status(200).json({
      success: true,
      data: { owner: sanitizeOwner(owner, business) },
    });
  } catch (error) {
    console.error("getOwnerById error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * POST /api/users/owners
 */
export const createOwner = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { businessName, ownerName, email, password, confirmPassword, phone } = req.body;

    if (!isNonEmptyString(businessName)) {
      res.status(400).json({ success: false, message: "Business name is required" });
      return;
    }

    if (!isNonEmptyString(ownerName)) {
      res.status(400).json({ success: false, message: "Owner name is required" });
      return;
    }

    if (!isNonEmptyString(email)) {
      res.status(400).json({ success: false, message: "Email is required" });
      return;
    }

    if (!isNonEmptyString(password)) {
      res.status(400).json({ success: false, message: "Password is required" });
      return;
    }

    if (!isNonEmptyString(confirmPassword)) {
      res.status(400).json({ success: false, message: "Confirm password is required" });
      return;
    }

    if (password !== confirmPassword) {
      res.status(400).json({ success: false, message: "Passwords do not match" });
      return;
    }

    if (password.length < 8) {
      res.status(400).json({ success: false, message: "Password must be at least 8 characters" });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (!isValidEmail(normalizedEmail)) {
      res.status(400).json({ success: false, message: "Invalid email address" });
      return;
    }

    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      res.status(409).json({ success: false, message: "Email already exists" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let createdUserId: mongoose.Types.ObjectId | null = null;

    const { owner, business } = await executeWithTransactionFallback(
      async (session) => {
        const opts = session ? { session } : {};

        const [createdOwner] = await User.create(
          [
            {
              name: ownerName.trim(),
              email: normalizedEmail,
              password: hashedPassword,
              phone: isNonEmptyString(phone) ? phone.trim() : undefined,
              role: "owner",
              isActive: true,
            },
          ],
          opts
        );

        createdUserId = createdOwner._id as mongoose.Types.ObjectId;

        const [createdBusiness] = await Business.create(
          [
            {
              name: businessName.trim(),
              email: normalizedEmail,
              phone: isNonEmptyString(phone) ? phone.trim() : undefined,
              ownerId: createdOwner._id,
              isActive: true,
            },
          ],
          opts
        );

        createdOwner.businessId = createdBusiness._id as mongoose.Types.ObjectId;
        await createdOwner.save(opts);

        return { owner: createdOwner, business: createdBusiness };
      },
      async () => {
        if (createdUserId) {
          await User.findByIdAndDelete(createdUserId);
        }
      }
    );

    res.status(201).json({
      success: true,
      message: "Owner and business created successfully",
      data: {
        owner: sanitizeOwner(owner, business),
      },
    });
  } catch (error) {

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === 11000
    ) {
      res.status(409).json({ success: false, message: "Email already exists" });
      return;
    }

    console.error("createOwner error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * PUT /api/users/owners/:id
 */
export const updateOwner = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { ownerName, businessName, email, password, phone } = req.body;

    if (!isValidObjectId(id)) {
      res.status(400).json({ success: false, message: "Invalid owner ID" });
      return;
    }

    const owner = await User.findOne({ _id: id, role: { $in: OWNER_ROLES } });

    if (!owner) {
      res.status(404).json({ success: false, message: "Owner not found" });
      return;
    }

    if (ownerName !== undefined) {
      if (!isNonEmptyString(ownerName)) {
        res.status(400).json({ success: false, message: "Owner name cannot be empty" });
        return;
      }
      owner.name = ownerName.trim();
    }

    if (email !== undefined) {
      if (!isNonEmptyString(email)) {
        res.status(400).json({ success: false, message: "Email cannot be empty" });
        return;
      }
      const normalizedEmail = email.trim().toLowerCase();
      if (!isValidEmail(normalizedEmail)) {
        res.status(400).json({ success: false, message: "Invalid email address" });
        return;
      }
      const duplicate = await User.findOne({ email: normalizedEmail, _id: { $ne: id } });
      if (duplicate) {
        res.status(409).json({ success: false, message: "Email already exists" });
        return;
      }
      owner.email = normalizedEmail;
    }

    if (phone !== undefined) {
      owner.phone = isNonEmptyString(phone) ? phone.trim() : undefined;
    }

    if (password !== undefined && isNonEmptyString(password)) {
      if (password.length < 8) {
        res.status(400).json({ success: false, message: "Password must be at least 8 characters" });
        return;
      }
      owner.password = await bcrypt.hash(password, 10);
    }

    await owner.save();

    let business = null;
    if (owner.businessId) {
      business = await Business.findById(owner.businessId);
      if (business) {
        if (businessName !== undefined && isNonEmptyString(businessName)) {
          business.name = businessName.trim();
        }
        if (email !== undefined && isNonEmptyString(email)) {
          business.email = email.trim().toLowerCase();
        }
        if (phone !== undefined) {
          business.phone = isNonEmptyString(phone) ? phone.trim() : undefined;
        }
        await business.save();
      }
    }

    res.status(200).json({
      success: true,
      message: "Owner updated successfully",
      data: { owner: sanitizeOwner(owner, business) },
    });
  } catch (error) {
    console.error("updateOwner error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * PATCH /api/users/owners/:id/status
 */
export const toggleOwnerStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (!isValidObjectId(id)) {
      res.status(400).json({ success: false, message: "Invalid owner ID" });
      return;
    }

    if (typeof isActive !== "boolean") {
      res.status(400).json({ success: false, message: "isActive must be a boolean" });
      return;
    }

    const owner = await User.findOne({ _id: id, role: { $in: OWNER_ROLES } });

    if (!owner) {
      res.status(404).json({ success: false, message: "Owner not found" });
      return;
    }

    owner.isActive = isActive;
    await owner.save();

    if (owner.businessId) {
      await cascadeBusinessActiveStatus(owner.businessId, isActive);
    }

    const business = owner.businessId ? await Business.findById(owner.businessId) : null;

    res.status(200).json({
      success: true,
      message: `Owner ${isActive ? "activated" : "deactivated"} successfully`,
      data: { owner: sanitizeOwner(owner, business) },
    });
  } catch (error) {
    console.error("toggleOwnerStatus error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * DELETE /api/users/owners/:id — soft delete
 */
export const deleteOwner = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      res.status(400).json({ success: false, message: "Invalid owner ID" });
      return;
    }

    const owner = await User.findOne({ _id: id, role: { $in: OWNER_ROLES } });

    if (!owner) {
      res.status(404).json({ success: false, message: "Owner not found" });
      return;
    }

    owner.isActive = false;
    await owner.save();

    if (owner.businessId) {
      await cascadeBusinessActiveStatus(owner.businessId, false);
    }

    res.status(200).json({
      success: true,
      message: "Owner deactivated successfully",
    });
  } catch (error) {
    console.error("deleteOwner error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
