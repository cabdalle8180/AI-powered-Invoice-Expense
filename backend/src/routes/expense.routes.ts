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



router.post("/", protect, authorize("owner", "accountant"), createExpense);
router.get("/", protect, authorize("owner", "accountant"), getExpenses);
router.get("/:id", protect, authorize("owner", "accountant"), getExpenseById);
router.put("/:id", protect, authorize("owner", "accountant"), updateExpense);
router.delete("/:id", protect, authorize("owner", "accountant"), deleteExpense);

export default router;