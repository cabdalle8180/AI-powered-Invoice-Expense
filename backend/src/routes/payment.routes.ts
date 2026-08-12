import { Router } from "express";
import {
  recordPayment,
  getPayments,
  voidPayment,
} from "../controllers/payment.controller";
import { protect } from "../middleware/auth.middleware"; // Auth middleware-kaaga
import { authorize } from "../middleware/role.middleware";

const router = Router();

// Dhammaan wadooyinka lacag bixintu waxay u baahan yihiin Login (Authentication)

/**
 * @route   POST /api/payments
 * @desc    Diiwaangeli lacag bixin cusub
 */
router.post("/", protect, authorize("owner", "accountant"), recordPayment);

/**
 * @route   GET /api/payments
 * @desc    Soo saar dhammaan lacag bixinta (Filtar & Pagination)
 */
router.get("/", protect, authorize("owner", "accountant"), getPayments);

/**
 * @route   PATCH /api/payments/:id/void
 * @desc    Kansal/Void lacag bixin hore loo sameeyay
 */
router.patch("/:id/void", protect, authorize("owner", "accountant"), voidPayment);

export default router;