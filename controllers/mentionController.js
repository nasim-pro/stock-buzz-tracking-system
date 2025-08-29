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

// @desc    Get trending stocks (last 7 days)
// @route   GET /api/mentions/trending
export const getTrendingStocks = async (req, res) => {
    try {
        const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

        const trending = await Mention.aggregate([
            { $match: { createdAt: { $gte: last7Days } } },
            {
                $group: {
                    _id: "$stockName",
                    mentionCount: { $sum: 1 },
                    avgSentiment: { $avg: "$sentimentScore" },
                },
            },
            { $sort: { mentionCount: -1 } },
            { $limit: 10 },
        ]);

        res.json(trending);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
