"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const user_1 = __importDefault(require("../models/user"));
dotenv_1.default.config();
const createSuperAdmin = async () => {
    try {
        const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/ai-invoice-tracker";
        await mongoose_1.default.connect(mongoUri);
        console.log("Connected to MongoDB");
        const email = "xuseen@gmail.com".trim().toLowerCase();
        const password = "12345678";
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const existing = await user_1.default.findOne({ email });
        if (existing) {
            existing.name = "xuseen";
            existing.password = hashedPassword;
            existing.phone = "619818075";
            existing.role = "superAdmin";
            existing.isActive = true;
            await existing.save();
            console.log("Super admin user updated successfully:", existing._id.toString());
        }
        else {
            const user = await user_1.default.create({
                name: "xuseen",
                email,
                password: hashedPassword,
                phone: "619818075",
                role: "superAdmin",
                isActive: true,
            });
            console.log("Super admin user created successfully:", user._id.toString());
        }
        await mongoose_1.default.disconnect();
        console.log("Done.");
        process.exit(0);
    }
    catch (error) {
        console.error("Failed to create super admin:", error);
        process.exit(1);
    }
};
createSuperAdmin();
