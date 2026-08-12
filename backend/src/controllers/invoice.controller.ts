import { Response } from "express";
import mongoose from "mongoose";

import Invoice, {
  IInvoiceItem,
  InvoiceStatus,
} from "../models/Invoice";

import Customer from "../models/Customer";
import { AuthRequest } from "../middleware/auth.middleware";


// HELPERS


const isNonEmptyString = (value: unknown): value is string => {
  return typeof value === "string" && value.trim().length > 0;
};

const isValidObjectId = (id: unknown): id is string => {
  return (
    typeof id === "string" &&
    mongoose.Types.ObjectId.isValid(id)
  );
};

const isValidNumber = (value: unknown): value is number => {
  return typeof value === "number" && Number.isFinite(value);
};

const roundMoney = (value: number): number => {
  return Math.round((value + Number.EPSILON) * 100) / 100;
};

// CALCULATE INVOICE

const calculateInvoice = (
  items: IInvoiceItem[],
  taxRate: number,
  discount: number,
  paidAmount: number
) => {
  const subtotal = roundMoney(
    items.reduce((sum, item) => {
      return sum + item.quantity * item.unitPrice;
    }, 0)
  );

  const taxAmount = roundMoney(
    subtotal * (taxRate / 100)
  );

  const total = roundMoney(
    subtotal + taxAmount - discount
  );

  const balanceDue = roundMoney(
    total - paidAmount
  );

  return {
    subtotal,
    taxAmount,
    total,
    balanceDue,
  };
};

// DETERMINE STATUS

const calculateStatus = (
  total: number,
  paidAmount: number,
  dueDate: Date,
  currentStatus?: InvoiceStatus
): InvoiceStatus => {
  // Cancelled should remain cancelled
  if (currentStatus === "cancelled") {
    return "cancelled";
  }

  // Draft remains draft until sent
  if (currentStatus === "draft") {
    return "draft";
  }

  // Fully paid
  if (paidAmount >= total) {
    return "paid";
  }

  // Some amount paid
  if (paidAmount > 0 && paidAmount < total) {
    return "partially_paid";
  }

  // Due date passed
  if (new Date(dueDate) < new Date()) {
    return "overdue";
  }

  return "sent";
};

// CREATE INVOICE
// POST /api/invoices

export const createInvoice = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const businessId = req.user?.businessId;

    if (!businessId) {
      res.status(403).json({
        success: false,
        message: "No business associated with this user",
      });
      return;
    }

    const {
      customerId,
      invoiceNumber,
      issueDate,
      dueDate,
      items,
      taxRate = 0,
      discount = 0,
      paidAmount = 0,
      currency = "USD",
      notes,
    } = req.body;

    // ========================================================
    // REQUIRED FIELDS
    // ========================================================

    if (!isValidObjectId(customerId)) {
      res.status(400).json({
        success: false,
        message: "Valid customerId is required",
      });
      return;
    }

    if (!isNonEmptyString(invoiceNumber)) {
      res.status(400).json({
        success: false,
        message: "Invoice number is required",
      });
      return;
    }

    if (!Array.isArray(items) || items.length === 0) {
      res.status(400).json({
        success: false,
        message: "Invoice must contain at least one item",
      });
      return;
    }

    // ========================================================
    // VALIDATE CUSTOMER BELONGS TO BUSINESS
    // ========================================================

    const customer = await Customer.findOne({
      _id: customerId,
      businessId,
    });

    if (!customer) {
      res.status(404).json({
        success: false,
        message: "Customer not found in this business",
      });
      return;
    }

    if (!customer.isActive) {
      res.status(400).json({
        success: false,
        message: "Cannot create invoice for an inactive customer",
      });
      return;
    }

    // ========================================================
    // VALIDATE INVOICE NUMBER
    // ========================================================

    const normalizedInvoiceNumber =
      invoiceNumber.trim();

    const existingInvoice = await Invoice.findOne({
      businessId,
      invoiceNumber: normalizedInvoiceNumber,
    });

    if (existingInvoice) {
      res.status(409).json({
        success: false,
        message: "Invoice number already exists",
      });
      return;
    }

    // ========================================================
    // VALIDATE ITEMS
    // ========================================================

    const validatedItems: IInvoiceItem[] = [];

    for (const item of items) {
      if (!item || typeof item !== "object") {
        res.status(400).json({
          success: false,
          message: "Invalid invoice item",
        });
        return;
      }

      if (!isNonEmptyString(item.description)) {
        res.status(400).json({
          success: false,
          message: "Each item must have a description",
        });
        return;
      }

      if (
        !isValidNumber(item.quantity) ||
        item.quantity <= 0
      ) {
        res.status(400).json({
          success: false,
          message:
            "Item quantity must be greater than 0",
        });
        return;
      }

      if (
        !isValidNumber(item.unitPrice) ||
        item.unitPrice < 0
      ) {
        res.status(400).json({
          success: false,
          message:
            "Item unit price cannot be negative",
        });
        return;
      }

      const itemTotal = roundMoney(
        item.quantity * item.unitPrice
      );

      validatedItems.push({
        description: item.description.trim(),
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: itemTotal,
      });
    }

    // ========================================================
    // VALIDATE TAX / DISCOUNT / PAID
    // ========================================================

    if (
      !isValidNumber(taxRate) ||
      taxRate < 0 ||
      taxRate > 100
    ) {
      res.status(400).json({
        success: false,
        message: "Tax rate must be between 0 and 100",
      });
      return;
    }

    if (
      !isValidNumber(discount) ||
      discount < 0
    ) {
      res.status(400).json({
        success: false,
        message: "Discount cannot be negative",
      });
      return;
    }

    if (
      !isValidNumber(paidAmount) ||
      paidAmount < 0
    ) {
      res.status(400).json({
        success: false,
        message: "Paid amount cannot be negative",
      });
      return;
    }

    // ========================================================
    // CALCULATE TOTALS ON SERVER
    // ========================================================

    const calculated = calculateInvoice(
      validatedItems,
      taxRate,
      discount,
      paidAmount
    );

    if (discount > calculated.subtotal) {
      res.status(400).json({
        success: false,
        message:
          "Discount cannot be greater than subtotal",
      });
      return;
    }

    if (paidAmount > calculated.total) {
      res.status(400).json({
        success: false,
        message:
          "Paid amount cannot be greater than invoice total",
      });
      return;
    }

    // ========================================================
    // DATES
    // ========================================================

    const finalIssueDate = issueDate
      ? new Date(issueDate)
      : new Date();

    const finalDueDate = new Date(dueDate);

    if (Number.isNaN(finalDueDate.getTime())) {
      res.status(400).json({
        success: false,
        message: "Invalid due date",
      });
      return;
    }

    if (Number.isNaN(finalIssueDate.getTime())) {
      res.status(400).json({
        success: false,
        message: "Invalid issue date",
      });
      return;
    }

    if (finalDueDate < finalIssueDate) {
      res.status(400).json({
        success: false,
        message:
          "Due date cannot be before issue date",
      });
      return;
    }

    // ========================================================
    // CREATE
    // ========================================================

    const invoice = await Invoice.create({
      businessId,
      customerId,

      invoiceNumber: normalizedInvoiceNumber,

      issueDate: finalIssueDate,
      dueDate: finalDueDate,

      items: validatedItems,

      subtotal: calculated.subtotal,
      taxRate,
      taxAmount: calculated.taxAmount,

      discount,

      total: calculated.total,
      paidAmount,
      balanceDue: calculated.balanceDue,

      currency: isNonEmptyString(currency)
        ? currency.trim().toUpperCase()
        : "USD",

      notes: isNonEmptyString(notes)
        ? notes.trim()
        : undefined,

      status: paidAmount >= calculated.total
        ? "paid"
        : paidAmount > 0
        ? "partially_paid"
        : "draft",
    });

    // ========================================================
    // UPDATE CUSTOMER TOTALS
    // ========================================================

    customer.totalInvoiced = roundMoney(
      (customer.totalInvoiced || 0) +
        calculated.total
    );

    customer.totalPaid = roundMoney(
      (customer.totalPaid || 0) +
        paidAmount
    );

    customer.outstandingBalance = roundMoney(
      (customer.outstandingBalance || 0) +
        calculated.balanceDue
    );

    await customer.save();

    // ========================================================
    // RESPONSE
    // ========================================================

    res.status(201).json({
      success: true,
      message: "Invoice created successfully",
      data: {
        invoice,
      },
    });
  } catch (error: any) {
    console.error("CreateInvoice error:", error);

    // Duplicate invoice number race-condition
    if (error?.code === 11000) {
      res.status(409).json({
        success: false,
        message:
          "Invoice number already exists for this business",
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// GET ALL INVOICES
// GET /api/invoices

export const getInvoices = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const businessId = req.user?.businessId;

    if (!businessId) {
      res.status(403).json({
        success: false,
        message: "No business associated with this user",
      });
      return;
    }

    // ========================================================
    // PAGINATION
    // ========================================================

    const page = Math.max(
      1,
      parseInt(req.query.page as string, 10) || 1
    );

    const limit = Math.min(
      100,
      Math.max(
        1,
        parseInt(req.query.limit as string, 10) || 10
      )
    );

    const skip = (page - 1) * limit;

    // ========================================================
    // FILTERS
    // ========================================================

    const search =
      typeof req.query.search === "string"
        ? req.query.search.trim()
        : "";

    const status =
      typeof req.query.status === "string"
        ? req.query.status
        : undefined;

    const customerId =
      typeof req.query.customerId === "string"
        ? req.query.customerId
        : undefined;

    const filter: Record<string, any> = {
      businessId,
    };

    // Status
    if (status) {
      const allowedStatuses: InvoiceStatus[] = [
        "draft",
        "sent",
        "partially_paid",
        "paid",
        "overdue",
        "cancelled",
      ];

      if (
        allowedStatuses.includes(
          status as InvoiceStatus
        )
      ) {
        filter.status = status;
      }
    }

    // Customer
    if (customerId) {
      if (!isValidObjectId(customerId)) {
        res.status(400).json({
          success: false,
          message: "Invalid customer ID",
        });
        return;
      }

      filter.customerId = customerId;
    }

    // Search invoice number
    if (search) {
      filter.invoiceNumber = {
        $regex: search,
        $options: "i",
      };
    }

    // ========================================================
    // QUERY
    // ========================================================

    const [invoices, total] = await Promise.all([
      Invoice.find(filter)
        .populate(
          "customerId",
          "name email phone companyName"
        )
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),

      Invoice.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: {
        invoices,

        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("GetInvoices error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// GET INVOICE BY ID
// GET /api/invoices/:id

export const getInvoiceById = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const businessId = req.user?.businessId;
    const { id } = req.params;

    if (!businessId) {
      res.status(403).json({
        success: false,
        message: "No business associated with this user",
      });
      return;
    }

    if (!isValidObjectId(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid invoice ID",
      });
      return;
    }

    const invoice = await Invoice.findOne({
      _id: id,
      businessId,
    }).populate(
      "customerId",
      "name email phone address companyName taxNumber"
    );

    if (!invoice) {
      res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
      return;
    }

    // Automatically report overdue
    if (
      invoice.status === "sent" &&
      invoice.balanceDue > 0 &&
      invoice.dueDate < new Date()
    ) {
      invoice.status = "overdue";
      await invoice.save();
    }

    res.status(200).json({
      success: true,
      data: {
        invoice,
      },
    });
  } catch (error) {
    console.error("GetInvoiceById error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// UPDATE INVOICE
// PUT /api/invoices/:id

export const updateInvoice = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const businessId = req.user?.businessId;
    const { id } = req.params;

    if (!businessId) {
      res.status(403).json({
        success: false,
        message: "No business associated with this user",
      });
      return;
    }

    if (!isValidObjectId(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid invoice ID",
      });
      return;
    }

    const invoice = await Invoice.findOne({
      _id: id,
      businessId,
    });

    if (!invoice) {
      res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
      return;
    }

    // Do not modify cancelled invoices
    if (invoice.status === "cancelled") {
      res.status(400).json({
        success: false,
        message:
          "Cancelled invoices cannot be updated",
      });
      return;
    }

    const {
      customerId,
      invoiceNumber,
      issueDate,
      dueDate,
      items,
      taxRate,
      discount,
      paidAmount,
      currency,
      notes,
    } = req.body;

    // ========================================================
    // CUSTOMER
    // ========================================================

    if (customerId !== undefined) {
      if (!isValidObjectId(customerId)) {
        res.status(400).json({
          success: false,
          message: "Invalid customer ID",
        });
        return;
      }

      const customer = await Customer.findOne({
        _id: customerId,
        businessId,
      });

      if (!customer) {
        res.status(404).json({
          success: false,
          message:
            "Customer not found in this business",
        });
        return;
      }

      invoice.customerId =
        new mongoose.Types.ObjectId(customerId);
    }

    // ========================================================
    // INVOICE NUMBER
    // ========================================================

    if (invoiceNumber !== undefined) {
      if (!isNonEmptyString(invoiceNumber)) {
        res.status(400).json({
          success: false,
          message: "Invoice number cannot be empty",
        });
        return;
      }

      const normalized =
        invoiceNumber.trim();

      const duplicate = await Invoice.findOne({
        businessId,
        invoiceNumber: normalized,
        _id: { $ne: id },
      });

      if (duplicate) {
        res.status(409).json({
          success: false,
          message:
            "Another invoice with this number already exists",
        });
        return;
      }

      invoice.invoiceNumber = normalized;
    }

    // ========================================================
    // ITEMS
    // ========================================================

    let finalItems = invoice.items;

    if (items !== undefined) {
      if (!Array.isArray(items) || items.length === 0) {
        res.status(400).json({
          success: false,
          message:
            "Invoice must contain at least one item",
        });
        return;
      }

      const validatedItems: IInvoiceItem[] = [];

      for (const item of items) {
        if (!isNonEmptyString(item.description)) {
          res.status(400).json({
            success: false,
            message:
              "Each item must have a description",
          });
          return;
        }

        if (
          !isValidNumber(item.quantity) ||
          item.quantity <= 0
        ) {
          res.status(400).json({
            success: false,
            message:
              "Item quantity must be greater than 0",
          });
          return;
        }

        if (
          !isValidNumber(item.unitPrice) ||
          item.unitPrice < 0
        ) {
          res.status(400).json({
            success: false,
            message:
              "Item unit price cannot be negative",
          });
          return;
        }

        validatedItems.push({
          description:
            item.description.trim(),
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: roundMoney(
            item.quantity * item.unitPrice
          ),
        });
      }

      finalItems = validatedItems;
    }

    // ========================================================
    // TAX / DISCOUNT / PAID
    // ========================================================

    const finalTaxRate =
      taxRate !== undefined
        ? taxRate
        : invoice.taxRate;

    const finalDiscount =
      discount !== undefined
        ? discount
        : invoice.discount;

    const finalPaidAmount =
      paidAmount !== undefined
        ? paidAmount
        : invoice.paidAmount;

    if (
      !isValidNumber(finalTaxRate) ||
      finalTaxRate < 0 ||
      finalTaxRate > 100
    ) {
      res.status(400).json({
        success: false,
        message:
          "Tax rate must be between 0 and 100",
      });
      return;
    }

    if (
      !isValidNumber(finalDiscount) ||
      finalDiscount < 0
    ) {
      res.status(400).json({
        success: false,
        message: "Discount cannot be negative",
      });
      return;
    }

    if (
      !isValidNumber(finalPaidAmount) ||
      finalPaidAmount < 0
    ) {
      res.status(400).json({
        success: false,
        message:
          "Paid amount cannot be negative",
      });
      return;
    }

    // ========================================================
    // RECALCULATE
    // ========================================================

    const calculated = calculateInvoice(
      finalItems,
      finalTaxRate,
      finalDiscount,
      finalPaidAmount
    );

    if (finalDiscount > calculated.subtotal) {
      res.status(400).json({
        success: false,
        message:
          "Discount cannot be greater than subtotal",
      });
      return;
    }

    if (finalPaidAmount > calculated.total) {
      res.status(400).json({
        success: false,
        message:
          "Paid amount cannot be greater than invoice total",
      });
      return;
    }

    // ========================================================
    // DATES
    // ========================================================

    const finalIssueDate =
      issueDate !== undefined
        ? new Date(issueDate)
        : invoice.issueDate;

    const finalDueDate =
      dueDate !== undefined
        ? new Date(dueDate)
        : invoice.dueDate;

    if (
      Number.isNaN(finalIssueDate.getTime()) ||
      Number.isNaN(finalDueDate.getTime())
    ) {
      res.status(400).json({
        success: false,
        message: "Invalid invoice date",
      });
      return;
    }

    if (finalDueDate < finalIssueDate) {
      res.status(400).json({
        success: false,
        message:
          "Due date cannot be before issue date",
      });
      return;
    }

    // ========================================================
    // CUSTOMER OLD TOTALS
    // ========================================================

    const oldTotal = invoice.total;
    const oldPaid = invoice.paidAmount;
    const oldBalance = invoice.balanceDue;

    // ========================================================
    // UPDATE INVOICE
    // ========================================================

    invoice.items = finalItems;
    invoice.issueDate = finalIssueDate;
    invoice.dueDate = finalDueDate;

    invoice.taxRate = finalTaxRate;
    invoice.taxAmount = calculated.taxAmount;

    invoice.discount = finalDiscount;

    invoice.subtotal = calculated.subtotal;
    invoice.total = calculated.total;

    invoice.paidAmount = finalPaidAmount;
    invoice.balanceDue = calculated.balanceDue;

    if (currency !== undefined) {
      invoice.currency =
        isNonEmptyString(currency)
          ? currency.trim().toUpperCase()
          : invoice.currency;
    }

    if (notes !== undefined) {
      invoice.notes =
        isNonEmptyString(notes)
          ? notes.trim()
          : undefined;
    }

    // Keep draft if still draft
    if (invoice.status !== "draft") {
      invoice.status = calculateStatus(
        calculated.total,
        finalPaidAmount,
        finalDueDate,
        invoice.status
      );
    }

    await invoice.save();

    // ========================================================
    // UPDATE CUSTOMER TOTALS
    // ========================================================

    const customer = await Customer.findOne({
      _id: invoice.customerId,
      businessId,
    });

    if (customer) {
      customer.totalInvoiced = roundMoney(
        (customer.totalInvoiced || 0) -
          oldTotal +
          invoice.total
      );

      customer.totalPaid = roundMoney(
        (customer.totalPaid || 0) -
          oldPaid +
          invoice.paidAmount
      );

      customer.outstandingBalance = roundMoney(
        (customer.outstandingBalance || 0) -
          oldBalance +
          invoice.balanceDue
      );

      await customer.save();
    }

    res.status(200).json({
      success: true,
      message: "Invoice updated successfully",
      data: {
        invoice,
      },
    });
  } catch (error: any) {
    console.error("UpdateInvoice error:", error);

    if (error?.code === 11000) {
      res.status(409).json({
        success: false,
        message:
          "Invoice number already exists for this business",
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// DELETE / CANCEL INVOICE
// DELETE /api/invoices/:id

export const deleteInvoice = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const businessId = req.user?.businessId;
    const { id } = req.params;

    if (!businessId) {
      res.status(403).json({
        success: false,
        message: "No business associated with this user",
      });
      return;
    }

    if (!isValidObjectId(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid invoice ID",
      });
      return;
    }

    const invoice = await Invoice.findOne({
      _id: id,
      businessId,
    });

    if (!invoice) {
      res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
      return;
    }

    if (invoice.status === "cancelled") {
      res.status(400).json({
        success: false,
        message: "Invoice is already cancelled",
      });
      return;
    }

    // ========================================================
    // UPDATE CUSTOMER TOTALS
    // ========================================================

    const customer = await Customer.findOne({
      _id: invoice.customerId,
      businessId,
    });

    if (customer) {
      customer.totalInvoiced = roundMoney(
        Math.max(
          0,
          (customer.totalInvoiced || 0) -
            invoice.total
        )
      );

      customer.totalPaid = roundMoney(
        Math.max(
          0,
          (customer.totalPaid || 0) -
            invoice.paidAmount
        )
      );

      customer.outstandingBalance = roundMoney(
        Math.max(
          0,
          (customer.outstandingBalance || 0) -
            invoice.balanceDue
        )
      );

      await customer.save();
    }

    // ========================================================
    // SOFT DELETE = CANCEL
    // ========================================================

    invoice.status = "cancelled";

    await invoice.save();

    res.status(200).json({
      success: true,
      message: "Invoice cancelled successfully",
      data: {
        invoice,
      },
    });
  } catch (error) {
    console.error("DeleteInvoice error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// UPDATE STATUS
// PATCH /api/invoices/:id/status

export const updateInvoiceStatus = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const businessId = req.user?.businessId;
    const { id } = req.params;
    const { status } = req.body;

    if (!businessId) {
      res.status(403).json({
        success: false,
        message: "No business associated with this user",
      });
      return;
    }

    if (!isValidObjectId(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid invoice ID",
      });
      return;
    }

    const allowedStatuses: InvoiceStatus[] = [
      "draft",
      "sent",
      "partially_paid",
      "paid",
      "overdue",
      "cancelled",
    ];

    if (!allowedStatuses.includes(status)) {
      res.status(400).json({
        success: false,
        message: "Invalid invoice status",
      });
      return;
    }

    const invoice = await Invoice.findOne({
      _id: id,
      businessId,
    });

    if (!invoice) {
      res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
      return;
    }

    // ========================================================
    // BUSINESS RULES
    // ========================================================

    if (
      status === "paid" &&
      invoice.paidAmount < invoice.total
    ) {
      res.status(400).json({
        success: false,
        message:
          "Invoice cannot be marked as paid until the full amount is paid",
      });
      return;
    }

    if (
      status === "partially_paid" &&
      !(
        invoice.paidAmount > 0 &&
        invoice.paidAmount < invoice.total
      )
    ) {
      res.status(400).json({
        success: false,
        message:
          "Invoice does not have a partial payment",
      });
      return;
    }

    if (
      status === "overdue" &&
      invoice.balanceDue <= 0
    ) {
      res.status(400).json({
        success: false,
        message:
          "A fully paid invoice cannot be overdue",
      });
      return;
    }

    invoice.status = status;

    if (status === "sent" && !invoice.sentAt) {
      invoice.sentAt = new Date();
    }

    await invoice.save();

    res.status(200).json({
      success: true,
      message: "Invoice status updated successfully",
      data: {
        invoice,
      },
    });
  } catch (error) {
    console.error(
      "UpdateInvoiceStatus error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// SEND INVOICE
// PATCH /api/invoices/:id/send

export const sendInvoice = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const businessId = req.user?.businessId;
    const { id } = req.params;

    if (!businessId) {
      res.status(403).json({
        success: false,
        message: "No business associated with this user",
      });
      return;
    }

    if (!isValidObjectId(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid invoice ID",
      });
      return;
    }

    const invoice = await Invoice.findOne({
      _id: id,
      businessId,
    });

    if (!invoice) {
      res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
      return;
    }

    if (invoice.status === "cancelled") {
      res.status(400).json({
        success: false,
        message:
          "Cancelled invoice cannot be sent",
      });
      return;
    }

    if (invoice.status === "paid") {
      res.status(400).json({
        success: false,
        message:
          "Paid invoice does not need to be sent",
      });
      return;
    }

    // ========================================================
    // EMAIL/SMS SERVICE WILL BE ADDED HERE
    // ========================================================
    //
    // Example later:
    //
    // await sendInvoiceEmail(invoice);
    //
    // ========================================================

    invoice.status =
      invoice.paidAmount > 0
        ? "partially_paid"
        : "sent";

    invoice.sentAt = new Date();

    await invoice.save();

    res.status(200).json({
      success: true,
      message: "Invoice marked as sent successfully",
      data: {
        invoice,
      },
    });
  } catch (error) {
    console.error("SendInvoice error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};