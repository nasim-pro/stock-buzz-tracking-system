import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { matchStock } from "./matchStock.js";
import Stock from "../models/Stock.js";
import Mention from "../models/Mention.js";
dotenv.config();
import { SITES } from "./sites.js";
import { scrape } from "./scraper.js";
const MONGO_URI = process.env.MONGO_URI;
// Setup __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const COLORS = {
    reset: "\x1b[0m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    blue: "\x1b[34m",
    yellow: "\x1b[33m"
};

async function matchStocksWithCompaniesAndPush(source, stockList) {
    const filePath = path.join(__dirname, "/companies.txt");

    const lines = fs.readFileSync(filePath, "utf-8")
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);

    for (const line of lines) {
        const match = matchStock(line, stockList);
        if (match) {
            await pushMentionsToDB(match, source);
        }
    }
}

async function pushMentionsToDB(mention, source) {
    try {
        const newMention = {
            stockId: mention._id,
            stockName: mention.stockName,
            source: source,
            ticker: mention.ticker,
        };
        const created = await Mention.create(newMention);
    } catch (err) {
        console.error("Error in pushMentionsToDB:", err);
    }
}

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function clearCompaniesFile() {
    const filePath = path.join(__dirname, "/companies.txt");
    fs.writeFileSync(filePath, "");
}



async function main() {
    try {
        await mongoose.connect(MONGO_URI);

        // Fetch stock list once
        const stockList = await Stock.find({}, "stockName ticker").lean();

        for (const site of SITES) {
            try {
                console.log('');
                console.log("<============================================================>");
                console.log("<============================================================>");
                console.log('');
                clearCompaniesFile(); // Clear file before each scrape
                console.log(`${COLORS.green}Started Scraping for ${site.name}${COLORS.reset}`);
                await scrape(site.url);
                console.log(`${COLORS.green}Scraping completed for ${site.name}${COLORS.reset}`);
                await matchStocksWithCompaniesAndPush(site.name, stockList);
                await sleep(2000); // 2 seconds delay between sites
                
            } catch (err) {
                console.error(`${COLORS.red} Error processing site ${site.name}: ${err.message}${COLORS.reset}`);
            }
        }
    } catch (err) {
        console.error("Fatal error:", err);
    } finally {
        await mongoose.disconnect();
    }
}

main();
