import { Router } from "express";
import {
  getReceipts,
  createReceipt,
  getReceiptById,
  updateReceipt,
  deleteReceipt,
} from "../controllers/receipt.controller";
import { protect } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";

const router = Router();

router.use(protect);

router.get(
  "/",
  authorize("superAdmin", "owner", "accountant", "staff"),
  getReceipts
);

router.post(
  "/",
  authorize("superAdmin", "owner", "accountant", "staff"),
  createReceipt
);

router.get(
  "/:id",
  authorize("superAdmin", "owner", "accountant", "staff"),
  getReceiptById
);

router.put(
  "/:id",
  authorize("superAdmin", "owner", "accountant"),
  updateReceipt
);

router.delete(
  "/:id",
  authorize("superAdmin", "owner", "accountant"),
  deleteReceipt
);

export default router;
