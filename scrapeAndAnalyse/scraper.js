// scraper.js
import axios from "axios";
import { spawn } from "child_process";
import * as cheerio from "cheerio";
import fs from "fs";
import puppeteer from "puppeteer";


// export async function scrape(url) {
//     try {
//         const { data } = await axios.get(url);
//         const $ = cheerio.load(data);

//         // Extract only article-related text
//         let text = "";
//         $("h1, h2, h3, p, a").each((_, el) => {
//             text += $(el).text() + "\n";
//         });

//         // Call Python analyzer
//         const py = spawn("python3", ["scrapeAndAnalyse/analyzer.py"]);

//         let result = "";
//         py.stdout.on("data", (data) => {
//             result += data.toString();
//         });

//         py.stderr.on("data", (data) => {
//             console.error(`Python error: ${data}`);
//         });

//         py.on("close", () => {
//             // Save results to file
//             const filePath = "scrapeAndAnalyse/companies.txt";
//             fs.appendFileSync(filePath, result + "\n", "utf-8");
//             console.log(`Company names saved to ${filePath}`);
//         });

//         py.stdin.write(text);
//         py.stdin.end();
//     } catch (err) {
//         console.error("Error scraping:", err.message);
//     }
// }

// export async function scrape(url) {
//     return new Promise(async (resolve, reject) => {
//         try {
//             const { data } = await axios.get(url, {
//                 headers: {
//                     "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
//                     "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
//                     "Accept-Language": "en-US,en;q=0.9",
//                     "Connection": "keep-alive",
//                 },
//             });

//             const $ = cheerio.load(data);

//             // Extract only article-related text
//             let text = "";
//             $("h1, h2, h3, p, a").each((_, el) => {
//                 text += $(el).text() + "\n";
//             });

//             // Call Python analyzer
//             const py = spawn("python3", ["scrapeAndAnalyse/analyzer.py"]);

//             let result = "";
//             py.stdout.on("data", (data) => {
//                 result += data.toString();
//             });

//             py.stderr.on("data", (data) => {
//                 console.error(`Python error: ${data}`);
//             });

//             py.on("close", (code) => {
//                 try {
//                     const filePath = "scrapeAndAnalyse/companies.txt";
//                     fs.appendFileSync(filePath, result + "\n", "utf-8");
//                     // console.log(`Company names saved to ${filePath}`);
//                     resolve(); // ✅ only resolve after file is written
//                 } catch (err) {
//                     reject(err);
//                 }
//             });

//             py.stdin.write(text);
//             py.stdin.end();
//         } catch (err) {
//             reject(err);
//         }
//     });
// }


// scraper.js

export async function scrape(url) {
    return new Promise(async (resolve, reject) => {
        let browser;
        try {
            browser = await puppeteer.launch({
                headless: true,
                args: ["--no-sandbox", "--disable-setuid-sandbox"]
            });
            const page = await browser.newPage();

            // Set User-Agent
            await page.setUserAgent(
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
            );

            await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });

            // Extract only article-related text
            const text = await page.evaluate(() => {
                let t = "";
                const elements = document.querySelectorAll("h1, h2, h3, p, a");
                elements.forEach(el => {
                    t += el.innerText + "\n";
                });
                return t;
            });

            await browser.close();

            // Call Python analyzer
            // const py = spawn("python3", ["scrapeAndAnalyse/analyzer.py"]);
            const py = spawn("/home/nasim/workstation/stock-buzz-tracking-system/.venv/bin/python3", ["scrapeAndAnalyse/analyzer.py"]);

            let result = "";
            py.stdout.on("data", (data) => {
                result += data.toString();
            });

            py.stderr.on("data", (data) => {
                console.error(`Python error: ${data}`);
            });

            py.on("close", (code) => {
                try {
                    const filePath = "scrapeAndAnalyse/companies.txt";
                    fs.appendFileSync(filePath, result + "\n", "utf-8");
                    resolve(); // resolve only after file is written
                } catch (err) {
                    reject(err);
                }
            });

            py.stdin.write(text);
            py.stdin.end();
        } catch (err) {
            if (browser) await browser.close();
            reject(err);
        }
    });
}
