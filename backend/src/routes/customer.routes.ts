import { Router } from "express";
import {
  createCustomer,
  getCustomers,
  getCustomerMe,
  updateCustomerMe,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
  restoreCustomer,
  toggleCustomerStatus,
} from "../controllers/customer.controller";
import { protect } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";

const router = Router();

router.post(
  "/",
  protect,
  authorize("owner"),
  createCustomer
);

router.get(
  "/me",
  protect,
  authorize("customer"),
  getCustomerMe
);

router.put(
  "/me",
  protect,
  authorize("customer"),
  updateCustomerMe
);

router.get(
  "/",
  protect,
  authorize("owner", "accountant", "staff"),
  getCustomers
);

router.get(
  "/:id",
  protect,
  authorize("superAdmin", "owner", "accountant", "staff", "customer"),
  getCustomerById
);

router.put(
  "/:id",
  protect,
  authorize("superAdmin", "owner", "accountant"),
  updateCustomer
);

router.delete(
  "/:id",
  protect,
  authorize("superAdmin", "owner", "accountant"),
  deleteCustomer
);

router.patch(
  "/:id/status",
  protect,
  authorize("superAdmin", "owner", "accountant"),
  toggleCustomerStatus
);

router.patch(
  "/:id/restore",
  protect,
  authorize("superAdmin", "owner", "accountant"),
  restoreCustomer
);

export default router;
