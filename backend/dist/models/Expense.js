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
const ExpenseSchema = new mongoose_1.Schema({
    businessId: {
        type: mongoose_1.Schema.Types.ObjectId,
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
            "payroll",
            "utilities",
            "marketing",
            "supplies",
            "office_supplies",
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
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
}, { timestamps: true });
ExpenseSchema.index({ businessId: 1, category: 1 });
ExpenseSchema.index({ businessId: 1, expenseDate: -1 });
ExpenseSchema.index({ businessId: 1, createdAt: -1 });
ExpenseSchema.index({ businessId: 1, createdById: 1 });
exports.default = mongoose_1.default.model("Expense", ExpenseSchema);
