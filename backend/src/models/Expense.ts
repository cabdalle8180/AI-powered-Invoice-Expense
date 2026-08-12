import mongoose, { Schema, Document } from "mongoose";

export type ExpenseCategory =
  | "rent"
  | "salaries"
  | "utilities"
  | "marketing"
  | "supplies"
  | "equipment"
  | "maintenance"
  | "taxes"
  | "other";

export interface IExpense extends Document {
  businessId: mongoose.Types.ObjectId;
  title: string;
  category: ExpenseCategory;
  amount: number;
  expenseDate: Date;
  paymentMethod: string;
  vendor?: string;
  referenceNumber?: string;
  notes?: string;
  createdById: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ExpenseSchema = new Schema<IExpense>(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: "Business",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        "rent",
        "salaries",
        "utilities",
        "marketing",
        "supplies",
        "equipment",
        "maintenance",
        "taxes",
        "other",
      ],
      default: "other",
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: [0.01, "Amount must be greater than 0"],
    },
    expenseDate: {
      type: Date,
      default: Date.now,
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "bank_transfer", "mobile_money", "credit_card", "cheque", "other"],
      default: "cash",
      required: true,
    },
    vendor: {
      type: String,
      trim: true,
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
  },
  { timestamps: true }
);

export default mongoose.model<IExpense>("Expense", ExpenseSchema);