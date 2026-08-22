import { Router } from "express";
import {
  createExpense,
  getExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
} from "../controllers/expense.controller";
import { protect } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";

const router = Router();

router.post(
  "/",
  protect,
  authorize("superAdmin", "owner", "accountant"),
  createExpense
);
router.get(
  "/",
  protect,
  authorize("superAdmin", "owner", "accountant"),
  getExpenses
);
router.get(
  "/:id",
  protect,
  authorize("superAdmin", "owner", "accountant"),
  getExpenseById
);
router.put(
  "/:id",
  protect,
  authorize("superAdmin", "owner", "accountant"),
  updateExpense
);
router.delete(
  "/:id",
  protect,
  authorize("superAdmin", "owner", "accountant"),
  deleteExpense
);

export default router;
