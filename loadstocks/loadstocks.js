import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import fs from "fs";
import csv from "csv-parser";
import Stock from "../models/Stock.js";
import dotenv from "dotenv";

dotenv.config();
const MONGO_URI = process.env.MONGO_URI;

// Fix for ES modules (__dirname not available by default)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Correct path to CSV (same folder as this script)
const csvFilePath = path.join(__dirname, "EQUITY_L.csv");

// Connect to MongoDB
mongoose.connect(MONGO_URI);

const results = [];

fs.createReadStream(csvFilePath)
    .pipe(csv())
    .on("data", (row) => {
        results.push({
            stockName: row["NAME OF COMPANY"]?.trim(),
            ticker: row["SYMBOL"]?.trim(),
            isin: row["ISIN NUMBER"]?.trim(),
        });
    })
    .on("end", async () => {
        console.log(`Parsed ${results.length} stocks`);
        try {
            await Stock.deleteMany({});
            await Stock.insertMany(results);
            console.log("Stocks successfully imported!");
        } catch (err) {
            console.error("Error inserting stocks:", err);
        } finally {
            mongoose.connection.close();
        }
    });
