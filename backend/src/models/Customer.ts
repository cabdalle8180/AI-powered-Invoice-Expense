import mongoose, { Document, Schema, Types } from "mongoose";

export interface ICustomer extends Document {
  businessId: Types.ObjectId;
  userId?: Types.ObjectId;

  name: string;
  email: string;
  phone?: string;
  address?: string;
  companyName?: string;
  taxNumber?: string;

  totalInvoiced: number;
  totalPaid: number;
  outstandingBalance: number;

  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const customerSchema = new Schema<ICustomer>(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: "Business",
      required: true,
      index: true,
    },

    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      trim: true,
    },

    address: {
      type: String,
      trim: true,
    },

    companyName: {
      type: String,
      trim: true,
    },

    taxNumber: {
      type: String,
      trim: true,
    },

    totalInvoiced: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalPaid: {
      type: Number,
      default: 0,
      min: 0,
    },

    outstandingBalance: {
      type: Number,
      default: 0,
      min: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

customerSchema.index({ businessId: 1, email: 1 });

const Customer = mongoose.model<ICustomer>(
  "Customer",
  customerSchema
);

export default Customer;