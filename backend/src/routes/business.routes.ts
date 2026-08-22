import { Router } from "express";
import { protect } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";
import { upload } from "../middleware/upload.middleware";
import {
  createBusiness,
  getBusinesses,
  getBusinessById,
  updateBusiness,
  toggleBusinessStatus,
  uploadBusinessLogo,
} from "../controllers/business.controller";

const router = Router();

/**
 * @route   POST /api/businesses
 * @desc    Create a new business
 * @access  Private (SuperAdmin)
 */
router.post(
  "/",
  protect,
  authorize("superAdmin"),
  createBusiness
);

/**
 * @route   GET /api/businesses
 * @desc    Get businesses (SuperAdmin gets all via pagination, others get their own)
 * @access  Private (SuperAdmin, Owner, Accountant)
 */
router.get(
  "/",
  protect,
  authorize("superAdmin", "owner", "accountant"),
  getBusinesses
);

/**
 * @route   GET /api/businesses/:id
 * @desc    Get single business by ID
 * @access  Private (SuperAdmin, Owner, Accountant)
 */
router.get(
  "/:id",
  protect,
  authorize("superAdmin", "owner", "accountant"),
  getBusinessById
);

/**
 * @route   PUT /api/businesses/:id
 * @desc    Update business details
 * @access  Private (SuperAdmin, Owner)
 */
router.put(
  "/:id",
  protect,
  authorize("superAdmin", "owner"),
  updateBusiness
);

/**
 * @route   POST /api/businesses/:id/logo
 * @desc    Upload or replace business logo
 * @access  Private (SuperAdmin, Owner)
 */
router.post(
  "/:id/logo",
  protect,
  authorize("superAdmin", "owner"),
  upload.single("logo"),
  uploadBusinessLogo
);

/**
 * @route   PATCH /api/businesses/:id/status
 * @desc    Toggle business active/inactive status
 * @access  Private (SuperAdmin only)
 */
router.patch(
  "/:id/status",
  protect,
  authorize("superAdmin"),
  toggleBusinessStatus
);

export default router;