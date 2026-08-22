import { Router } from "express";

import { extractExpenseData, getAiInsights } from "../controllers/ai.controller";
import { protect } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";
import { upload } from "../middleware/upload.middleware";

const router = Router();

router.use(protect);

router.get(
  "/insights",
  authorize("superAdmin", "owner", "accountant", "staff"),
  getAiInsights
);

router.post(
  "/scan-receipt",
  authorize("superAdmin", "owner", "accountant", "staff"),
  upload.single("receiptFile"),
  extractExpenseData
);

export default router;
