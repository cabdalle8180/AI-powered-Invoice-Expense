import { Router } from "express";
import { protect } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";
import {
  createInvoice,
  getInvoices,
  getInvoiceById,
  updateInvoice,
  deleteInvoice,
  updateInvoiceStatus,
  sendInvoice,
} from "../controllers/invoice.controller";

const router = Router();

router.post(
  "/",
  protect,
  authorize("superAdmin", "owner", "accountant"),
  createInvoice
);

router.get(
  "/",
  protect,
  authorize("superAdmin", "owner", "accountant", "staff", "customer"),
  getInvoices
);

router.get(
  "/:id",
  protect,
  authorize("superAdmin", "owner", "accountant", "staff", "customer"),
  getInvoiceById
);

router.put(
  "/:id",
  protect,
  authorize("superAdmin", "owner", "accountant"),
  updateInvoice
);

router.delete(
  "/:id",
  protect,
  authorize("superAdmin", "owner", "accountant"),
  deleteInvoice
);

router.patch(
  "/:id/status",
  protect,
  authorize("superAdmin", "owner", "accountant"),
  updateInvoiceStatus
);

router.patch(
  "/:id/send",
  protect,
  authorize("superAdmin", "owner", "accountant"),
  sendInvoice
);

export default router;
