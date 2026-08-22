import mongoose, {
  Document,
  Schema,
  Types,
} from "mongoose";

export type InvoiceStatus =
  | "draft"
  | "sent"
  | "partially_paid"
  | "paid"
  | "overdue"
  | "cancelled";

export interface IInvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface IInvoice extends Document {
  businessId: Types.ObjectId;
  customerId: Types.ObjectId;

  invoiceNumber: string;

  issueDate: Date;
  dueDate: Date;

  items: IInvoiceItem[];

  subtotal: number;
  taxRate: number;
  taxAmount: number;

  discount: number;

  total: number;
  paidAmount: number;
  balanceDue: number;

  currency: string;

  notes?: string;

  status: InvoiceStatus;

  pdfUrl?: string;

  sentAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const invoiceItemSchema = new Schema<IInvoiceItem>(
  {
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },

    quantity: {
      type: Number,
      required: true,
      min: 0.01,
    },

    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    total: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    _id: false,
  }
);

const invoiceSchema = new Schema<IInvoice>(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: "Business",
      required: true,
      index: true,
    },

    customerId: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
      index: true,
    },

    invoiceNumber: {
      type: String,
      required: true,
      trim: true,
    },

    issueDate: {
      type: Date,
      default: Date.now,
      required: true,
    },

    dueDate: {
      type: Date,
      required: true,
    },

    items: {
      type: [invoiceItemSchema],
      required: true,
      validate: {
        validator: (items: IInvoiceItem[]) =>
          items.length > 0,
        message: "Invoice must contain at least one item",
      },
    },

    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },

    taxRate: {
      type: Number,
      default: 0,
      min: 0,
    },

    taxAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    discount: {
      type: Number,
      default: 0,
      min: 0,
    },

    total: {
      type: Number,
      required: true,
      min: 0,
    },

    paidAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    balanceDue: {
      type: Number,
      required: true,
      min: 0,
    },

    currency: {
      type: String,
      default: "USD",
      uppercase: true,
      trim: true,
    },

    notes: {
      type: String,
      trim: true,
      maxlength: 2000,
    },

    status: {
      type: String,
      enum: [
        "draft",
        "sent",
        "partially_paid",
        "paid",
        "overdue",
        "cancelled",
      ],
      default: "draft",
      index: true,
    },

    pdfUrl: {
      type: String,
      trim: true,
    },

    sentAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Invoice number must be unique inside a business,
 * not globally across all businesses.
 */
invoiceSchema.index(
  { businessId: 1, invoiceNumber: 1 },
  { unique: true }
);

invoiceSchema.index({
  businessId: 1,
  customerId: 1,
});

invoiceSchema.index({
  businessId: 1,
  status: 1,
});

invoiceSchema.index({
  businessId: 1,
  dueDate: 1,
});

invoiceSchema.index({
  businessId: 1,
  issueDate: -1,
});

const Invoice = mongoose.model<IInvoice>(
  "Invoice",
  invoiceSchema
);

export default Invoice;