import Mention from "../models/Mention.js";

// @desc    Add a mention
// @route   POST /api/mentions
export const addMention = async (req, res) => {
    try {
        const mention = new Mention(req.body);
        const saved = await mention.save();
        res.status(201).json(saved);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};



// @desc    Get trending stocks (last 36 hours)
// @route   GET /api/mentions/trending
// export const getTrendingStocks = async (req, res) => {
//     try {
//         const last36Hours = new Date(Date.now() - 36 * 60 * 60 * 1000); // 36 hours ago

//         const trending = await Mention.aggregate([
//             { $match: { createdAt: { $gte: last36Hours } } }, // only mentions in last 36 hours
//             {
//                 $group: {
//                     _id: "$stockName",            // group by stockName
//                     mentionCount: { $sum: 1 },   // count mentions
//                 },
//             },
//             { $sort: { mentionCount: -1 } },   // sort descending by count
//             { $limit: 20 },                     // top 20
//         ]);

//         res.json(trending);
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// };

export const leastRanking = async (req, res) => {
    try {
        const last36Hours = new Date(Date.now() - 36 * 60 * 60 * 1000);

        const leastTrending = await Mention.aggregate([
            { $match: { createdAt: { $gte: last36Hours } } },
            {
                $group: {
                    _id: "$stockName",
                    ticker: { $first: "$ticker" },
                    mentionCount: { $sum: 1 },
                },
            },
            { $sort: { mentionCount: 1 } }, // ascending → least mentioned first
            { $limit: 20 },                 // bottom 20
            {
                $project: {
                    _id: 0,
                    stockName: "$_id",
                    ticker: 1,
                    mentionCount: 1,
                },
            },
        ]);

        res.json(leastTrending);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


// @desc    Get trending stocks with momentum (last 36 hours vs previous 36 hours)
// @route   GET /api/mentions/trending
// export const getTrendingStocks = async (req, res) => {
//     try {
//         const now = new Date();
//         const last36Hours = new Date(now - 36 * 60 * 60 * 1000);
//         const prev36Hours = new Date(now - 72 * 60 * 60 * 1000); // 36–72 hours ago

//         // Mentions in the last 36 hours
//         const recentMentions = await Mention.aggregate([
//             { $match: { createdAt: { $gte: last36Hours } } },
//             {
//                 $group: {
//                     _id: "$stockName",
//                     ticker: { $first: "$ticker" },
//                     mentionCount: { $sum: 1 },
//                 },
//             },
//         ]);

//         // Mentions in the previous 36–72 hours
//         const previousMentions = await Mention.aggregate([
//             { $match: { createdAt: { $gte: prev36Hours, $lt: last36Hours } } },
//             {
//                 $group: {
//                     _id: "$stockName",
//                     mentionCount: { $sum: 1 },
//                 },
//             },
//         ]);

//         // Convert previous mentions to a map for easy lookup
//         const prevMap = {};
//         previousMentions.forEach(m => {
//             prevMap[m._id] = m.mentionCount;
//         });

//         // Add momentum
//         const trendingWithMomentum = recentMentions.map(stock => {
//             const prevCount = prevMap[stock._id] || 0;
//             const momentum = prevCount > 0 ? stock.mentionCount / prevCount : stock.mentionCount;
//             return { ...stock, momentum: parseFloat(momentum.toFixed(2)) };
//         });

//         // Sort by momentum first, then mentionCount
//         trendingWithMomentum.sort((a, b) => b.momentum - a.momentum || b.mentionCount - a.mentionCount);

//         // Return top 20
//         res.json(trendingWithMomentum.slice(0, 20));
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// };

export const getTrendingStocks = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const pageNumber = parseInt(page, 10);
        const limitNumber = parseInt(limit, 10);

        if (isNaN(pageNumber) || pageNumber < 1 || isNaN(limitNumber) || limitNumber < 1) {
            return res.status(400).json({ error: 'Invalid page or limit parameters.' });
        }

        const now = new Date();
        const last36Hours = new Date(now - 36 * 60 * 60 * 1000);
        const prev36Hours = new Date(now - 72 * 60 * 60 * 1000);

        // Mentions in the last 36 hours
        const recentMentions = await Mention.aggregate([
            { $match: { createdAt: { $gte: last36Hours } } },
            {
                $group: {
                    _id: "$stockName",
                    ticker: { $first: "$ticker" },
                    mentionCount: { $sum: 1 },
                },
            },
        ]);

        // Mentions in the previous 36–72 hours
        const previousMentions = await Mention.aggregate([
            { $match: { createdAt: { $gte: prev36Hours, $lt: last36Hours } } },
            {
                $group: {
                    _id: "$stockName",
                    mentionCount: { $sum: 1 },
                },
            },
        ]);

        // Convert previous mentions to a map for easy lookup
        const prevMap = {};
        previousMentions.forEach(m => {
            prevMap[m._id] = m.mentionCount;
        });

        // Add momentum
        const trendingWithMomentum = recentMentions.map(stock => {
            const prevCount = prevMap[stock._id] || 0;
            const momentum = prevCount > 0 ? stock.mentionCount / prevCount : stock.mentionCount;
            return { ...stock, momentum: parseFloat(momentum.toFixed(2)) };
        });

        // Sort by momentum first, then mentionCount
        trendingWithMomentum.sort((a, b) => b.momentum - a.momentum || b.mentionCount - a.mentionCount);

        // Apply pagination
        const totalStocks = trendingWithMomentum.length;
        const totalPages = Math.ceil(totalStocks / limitNumber);
        const startIndex = (pageNumber - 1) * limitNumber;
        const endIndex = startIndex + limitNumber;

        const paginatedStocks = trendingWithMomentum.slice(startIndex, endIndex);

        res.json({
            stocks: paginatedStocks,
            currentPage: pageNumber,
            totalPages: totalPages,
            totalStocks: totalStocks,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};