import { Router } from "express";
import {
  recordPayment,
  getPayments,
  voidPayment,
} from "../controllers/payment.controller";
import { protect } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";

const router = Router();

router.post(
  "/",
  protect,
  authorize("superAdmin", "owner", "accountant"),
  recordPayment
);

router.get(
  "/",
  protect,
  authorize("superAdmin", "owner", "accountant", "customer"),
  getPayments
);

router.patch(
  "/:id/void",
  protect,
  authorize("superAdmin", "owner", "accountant"),
  voidPayment
);

export default router;
