"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const role_middleware_1 = require("../middleware/role.middleware");
const upload_middleware_1 = require("../middleware/upload.middleware");
const business_controller_1 = require("../controllers/business.controller");
const router = (0, express_1.Router)();
/**
 * @route   POST /api/businesses
 * @desc    Create a new business
 * @access  Private (SuperAdmin)
 */
router.post("/", auth_middleware_1.protect, (0, role_middleware_1.authorize)("superAdmin"), business_controller_1.createBusiness);
/**
 * @route   GET /api/businesses
 * @desc    Get businesses (SuperAdmin gets all via pagination, others get their own)
 * @access  Private (SuperAdmin, Owner, Accountant)
 */
router.get("/", auth_middleware_1.protect, (0, role_middleware_1.authorize)("superAdmin", "owner", "accountant"), business_controller_1.getBusinesses);
/**
 * @route   GET /api/businesses/:id
 * @desc    Get single business by ID
 * @access  Private (SuperAdmin, Owner, Accountant)
 */
router.get("/:id", auth_middleware_1.protect, (0, role_middleware_1.authorize)("superAdmin", "owner", "accountant"), business_controller_1.getBusinessById);
/**
 * @route   PUT /api/businesses/:id
 * @desc    Update business details
 * @access  Private (SuperAdmin, Owner)
 */
router.put("/:id", auth_middleware_1.protect, (0, role_middleware_1.authorize)("superAdmin", "owner"), business_controller_1.updateBusiness);
/**
 * @route   POST /api/businesses/:id/logo
 * @desc    Upload or replace business logo
 * @access  Private (SuperAdmin, Owner)
 */
router.post("/:id/logo", auth_middleware_1.protect, (0, role_middleware_1.authorize)("superAdmin", "owner"), upload_middleware_1.upload.single("logo"), business_controller_1.uploadBusinessLogo);
/**
 * @route   PATCH /api/businesses/:id/status
 * @desc    Toggle business active/inactive status
 * @access  Private (SuperAdmin only)
 */
router.patch("/:id/status", auth_middleware_1.protect, (0, role_middleware_1.authorize)("superAdmin"), business_controller_1.toggleBusinessStatus);
exports.default = router;
