import puppeteer from "puppeteer";

/**
 * Scrape headlines for a specific source
 * @param {string} url - The main page URL
 * @param {string} source - Source identifier (moneycontrol, economictimes, etc.)
 */
export async function getRelevantHeadlines(url, source) {
    const browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox", "--disable-setuid-sandbox"], });
    const page = await browser.newPage();

    await page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
            "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    );

    await page.setRequestInterception(true);
    page.on("request", (request) => {
        const resourceType = request.resourceType();
        if (["image", "media", "font", "stylesheet"].includes(resourceType)) {
            request.abort();
        } else {
            request.continue();
        }
    });

    try {
        await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 });
        if (source === "economictimes") {
            await page.waitForSelector("ul li a", { timeout: 20000 });
        }

        const articles = await page.evaluate((source) => {
            if (source === "moneycontrol") {
                // Select all li elements inside ul#category
                const liNodes = Array.from(
                    document.querySelectorAll(
                        "body section div#left ul#category li",
                    ),
                );

                return liNodes.map((li) => {
                    const aTag = li.querySelector("h2 a");
                    return {
                        title: aTag ? aTag.innerText.trim() : null,
                        link: aTag ? aTag.href : null,
                    };
                }).filter((a) => a.title && a.link); // keep only valid entries
            } else if (source === "economictimes") {
                const liNodes = Array.from(document.querySelectorAll("ul li"));
                console.log("liNodes", liNodes);

                return liNodes.map((li) => {
                    const aTag = li.querySelector("a");
                    return {
                        title: aTag ? aTag.innerText.trim() : null,
                        link: aTag ? aTag.href : null,
                    };
                }).filter((a) => a.title && a.link);
            } else if (source === "livemint") {
                const nodes = Array.from(
                    document.querySelectorAll("h2 a, h3 a"),
                );
                return nodes.map((node) => ({
                    title: node.innerText.trim(),
                    link: node.href,
                })).filter((a) => a.title && a.link);
            } else {
                // Generic fallback
                const nodes = Array.from(
                    document.querySelectorAll("h1 a, h2 a, h3 a, li a, div a"),
                );
                return nodes.map((node) => ({
                    title: node.innerText.trim(),
                    link: node.href,
                })).filter((a) => a.title && a.link);
            }
        }, source);

        // console.log(`Filtered articles for ${source}:`, articles);
        const linksToVisit = filterArticlesByKeywords(articles);
        console.log("linksToVisit for ",source, linksToVisit.length);
        return linksToVisit;
    } catch (err) {
        console.error(`Error scraping ${source}:`, err.message);
        return [];
    } finally {
        await browser.close();
    }
}

const KEY_WORDS = [
    "stock",
    "shares",
    "company",
    "market",
    "finance",
    "ipo",
    "listing",
    "equity",
    "business",
    "investment",
    "trading",
    "bullish",
    "bearish",
    "dividend",
    "earnings",
    "revenue",
    "profit",
    "loss",
    "merger",
    "acquisition",
    "funding",
    "valuation",
    "crash",
    "rally",
    "correction",
    "index",
    "nifty",
    "sensex",
    "bse",
    "nse",
    "portfolio",
    "analyst",
    "target price",
    "guidance",
    "outlook",
    "sector",
    "industry",
    "inflation",
    "interest rate",
    "drop",
    "rise",
    "fall",
    "soar",
    "plummet",
    "surge",
    "slump",
    "volatility",
    "trend",
    "gainers",
    "gain",
    "shares",
    "share",
    "firm",
    "brand",
    "smallcap",
    "midcap",
    "largecap",
    "multicap",
    "penny stock",
    "investors",
    "Q1",
    "Q2",
    "Q3",
    "Q4",
    "quarterly",
    "annual",
    "yearly",
    "buyback",
    "split",
    "bonus",
    "offer",
    "dilution",
    "promoter",
    "holding",
    "fii",
    "dii",
    "sebi",
    "analysts",
    "broker",
    "downgrade",
    "upgrade",
    "maintain",
    "hold",
    "buy",
    "sell",
    "increase",
    "Microcap"
];

/**
 * Filter articles by keywords
 * @param {Array<{title: string, link: string}>} articles
 * @param {string[]} keywords
 * @returns {Array<{title: string, link: string}>}
 */
export function filterArticlesByKeywords(articles) {
    const lowerKeywords = KEY_WORDS.map(k => k.toLowerCase());

    return articles?.filter(article => {
        const text = article?.title?.toLowerCase();
        return lowerKeywords?.some(keyword => text?.includes(keyword));
    });
}

// // Example usage:
// getRelevantHeadlines(
//     "https://www.business-standard.com/markets/news",
//     "businessstandard",
// );
