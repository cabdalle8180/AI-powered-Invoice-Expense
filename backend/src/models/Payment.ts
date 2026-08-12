import mongoose, { Schema, Document } from "mongoose";

export type PaymentMethod =
  | "cash"
  | "bank_transfer"
  | "mobile_money"
  | "credit_card"
  | "cheque"
  | "other";

export interface IPayment extends Document {
  businessId: mongoose.Types.ObjectId;
  invoiceId: mongoose.Types.ObjectId;
  customerId: mongoose.Types.ObjectId;
  amount: number;
  paymentDate: Date;
  paymentMethod: PaymentMethod;
  referenceNumber?: string;
  notes?: string;
  createdById: mongoose.Types.ObjectId;
  isVoided: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: "Business",
      required: true,
      index: true,
    },
    invoiceId: {
      type: Schema.Types.ObjectId,
      ref: "Invoice",
      required: true,
      index: true,
    },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: [0.01, "Amount must be greater than 0"],
    },
    paymentDate: {
      type: Date,
      default: Date.now,
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "bank_transfer", "mobile_money", "credit_card", "cheque", "other"],
      default: "cash",
      required: true,
    },
    referenceNumber: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    createdById: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isVoided: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IPayment>("Payment", PaymentSchema);