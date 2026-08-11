import express from "express";
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import businessRoutes from "./routes/business.routes";
import customerRoutes from "./routes/customer.routes";
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
 app.use("/api/auth", authRoutes);
 app.use("/api/users", userRoutes); 
 app.use("/api/businesses", businessRoutes);
 app.use('/api/customers', customerRoutes);


export default app;
