// scraper.js
import axios from "axios";
import { spawn } from "child_process";
import * as cheerio from "cheerio";
import fs from "fs";

const url = "https://economictimes.indiatimes.com/markets/stocks/";

async function scrape() {
    try {
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);

        // Extract only article-related text
        let text = "";
        $("h1, h2, h3, p, a").each((_, el) => {
            text += $(el).text() + "\n";
        });

        // Call Python analyzer
        const py = spawn("python3", ["scrapeAndAnalyse/analyzer.py"]);

        let result = "";
        py.stdout.on("data", (data) => {
            result += data.toString();
        });

        py.stderr.on("data", (data) => {
            console.error(`Python error: ${data}`);
        });

        py.on("close", () => {
            // console.log("Companies found:");
            // console.log("result", result);
            // Save results to file
            const filePath = "scrapeAndAnalyse/companies.txt";
            fs.appendFileSync(filePath, result + "\n", "utf-8");
            console.log(`Company names saved to ${filePath}`);
        });

        py.stdin.write(text);
        py.stdin.end();
    } catch (err) {
        console.error("Error scraping:", err.message);
    }
}

scrape();
