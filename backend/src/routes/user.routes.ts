import { Router } from "express";
import { protect } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";
import {
  getMe,
  updateMe,
  updatePassword,
  createUser,
  getUsers,
  getUserById,
  updateUser,
  toggleUserStatus,
  deleteUser,
} from "../controllers/user.controller";

const router = Router();



// Authenticated user profile routes
router.get("/users/me", protect, getMe);
router.put("/users/me", protect, updateMe);
router.put("/users/me/password", protect, updatePassword);

// Admin & management routes
router.post("/users", protect, authorize("superAdmin", "owner"), createUser);
router.get("/users", protect, authorize("superAdmin", "owner", "accountant"), getUsers);
router.get("/users/:id", protect, authorize("superAdmin", "owner", "accountant"), getUserById);
router.put("/users/:id", protect, authorize("superAdmin", "owner"), updateUser);
router.patch("/users/:id/status", protect, authorize("superAdmin", "owner"), toggleUserStatus);
router.delete("/users/:id", protect, authorize("superAdmin", "owner"), deleteUser);

export default router;