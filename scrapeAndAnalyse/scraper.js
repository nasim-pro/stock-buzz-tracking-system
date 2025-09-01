// scraper.js
import { spawn } from "child_process";
import fs from "fs";
import puppeteer from "puppeteer";


/**
 * Scrapes a list of URLs sequentially and sends the combined text to a Python analyzer.
 * @param {string[]} urls - An array of URLs to scrape.
 */
export async function scrape(urls = []) {
    if (!Array.isArray(urls) || urls.length === 0) {
        throw new Error("scrape() requires a non-empty array of URLs");
    }

    let browser;
    let allText = ""; // Accumulator for all scraped text

    try {
        browser = await puppeteer.launch({
            headless: true,
            args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"], // Added --disable-gpu
            protocolTimeout: 180000 // Increased timeout to 3 minutes
        });
        const page = await browser.newPage();

        // Set User-Agent and block unnecessary resources
        await page.setUserAgent(
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
        );
        await page.setRequestInterception(true);
        page.on("request", (req) => {
            const resourceType = req.resourceType();
            if (["image", "media", "font", "stylesheet"].includes(resourceType)) {
                req.abort();
            } else {
                req.continue();
            }
        });

        console.log(`Starting sequential scraping of ${urls.length} URL(s)...`);

        for (const [i, url] of urls.entries()) {
            console.log(`[${i + 1}/${urls.length}] Visiting: ${url}`);
            try {
                // We'll increase the navigation timeout to 90 seconds here just in case
                await page.goto(url, { waitUntil: "domcontentloaded", timeout: 90000 });

                // Extract a more targeted selection of article-related text
                const text = await page.evaluate(() => {
                    // This is a more robust way to get article content
                    const selectors = "h1, h2, h3, p, span, div, title, #article-body, .article-content";
                    const elements = document.querySelectorAll(selectors);
                    let articleText = "";
                    elements.forEach(el => {
                        articleText += el.innerText + "\n";
                    });
                    return articleText;
                });

                allText += text + "\n"; // Append text to the accumulator
            } catch (err) {
                console.error(`Error scraping URL ${url}: ${err.message}`);
                // Continue to the next URL even if one fails
            }
        }

        console.log("Scraping finished. Running analyzer...");

        // Run the analyzer once with all aggregated text
         await runAnalyzer(allText);
        // const filePath = "scrapeAndAnalyse/companies.txt";
        // fs.appendFileSync(filePath, result + "\n", "utf-8");
        // console.log(`Analysis complete. Result appended to ${filePath}.`);

    } catch (err) {
        console.error("An unrecoverable error occurred during scraping or analysis:", err.message);
        throw err;
    } finally {
        if (browser) {
            await browser.close();
            console.log("Browser closed.");
        }
    }
}




/**
 * Spawns a Python process to analyze text chunks.
 * Splits input into chunks, sends each chunk to analyzer.py,
 * and appends results into scrapeAndAnalyse/companies.txt.
 * @param {string} text - The combined text from all scraped pages.
 * @returns {Promise<void>}
 */
function runAnalyzer(text) {
    const filePath = "scrapeAndAnalyse/companies.txt";
    const chunkSize = 80000;

    // Split into chunks
    const chunks = [];
    for (let i = 0; i < text.length; i += chunkSize) {
        chunks.push(text.substring(i, i + chunkSize));
    }

    console.log(`Analyzing ${chunks.length} chunks...`);

    return new Promise(async (resolve) => {
        for (let index = 0; index < chunks.length; index++) {
            const chunk = chunks[index];
            try {
                await new Promise((chunkResolve, chunkReject) => {
                    const pythonProcess = spawn(
                        "/home/nasim/workstation/stock-buzz-tracking-system/.venv/bin/python3",
                        ["scrapeAndAnalyse/analyzer.py"]
                    );

                    let pythonOutput = "";
                    let pythonError = "";

                    // Collect output
                    pythonProcess.stdout.on("data", (data) => {
                        pythonOutput += data.toString();
                    });

                    // Collect errors
                    pythonProcess.stderr.on("data", (data) => {
                        pythonError += data.toString();
                    });

                    // Handle process close
                    pythonProcess.on("close", (code) => {
                        if (code !== 0) {
                            return chunkReject(
                                new Error(`Python exited with code ${code}. Error: ${pythonError}`)
                            );
                        }

                        if (pythonOutput.trim()) {
                            fs.appendFileSync(filePath, pythonOutput + "\n");
                            const lineCount = pythonOutput.split("\n").filter(Boolean).length;
                            console.log(`✅ Finished chunk ${index + 1}/${chunks.length} → ${lineCount} orgs`);
                        } else {
                            console.log(`✅ Finished chunk ${index + 1}/${chunks.length} → no orgs found`);
                        }

                        chunkResolve();
                    });

                    pythonProcess.on("error", (err) => {
                        chunkReject(new Error(`Failed to start Python: ${err.message}`));
                    });

                    // Send text to analyzer
                    pythonProcess.stdin.write(chunk);
                    pythonProcess.stdin.end();
                });
            } catch (err) {
                console.error(`Error processing chunk ${index + 1}/${chunks.length}: ${err.message}`);
            }
        }

        console.log("🎉 All chunks analyzed!");
        resolve();
    });
}

export default runAnalyzer;
