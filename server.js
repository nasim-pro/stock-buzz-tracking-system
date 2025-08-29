import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import mentionRoutes from "./routes/mentionRoutes.js";
import institutionalRoutes from "./routes/institutionalRoutes.js";
import stockRoutes from "./routes/stockRoutes.js";

dotenv.config();  // load .env file

// Connect to MongoDB
connectDB();

const app = express();
app.use(express.json()); // parse JSON

// Routes
app.use("/api/mentions", mentionRoutes);
app.use("/api/institutional", institutionalRoutes);
app.use("/api/stocks", stockRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
