import { Router } from "express";
import { protect } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";
import { upload } from "../middleware/upload.middleware";
import {
  getMe,
  updateMe,
  updatePassword,
  uploadAvatar,
  deleteAvatar,
  createUser,
  getUsers,
  getUserById,
  updateUser,
  toggleUserStatus,
  deleteUser,
} from "../controllers/user.controller";
import {
  getOwners,
  getOwnerById,
  createOwner,
  updateOwner,
  toggleOwnerStatus,
  deleteOwner,
} from "../controllers/owner.controller";

const router = Router();

// Authenticated current user profile
router.get("/me", protect, getMe);
router.put("/me", protect, updateMe);
router.put("/me/password", protect, updatePassword);
router.post("/me/avatar", protect, upload.single("avatar"), uploadAvatar);
router.delete("/me/avatar", protect, deleteAvatar);

// SuperAdmin owner management
router.get("/owners", protect, authorize("superAdmin"), getOwners);
router.get("/owners/:id", protect, authorize("superAdmin"), getOwnerById);
router.post("/owners", protect, authorize("superAdmin"), createOwner);
router.put("/owners/:id", protect, authorize("superAdmin"), updateOwner);
router.patch("/owners/:id/status", protect, authorize("superAdmin"), toggleOwnerStatus);
router.delete("/owners/:id", protect, authorize("superAdmin"), deleteOwner);

// User management
router.post("/", protect, authorize("superAdmin", "owner"), createUser);
router.get("/", protect, authorize("superAdmin", "owner", "accountant"), getUsers);
router.get("/:id", protect, authorize("superAdmin", "owner", "accountant"), getUserById);
router.put("/:id", protect, authorize("superAdmin", "owner"), updateUser);
router.patch("/:id/status", protect, authorize("superAdmin", "owner"), toggleUserStatus);
router.delete("/:id", protect, authorize("superAdmin", "owner"), deleteUser);

export default router;
