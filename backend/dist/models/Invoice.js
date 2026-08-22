"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const invoiceItemSchema = new mongoose_1.Schema({
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
}, {
    _id: false,
});
const invoiceSchema = new mongoose_1.Schema({
    businessId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Business",
        required: true,
        index: true,
    },
    customerId: {
        type: mongoose_1.Schema.Types.ObjectId,
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
            validator: (items) => items.length > 0,
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
}, {
    timestamps: true,
});
/**
 * Invoice number must be unique inside a business,
 * not globally across all businesses.
 */
invoiceSchema.index({ businessId: 1, invoiceNumber: 1 }, { unique: true });
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
const Invoice = mongoose_1.default.model("Invoice", invoiceSchema);
exports.default = Invoice;
