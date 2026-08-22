import express, { Request, Response, NextFunction } from "express";
import multer from "multer";
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import businessRoutes from "./routes/business.routes";
import customerRoutes from "./routes/customer.routes";
import invoiceRoutes from "./routes/invoice.routes";
import expenseRoutes from "./routes/expense.routes";
import paymentRoutes from "./routes/payment.routes";
import aiRoutes from "./routes/ai.routes";
import reportRoutes from "./routes/report.routes";
import receiptRoutes from "./routes/receipt.routes";
import adminRoutes from "./routes/admin.routes";
import cors from "cors";
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enable CORS for all routes
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
}));
// Routes
 app.use("/api/auth", authRoutes);
 app.use("/api/users", userRoutes); 
 app.use("/api/businesses", businessRoutes);
 app.use('/api/customers', customerRoutes);
 app.use('/api/expenses', expenseRoutes);
 app.use('/api/payments', paymentRoutes);
 app.use('/api/invoices', invoiceRoutes);
 app.use('/api/ai', aiRoutes);
 app.use('/api/reports', reportRoutes);
 app.use('/api/receipts', receiptRoutes);
 app.use('/api/admin', adminRoutes);


// Global error handler — never expose stack traces
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof multer.MulterError) {
    const message =
      err.code === "LIMIT_FILE_SIZE"
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

export default app;
