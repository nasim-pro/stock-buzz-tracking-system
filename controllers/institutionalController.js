import InstitutionalActivity from "../models/InstitutionalActivity.js";

// @desc    Add institutional activity
// @route   POST /api/institutional
export const addInstitutionalActivity = async (req, res) => {
    try {
        const activity = new InstitutionalActivity(req.body);
        const saved = await activity.save();
        res.status(201).json(saved);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// @desc    Get recent institutional activity
// @route   GET /api/institutional/recent
export const getRecentInstitutional = async (req, res) => {
    try {
        const recent = await InstitutionalActivity.find()
            .sort({ createdAt: -1 })
            .limit(20);
        res.json(recent);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
