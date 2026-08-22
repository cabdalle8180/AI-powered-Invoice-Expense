"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_controller_1 = require("../controllers/admin.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const role_middleware_1 = require("../middleware/role.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.protect);
/**
 * GET /api/admin/stats
 * System-wide statistics — superAdmin only
 */
router.get("/stats", (0, role_middleware_1.authorize)("superAdmin"), admin_controller_1.getAdminStats);
exports.default = router;
