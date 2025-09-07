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
import { getRelevantLinksFromSite } from "./relevantHeadlines.js";
const MONGO_URI = process.env.MONGO_URI;
// Setup __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

async function scrapeAllLinksFromSite(site) {
    try {
        const { name, url } = site;
        const siteLinks = await getRelevantLinksFromSite(url, name);
        const linksToVisit = siteLinks?.map(l => l?.link);
        console.log(`[${new Date().toISOString()}] Total links found to visit for ${name}: ${linksToVisit.length}`);
        await scrape(linksToVisit);
    } catch (err) {
        throw err;
    }
}



async function main() {
    try {
        await mongoose.connect(MONGO_URI);
        // Fetch stock list once
        const stockList = await Stock.find({}, "stockName ticker").lean();
        console.log(`[${new Date().toLocaleString()}]`, "Scraper and Analyzer started...");
        for (const site of SITES) {
            try {
                console.log(`\n<=================================================================>\n`);
                clearCompaniesFile(); // Clear file before each scrape
                console.log(`[${ new Date().toLocaleString() }] Started Scraping: ${site.name}`);
                await scrapeAllLinksFromSite(site);
                console.log(`[${new Date().toLocaleString() }] Completed Scraping: ${site.name}`);
                await matchStocksWithCompaniesAndPush(site.name, stockList);
                await sleep(2000); // 2 seconds delay between sites
            } catch (err) {
                console.error(`[${new Date().toLocaleString() }] Error processing site ${site.name}: ${err.message}`);
            }
        }
        console.log("\nAll sites processed. Exiting...", `[${new Date().toLocaleString()}]`);
    } catch (err) {
        console.error("Fatal error:", err);
    } finally {
        await mongoose.disconnect();
    }
}

main();
