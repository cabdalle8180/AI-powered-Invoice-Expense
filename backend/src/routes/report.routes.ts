import { Router } from "express";
import {
  getReportsSummary,
  getInvoiceReport,
  getExpenseReport,
  getPaymentReport,
  getCustomerReport,
  getRevenueReport,
  getOutstandingReport,
} from "../controllers/report.controller";
import { protect } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";

const router = Router();

router.use(protect);

router.get(
  "/summary",
  authorize("superAdmin", "owner", "accountant"),
  getReportsSummary
);

router.get(
  "/invoices",
  authorize("superAdmin", "owner", "accountant"),
  getInvoiceReport
);

router.get(
  "/expenses",
  authorize("superAdmin", "owner", "accountant"),
  getExpenseReport
);

router.get(
  "/payments",
  authorize("superAdmin", "owner", "accountant"),
  getPaymentReport
);

router.get(
  "/customers",
  authorize("superAdmin", "owner", "accountant"),
  getCustomerReport
);

router.get(
  "/revenue",
  authorize("superAdmin", "owner", "accountant"),
  getRevenueReport
);

router.get(
  "/outstanding",
  authorize("superAdmin", "owner", "accountant"),
  getOutstandingReport
);

export default router;
