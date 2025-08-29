// import stringSimilarity from "string-similarity";

// /**
//  * Normalize string for comparison
//  */
// function normalize(str) {
//     return str
//         .toLowerCase()
//         .replace(/ltd\.?|limited/g, "") // remove ltd/limited
//         .replace(/[^\w\s]/g, "")        // remove punctuation
//         .trim();
// }

// /**
//  * Match a headline against the stock list
//  * @param {String} headline - news headline or text
//  * @param {Array} stockList - [{ stockName, ticker }]
//  * @returns {Object|null} matched stock or null
//  */
// export function matchStock(headline, stockList) {
//     const text = normalize(headline);

//     // 1️⃣ Ticker match
//     for (const stock of stockList) {
//         if (stock.ticker && text.includes(stock.ticker.toLowerCase())) {
//             return stock;
//         }
//     }

//     // 2️⃣ Exact company name match
//     for (const stock of stockList) {
//         const company = normalize(stock.stockName);
//         if (text.includes(company)) {
//             return stock;
//         }
//     }

//     // 3️⃣ Two-word match
//     const textWords = text.split(/\s+/);
//     for (const stock of stockList) {
//         const companyWords = normalize(stock.stockName).split(/\s+/);

//         for (let i = 0; i < companyWords.length - 1; i++) {
//             const pair = companyWords[i] + " " + companyWords[i + 1];
//             if (pair.length > 3 && text.includes(pair)) {
//                 return stock;
//             }
//         }
//     }

//     // 4️⃣ Strong single-word match (brand keywords like Airtel, Paytm, Infosys, etc.)
//     for (const stock of stockList) {
//         const companyWords = normalize(stock.stockName).split(/\s+/);
//         for (const word of companyWords) {
//             if (word.length > 3 && text.includes(word)) {
//                 return stock;
//             }
//         }
//     }

//     // 5️⃣ Fuzzy fallback (short texts only)
//     if (textWords.length <= 6) {
//         const candidates = stockList.map(s => normalize(s.stockName));
//         const { bestMatch, bestMatchIndex } = stringSimilarity.findBestMatch(text, candidates);

//         if (bestMatch.rating > 0.7) {
//             return stockList[bestMatchIndex]; // return fuzzy match
//         }
//     }

//     return null; // nothing found
// }




import stringSimilarity from "string-similarity";

/**
 * Normalize string for comparison
 */
function normalize(str) {
    return str
        .toLowerCase()
        .replace(/ltd\.?|limited/g, "") // remove ltd/limited
        .replace(/[^\w\s]/g, "")        // remove punctuation
        .trim();
}

/**
 * Match a headline against the stock list
 * @param {String} headline - news headline or text
 * @param {Array} stockList - [{ stockName, ticker }]
 * @returns {Object|null} matched stock or null
 */
export function matchStock(headline, stockList) {
    const text = normalize(headline);

    // 1️⃣ Ticker match
    for (const stock of stockList) {
        if (stock.ticker && text.includes(stock.ticker.toLowerCase())) {
            return stock;
        }
    }

    // 2️⃣ Exact company name match
    for (const stock of stockList) {
        const company = normalize(stock.stockName);
        if (text.includes(company)) {
            return stock;
        }
    }

    // 3️⃣ Two-word match
    const textWords = text.split(/\s+/);
    for (const stock of stockList) {
        const companyWords = normalize(stock.stockName).split(/\s+/);

        for (let i = 0; i < companyWords.length - 1; i++) {
            const pair = companyWords[i] + " " + companyWords[i + 1];
            if (pair.length > 3 && text.includes(pair)) {
                return stock;
            }
        }
    }

    // 4️⃣ Strong single-word match (check ambiguity)
    const singleWordMatches = [];
    for (const stock of stockList) {
        const companyWords = normalize(stock.stockName).split(/\s+/);
        for (const word of companyWords) {
            if (word.length > 3 && text.includes(word)) {
                singleWordMatches.push(stock);
                break; // avoid duplicate push for same stock
            }
        }
    }

    if (singleWordMatches.length === 1) {
        return singleWordMatches[0]; // unique match → good
    } else if (singleWordMatches.length > 1) {
        return null; // ambiguous → reject
    }

    // 5️⃣ Fuzzy fallback (short texts only)
    if (textWords.length <= 6) {
        const candidates = stockList.map(s => normalize(s.stockName));
        const { bestMatch, bestMatchIndex } = stringSimilarity.findBestMatch(text, candidates);

        if (bestMatch.rating > 0.7) {
            return stockList[bestMatchIndex]; // return fuzzy match
        }
    }

    return null; // nothing found
}
