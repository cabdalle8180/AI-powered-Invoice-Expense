import { Router } from "express";
import { getAdminStats } from "../controllers/admin.controller";
import { protect } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";

const router = Router();

router.use(protect);

/**
 * GET /api/admin/stats
 * System-wide statistics — superAdmin only
 */
router.get("/stats", authorize("superAdmin"), getAdminStats);

export default router;
