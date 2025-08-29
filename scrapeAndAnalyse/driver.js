import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { matchStock } from "./matchStock.js";
import Stock from "../models/Stock.js";

dotenv.config();

// Setup __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MONGO_URI = process.env.MONGO_URI;

async function matchFromFile() {
    try {
        await mongoose.connect(MONGO_URI);

        // Fetch stock list from DB
        const stockList = await Stock.find({}, "stockName ticker").lean();

        const filePath = path.join(__dirname, "/companies.txt");
        // Read file lines
        const lines = fs.readFileSync(filePath, "utf-8")
            .split("\n")
            .map(line => line.trim())
            .filter(Boolean); // remove empty lines

        for (const line of lines) {
            const match = matchStock(line, stockList);
            console.log(`🔎 [${line}] →`, match ? match : "No match found");
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error("Error in matchFromFile:", err);
        process.exit(1);
    }
}

// Run script

matchFromFile()
