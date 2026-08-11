import { Router } from "express";

import {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
  restoreCustomer,
} from "../controllers/customer.controller";

import { protect } from "../middleware/auth.middleware";

const router = Router();

// ======================================================
// CUSTOMER ROUTES
// ======================================================

// Create customer
router.post("/", protect, createCustomer);

// Get all customers
router.get("/", protect, getCustomers);

// Get single customer
router.get("/:id", protect, getCustomerById);

// Update customer
router.put("/:id", protect, updateCustomer);

// Soft delete / deactivate
router.delete("/:id", protect, deleteCustomer);

// Restore customer
router.patch("/:id/restore", protect, restoreCustomer);

export default router;