import app from "./app";
import dotenv from "dotenv";
import connectDB from "./config/dbs";

dotenv.config();

const PORT = process.env.PORT || 4000;

connectDB()
app.listen(PORT ,() =>{
    console.log(`Server is running on port http://localhost:${PORT}`);
})


