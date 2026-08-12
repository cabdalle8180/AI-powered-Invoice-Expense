import { Router } from "express";
import {
  recordPayment,
  getPayments,
  voidPayment,
} from "../controllers/payment.controller";
import { protect } from "../middleware/auth.middleware"; // Auth middleware-kaaga

const router = Router();

// Dhammaan wadooyinka lacag bixintu waxay u baahan yihiin Login (Authentication)
router.use(protect);

/**
 * @route   POST /api/payments
 * @desc    Diiwaangeli lacag bixin cusub
 */
router.post("/", recordPayment);

/**
 * @route   GET /api/payments
 * @desc    Soo saar dhammaan lacag bixinta (Filtar & Pagination)
 */
router.get("/", getPayments);

/**
 * @route   PATCH /api/payments/:id/void
 * @desc    Kansal/Void lacag bixin hore loo sameeyay
 */
router.patch("/:id/void", voidPayment);

export default router;