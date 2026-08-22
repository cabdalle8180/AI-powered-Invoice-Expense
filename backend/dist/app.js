"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const business_routes_1 = __importDefault(require("./routes/business.routes"));
const customer_routes_1 = __importDefault(require("./routes/customer.routes"));
const invoice_routes_1 = __importDefault(require("./routes/invoice.routes"));
const expense_routes_1 = __importDefault(require("./routes/expense.routes"));
const payment_routes_1 = __importDefault(require("./routes/payment.routes"));
const ai_routes_1 = __importDefault(require("./routes/ai.routes"));
const report_routes_1 = __importDefault(require("./routes/report.routes"));
const receipt_routes_1 = __importDefault(require("./routes/receipt.routes"));
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Enable CORS for all routes
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
}));
// Routes
app.use("/api/auth", auth_routes_1.default);
app.use("/api/users", user_routes_1.default);
app.use("/api/businesses", business_routes_1.default);
app.use('/api/customers', customer_routes_1.default);
app.use('/api/expenses', expense_routes_1.default);
app.use('/api/payments', payment_routes_1.default);
app.use('/api/invoices', invoice_routes_1.default);
app.use('/api/ai', ai_routes_1.default);
app.use('/api/reports', report_routes_1.default);
app.use('/api/receipts', receipt_routes_1.default);
app.use('/api/admin', admin_routes_1.default);
// Global error handler — never expose stack traces
app.use((err, _req, res, _next) => {
    if (err instanceof multer_1.default.MulterError) {
        const message = err.code === "LIMIT_FILE_SIZE"
            ? "File is too large. Maximum size is 5MB."
            : "Invalid file upload.";
        res.status(400).json({ success: false, message });
        return;
    }
    if (err.message?.includes("lama oggola")) {
        res.status(400).json({ success: false, message: err.message });
        return;
    }
    console.error("Unhandled error:", err);
    res.status(500).json({
        success: false,
        message: "Internal server error",
    });
});
exports.default = app;
