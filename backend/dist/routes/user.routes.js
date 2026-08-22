"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const role_middleware_1 = require("../middleware/role.middleware");
const upload_middleware_1 = require("../middleware/upload.middleware");
const user_controller_1 = require("../controllers/user.controller");
const owner_controller_1 = require("../controllers/owner.controller");
const router = (0, express_1.Router)();
// Authenticated current user profile
router.get("/me", auth_middleware_1.protect, user_controller_1.getMe);
router.put("/me", auth_middleware_1.protect, user_controller_1.updateMe);
router.put("/me/password", auth_middleware_1.protect, user_controller_1.updatePassword);
router.post("/me/avatar", auth_middleware_1.protect, upload_middleware_1.upload.single("avatar"), user_controller_1.uploadAvatar);
router.delete("/me/avatar", auth_middleware_1.protect, user_controller_1.deleteAvatar);
// SuperAdmin owner management
router.get("/owners", auth_middleware_1.protect, (0, role_middleware_1.authorize)("superAdmin"), owner_controller_1.getOwners);
router.get("/owners/:id", auth_middleware_1.protect, (0, role_middleware_1.authorize)("superAdmin"), owner_controller_1.getOwnerById);
router.post("/owners", auth_middleware_1.protect, (0, role_middleware_1.authorize)("superAdmin"), owner_controller_1.createOwner);
router.put("/owners/:id", auth_middleware_1.protect, (0, role_middleware_1.authorize)("superAdmin"), owner_controller_1.updateOwner);
router.patch("/owners/:id/status", auth_middleware_1.protect, (0, role_middleware_1.authorize)("superAdmin"), owner_controller_1.toggleOwnerStatus);
router.delete("/owners/:id", auth_middleware_1.protect, (0, role_middleware_1.authorize)("superAdmin"), owner_controller_1.deleteOwner);
// User management
router.post("/", auth_middleware_1.protect, (0, role_middleware_1.authorize)("superAdmin", "owner"), user_controller_1.createUser);
router.get("/", auth_middleware_1.protect, (0, role_middleware_1.authorize)("superAdmin", "owner", "accountant"), user_controller_1.getUsers);
router.get("/:id", auth_middleware_1.protect, (0, role_middleware_1.authorize)("superAdmin", "owner", "accountant"), user_controller_1.getUserById);
router.put("/:id", auth_middleware_1.protect, (0, role_middleware_1.authorize)("superAdmin", "owner"), user_controller_1.updateUser);
router.patch("/:id/status", auth_middleware_1.protect, (0, role_middleware_1.authorize)("superAdmin", "owner"), user_controller_1.toggleUserStatus);
router.delete("/:id", auth_middleware_1.protect, (0, role_middleware_1.authorize)("superAdmin", "owner"), user_controller_1.deleteUser);
exports.default = router;
