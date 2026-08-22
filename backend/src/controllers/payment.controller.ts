// import { Response } from "express";
// import mongoose from "mongoose";
// import Payment, { PaymentMethod } from "../models/Payment";
// import Invoice from "../models/Invoice";
// import Customer from "../models/Customer";
// import { AuthRequest } from "../middleware/auth.middleware";

// // Helper function to avoid JS floating-point issues
// const roundMoney = (value: number): number => {
//   return Math.round((value + Number.EPSILON) * 100) / 100;
// };

// const isValidObjectId = (id: unknown): id is string => {
//   return typeof id === "string" && mongoose.Types.ObjectId.isValid(id);
// };

// /**
//  * @route   POST /api/payments
//  * @desc    Record a new payment & update Invoice + Customer financials
//  * @access  Private (Owner / Accountant)
//  */
// export const recordPayment = async (
//   req: AuthRequest,
//   res: Response
// ): Promise<void> => {
//   const session = await mongoose.startSession();
//   session.startTransaction();

//   try {
//     const businessId = req.user?.businessId;
//     const currentUser = req.user as {
//       id?: string;
//       _id?: string;
//       userId?: string;
//     };
//     const userId = currentUser.id ?? currentUser._id ?? currentUser.userId;

//     if (!businessId || !userId) {
//       res.status(403).json({ success: false, message: "Unauthorized access" });
//       await session.abortTransaction();
//       session.endSession();
//       return;
//     }

//     const {
//       invoiceId,
//       amount,
//       paymentDate,
//       paymentMethod,
//       referenceNumber,
//       notes,
//     } = req.body;

//     // 1. Validations
//     if (!isValidObjectId(invoiceId)) {
//       res.status(400).json({ success: false, message: "Valid invoice ID is required" });
//       await session.abortTransaction();
//       session.endSession();
//       return;
//     }

//     const payAmount = Number(amount);
//     if (isNaN(payAmount) || payAmount <= 0) {
//       res.status(400).json({ success: false, message: "Payment amount must be greater than zero" });
//       await session.abortTransaction();
//       session.endSession();
//       return;
//     }

//     // 2. Fetch Invoice & verify tenant ownership
//     const invoice = await Invoice.findOne({ _id: invoiceId, businessId }).session(session);
//     if (!invoice) {
//       res.status(404).json({ success: false, message: "Invoice not found in this business" });
//       await session.abortTransaction();
//       session.endSession();
//       return;
//     }

//     if (invoice.status === "cancelled") {
//       res.status(400).json({ success: false, message: "Cannot accept payment for a cancelled invoice" });
//       await session.abortTransaction();
//       session.endSession();
//       return;
//     }

//     if (invoice.balanceDue <= 0) {
//       res.status(400).json({ success: false, message: "This invoice is already fully paid" });
//       await session.abortTransaction();
//       session.endSession();
//       return;
//     }

//     if (payAmount > invoice.balanceDue) {
//       res.status(400).json({
//         success: false,
//         message: `Payment amount ($${payAmount}) exceeds balance due ($${invoice.balanceDue})`,
//       });
//       await session.abortTransaction();
//       session.endSession();
//       return;
//     }

//     // 3. Fetch Customer
//     const customer = await Customer.findOne({ _id: invoice.customerId, businessId }).session(session);
//     if (!customer) {
//       res.status(404).json({ success: false, message: "Associated customer not found" });
//       await session.abortTransaction();
//       session.endSession();
//       return;
//     }

//     // 4. Create Payment Document
//     const [payment] = await Payment.create(
//       [
//         {
//           businessId,
//           invoiceId: invoice._id,
//           customerId: customer._id,
//           amount: roundMoney(payAmount),
//           paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
//           paymentMethod: (paymentMethod as PaymentMethod) || "cash",
//           referenceNumber: referenceNumber ? String(referenceNumber).trim() : undefined,
//           notes: notes ? String(notes).trim() : undefined,
//           createdById: userId,
//         },
//       ],
//       { session }
//     );

//     // 5. Update Invoice Totals & Status
//     invoice.paidAmount = roundMoney(invoice.paidAmount + payAmount);
//     invoice.balanceDue = roundMoney(Math.max(0, invoice.total - invoice.paidAmount));

//     if (invoice.balanceDue === 0) {
//       invoice.status = "paid";
//     } else {
//       invoice.status = "partially_paid";
//     }
//     await invoice.save({ session });

//     // 6. Update Customer Rollup Metrics
//     customer.totalPaid = roundMoney((customer.totalPaid || 0) + payAmount);
//     customer.outstandingBalance = roundMoney(Math.max(0, (customer.outstandingBalance || 0) - payAmount));
//     await customer.save({ session });

//     // Commit Transaction
//     await session.commitTransaction();
//     session.endSession();

//     res.status(201).json({
//       success: true,
//       message: "Payment recorded successfully",
//       data: {
//         payment,
//         invoiceSummary: {
//           total: invoice.total,
//           paidAmount: invoice.paidAmount,
//           balanceDue: invoice.balanceDue,
//           status: invoice.status,
//         },
//       },
//     });
//   } catch (error) {
//     await session.abortTransaction();
//     session.endSession();
//     console.error("RecordPayment error:", error);
//     res.status(500).json({ success: false, message: "Internal server error" });
//   }
// };

// /**
//  * @route   GET /api/payments
//  * @desc    Get all payments for a business with pagination & filtering
//  * @access  Private
//  */
// export const getPayments = async (
//   req: AuthRequest,
//   res: Response
// ): Promise<void> => {
//   try {
//     const businessId = req.user?.businessId;
//     if (!businessId) {
//       res.status(403).json({ success: false, message: "No business associated with this user" });
//       return;
//     }

//     const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
//     const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string, 10) || 10));
//     const skip = (page - 1) * limit;

//     const { invoiceId, customerId, paymentMethod } = req.query;
//     const filter: Record<string, any> = { businessId, isVoided: false };

//     if (isValidObjectId(invoiceId)) filter.invoiceId = invoiceId;
//     if (isValidObjectId(customerId)) filter.customerId = customerId;
//     if (paymentMethod) filter.paymentMethod = paymentMethod;

//     const [payments, total] = await Promise.all([
//       Payment.find(filter)
//         .populate("customerId", "name email")
//         .populate("invoiceId", "invoiceNumber total balanceDue")
//         .populate("createdById", "name email")
//         .sort({ paymentDate: -1 })
//         .skip(skip)
//         .limit(limit),
//       Payment.countDocuments(filter),
//     ]);

//     res.status(200).json({
//       success: true,
//       data: {
//         payments,
//         pagination: {
//           total,
//           page,
//           limit,
//           pages: Math.ceil(total / limit),
//         },
//       },
//     });
//   } catch (error) {
//     console.error("GetPayments error:", error);
//     res.status(500).json({ success: false, message: "Internal server error" });
//   }
// };

// /**
//  * @route   PATCH /api/payments/:id/void
//  * @desc    Void/Cancel a payment and revert Invoice & Customer balances
//  * @access  Private (Owner only)
//  */
// export const voidPayment = async (
//   req: AuthRequest,
//   res: Response
// ): Promise<void> => {
//   const session = await mongoose.startSession();
//   session.startTransaction();

//   try {
//     const businessId = req.user?.businessId;
//     const { id } = req.params;

//     if (!businessId) {
//       res.status(403).json({ success: false, message: "No business associated with this user" });
//       await session.abortTransaction();
//       session.endSession();
//       return;
//     }

//     if (!isValidObjectId(id)) {
//       res.status(400).json({ success: false, message: "Invalid payment ID" });
//       await session.abortTransaction();
//       session.endSession();
//       return;
//     }

//     const payment = await Payment.findOne({ _id: id, businessId, isVoided: false }).session(session);
//     if (!payment) {
//       res.status(404).json({ success: false, message: "Active payment record not found" });
//       await session.abortTransaction();
//       session.endSession();
//       return;
//     }

//     const invoice = await Invoice.findOne({ _id: payment.invoiceId, businessId }).session(session);
//     const customer = await Customer.findOne({ _id: payment.customerId, businessId }).session(session);

//     // Mark payment as voided
//     payment.isVoided = true;
//     await payment.save({ session });

//     // Revert Invoice balances
//     if (invoice) {
//       invoice.paidAmount = roundMoney(Math.max(0, invoice.paidAmount - payment.amount));
//       invoice.balanceDue = roundMoney(invoice.total - invoice.paidAmount);

//       if (invoice.paidAmount === 0) {
//         invoice.status = "sent";
//       } else if (invoice.balanceDue > 0) {
//         invoice.status = "partially_paid";
//       }
//       await invoice.save({ session });
//     }

//     // Revert Customer balances
//     if (customer) {
//       customer.totalPaid = roundMoney(Math.max(0, (customer.totalPaid || 0) - payment.amount));
//       customer.outstandingBalance = roundMoney((customer.outstandingBalance || 0) + payment.amount);
//       await customer.save({ session });
//     }

//     await session.commitTransaction();
//     session.endSession();

//     res.status(200).json({
//       success: true,
//       message: "Payment voided successfully and balances reverted",
//     });
//   } catch (error) {
//     await session.abortTransaction();
//     session.endSession();
//     console.error("VoidPayment error:", error);
//     res.status(500).json({ success: false, message: "Internal server error" });
//   }
// };





































import { Response } from "express";
import mongoose from "mongoose";
import Payment, { PaymentMethod } from "../models/Payment";
import Invoice from "../models/Invoice";
import Customer from "../models/Customer";
import { AuthRequest } from "../middleware/auth.middleware";
import { getCustomerRecordForUser } from "../utils/tenantScope";
import { normalizeRole } from "../constants/roles";

// Helper function to avoid JS floating-point issues
const roundMoney = (value: number): number => {
  return Math.round((value + Number.EPSILON) * 100) / 100;
};

const isValidObjectId = (id: unknown): id is string => {
  return typeof id === "string" && mongoose.Types.ObjectId.isValid(id);
};

/**
 * @route   POST /api/payments
 * @desc    Record a new payment & update Invoice + Customer financials
 * @access  Private (Owner / Accountant)
 */
export const recordPayment = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const businessId = req.user?.businessId;
    const currentUser = req.user as {
      id?: string;
      _id?: string;
      userId?: string;
    };
    const userId = currentUser?.id ?? currentUser?._id ?? currentUser?.userId;

    if (!businessId || !userId) {
      res.status(403).json({ success: false, message: "Unauthorized access" });
      return;
    }

    const {
      invoiceId,
      amount,
      paymentDate,
      paymentMethod,
      referenceNumber,
      notes,
    } = req.body;

    // 1. Validations
    if (!isValidObjectId(invoiceId)) {
      res.status(400).json({ success: false, message: "Valid invoice ID is required" });
      return;
    }

    const payAmount = Number(amount);
    if (isNaN(payAmount) || payAmount <= 0) {
      res.status(400).json({ success: false, message: "Payment amount must be greater than zero" });
      return;
    }

    // 2. Fetch Invoice & verify tenant ownership
    const invoice = await Invoice.findOne({ _id: invoiceId, businessId });
    if (!invoice) {
      res.status(404).json({ success: false, message: "Invoice not found in this business" });
      return;
    }

    if (invoice.status === "cancelled") {
      res.status(400).json({ success: false, message: "Cannot accept payment for a cancelled invoice" });
      return;
    }

    if (invoice.balanceDue <= 0) {
      res.status(400).json({ success: false, message: "This invoice is already fully paid" });
      return;
    }

    if (payAmount > invoice.balanceDue) {
      res.status(400).json({
        success: false,
        message: `Payment amount ($${payAmount}) exceeds balance due ($${invoice.balanceDue})`,
      });
      return;
    }

    // 3. Fetch Customer
    const customer = await Customer.findOne({ _id: invoice.customerId, businessId });
    if (!customer) {
      res.status(404).json({ success: false, message: "Associated customer not found" });
      return;
    }

    // 4. Create Payment Document
    const payment = await Payment.create({
      businessId,
      invoiceId: invoice._id,
      customerId: customer._id,
      amount: roundMoney(payAmount),
      paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
      paymentMethod: (paymentMethod as PaymentMethod) || "cash",
      referenceNumber: referenceNumber ? String(referenceNumber).trim() : undefined,
      notes: notes ? String(notes).trim() : undefined,
      createdById: userId,
    });

    // 5. Update Invoice Totals & Status
    invoice.paidAmount = roundMoney(invoice.paidAmount + payAmount);
    invoice.balanceDue = roundMoney(Math.max(0, invoice.total - invoice.paidAmount));

    if (invoice.balanceDue === 0) {
      invoice.status = "paid";
    } else {
      invoice.status = "partially_paid";
    }
    await invoice.save();

    // 6. Update Customer Rollup Metrics
    customer.totalPaid = roundMoney((customer.totalPaid || 0) + payAmount);
    customer.outstandingBalance = roundMoney(Math.max(0, (customer.outstandingBalance || 0) - payAmount));
    await customer.save();

    res.status(201).json({
      success: true,
      message: "Payment recorded successfully",
      data: {
        payment,
        invoiceSummary: {
          total: invoice.total,
          paidAmount: invoice.paidAmount,
          balanceDue: invoice.balanceDue,
          status: invoice.status,
        },
      },
    });
  } catch (error: any) {
    console.error("RecordPayment error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

/**
 * @route   GET /api/payments
 * @desc    Get all payments for a business with pagination & filtering
 * @access  Private
 */
export const getPayments = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const businessId = req.user?.businessId;
    if (!businessId) {
      res.status(403).json({ success: false, message: "No business associated with this user" });
      return;
    }

    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string, 10) || 10));
    const skip = (page - 1) * limit;

    const { invoiceId, customerId, paymentMethod } = req.query;
    const filter: Record<string, any> = { businessId, isVoided: false };

    if (normalizeRole(req.user?.role || "customer") === "customer") {
      const customerRecord = await getCustomerRecordForUser(req);
      if (!customerRecord) {
        res.status(403).json({
          success: false,
          message: "No customer profile linked to this account",
        });
        return;
      }
      filter.customerId = customerRecord._id;
    } else if (isValidObjectId(customerId)) {
      filter.customerId = customerId;
    }

    if (isValidObjectId(invoiceId)) filter.invoiceId = invoiceId;
    if (paymentMethod) filter.paymentMethod = paymentMethod;

    const [payments, total] = await Promise.all([
      Payment.find(filter)
        .populate("customerId", "name email")
        .populate("invoiceId", "invoiceNumber total balanceDue")
        .populate("createdById", "name email")
        .sort({ paymentDate: -1 })
        .skip(skip)
        .limit(limit),
      Payment.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: {
        payments,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("GetPayments error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * @route   PATCH /api/payments/:id/void
 * @desc    Void/Cancel a payment and revert Invoice & Customer balances
 * @access  Private (Owner only)
 */
export const voidPayment = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const businessId = req.user?.businessId;
    const { id } = req.params;

    if (!businessId) {
      res.status(403).json({ success: false, message: "No business associated with this user" });
      return;
    }

    if (!isValidObjectId(id)) {
      res.status(400).json({ success: false, message: "Invalid payment ID" });
      return;
    }

    const payment = await Payment.findOne({ _id: id, businessId, isVoided: false });
    if (!payment) {
      res.status(404).json({ success: false, message: "Active payment record not found" });
      return;
    }

    const invoice = await Invoice.findOne({ _id: payment.invoiceId, businessId });
    const customer = await Customer.findOne({ _id: payment.customerId, businessId });

    // Mark payment as voided
    payment.isVoided = true;
    await payment.save();

    // Revert Invoice balances
    if (invoice) {
      invoice.paidAmount = roundMoney(Math.max(0, invoice.paidAmount - payment.amount));
      invoice.balanceDue = roundMoney(invoice.total - invoice.paidAmount);

      if (invoice.paidAmount === 0) {
        invoice.status = "sent";
      } else if (invoice.balanceDue > 0) {
        invoice.status = "partially_paid";
      }
      await invoice.save();
    }

    // Revert Customer balances
    if (customer) {
      customer.totalPaid = roundMoney(Math.max(0, (customer.totalPaid || 0) - payment.amount));
      customer.outstandingBalance = roundMoney((customer.outstandingBalance || 0) + payment.amount);
      await customer.save();
    }

    res.status(200).json({
      success: true,
      message: "Payment voided successfully and balances reverted",
    });
  } catch (error) {
    console.error("VoidPayment error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};