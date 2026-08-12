import { Router } from "express";

import { extractExpenseData } from "../controllers/ai.controller";
import { protect } from "../middleware/auth.middleware";
import { upload } from "../middleware/upload.middleware";

const router = Router();

// ==========================================
// PROTECTED AI ROUTES
// ==========================================

router.use(protect);

/**
 * @route   POST /api/ai/scan-receipt
 * @desc    Scan receipt/invoice using Gemini AI
 * @access  Private
 *
 * Body:
 * form-data
 * receiptFile: JPG | PNG | WEBP | PDF
 */
router.post(
  "/scan-receipt",
  upload.single("receiptFile"),
  extractExpenseData
);

export default router;