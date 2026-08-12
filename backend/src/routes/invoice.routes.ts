import { Router } from "express";
import { protect } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";
import {
  createInvoice,
  getInvoices,
  getInvoiceById,
  updateInvoice,
  deleteInvoice,
} from "../controllers/invoice.controller";

const router = Router();

// ======================================================
// INVOICE ROUTES
// ======================================================

/**
 * @route   POST /api/invoices
 * @desc    Create a new invoice
 * @access  Private (Owner, Accountant)
 */
router.post(
  "/",
  protect,
  authorize("owner", "accountant"),
  createInvoice
);

/**
 * @route   GET /api/invoices
 * @desc    Get all invoices for a business
 * @access  Private (SuperAdmin, Owner, Accountant)
 */
router.get(
  "/",
  protect,
  authorize("superAdmin", "owner", "accountant"),
  getInvoices
);

/**
 * @route   GET /api/invoices/:id
 * @desc    Get a single invoice by ID
 * @access  Private (SuperAdmin, Owner, Accountant)
 */
router.get(
  "/:id",
  protect,
  authorize("superAdmin", "owner", "accountant"),
  getInvoiceById
);

/**
 * @route   PUT /api/invoices/:id
 * @desc    Update an invoice (recalculate totals if items change)
 * @access  Private (Owner, Accountant)
 */
router.put(
  "/:id",
  protect,
  authorize("owner", "accountant"),
  updateInvoice
);

/**
 * @route   DELETE /api/invoices/:id
 * @desc    Delete an invoice
 * @access  Private (Owner, Accountant)
 */
router.delete(
  "/:id",
  protect,
  authorize("owner", "accountant"),
  deleteInvoice
);


export default router;