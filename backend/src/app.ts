import express from "express";
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import businessRoutes from "./routes/business.routes";
import customerRoutes from "./routes/customer.routes";
import invoiceRoutes from "./routes/invoice.routes";
import expenseRoutes from "./routes/expense.routes";
import paymentRoutes from "./routes/payment.routes";
import aiRoutes from "./routes/ai.routes";
import cors from "cors";
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enable CORS for all routes
app.use(cors({
  origin: "http://localhost:5173", // Adjust this to your frontend's URL
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

// Error handling middleware

export default app;
