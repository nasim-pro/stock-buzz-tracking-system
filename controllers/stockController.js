import Stock from "../models/Stock.js";

// @desc    Create a new stock
// @route   POST /api/stocks
export const createStock = async (req, res) => {
    try {
        console.log(req.body);
        
        const stock = new Stock(req.body);
        await stock.save();
        res.status(201).json(stock);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// @desc    Get all stocks (with pagination)
// @route   GET /api/stocks
export const getStocks = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const skip = parseInt(req.query.skip) || 0;

        const stocks = await Stock.find().skip(skip).limit(limit);
        res.json(stocks);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// @desc    Get stock by ID
// @route   GET /api/stocks/:id
export const getStockById = async (req, res) => {
    try {
        const stock = await Stock.findById(req.params.id);
        if (!stock) return res.status(404).json({ error: "Stock not found" });
        res.json(stock);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// @desc    Update stock
// @route   PUT /api/stocks/:id
export const updateStock = async (req, res) => {
    try {
        const stock = await Stock.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
        });
        if (!stock) return res.status(404).json({ error: "Stock not found" });
        res.json(stock);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// @desc    Delete stock
// @route   DELETE /api/stocks/:id
export const deleteStock = async (req, res) => {
    try {
        const stock = await Stock.findByIdAndDelete(req.params.id);
        if (!stock) return res.status(404).json({ error: "Stock not found" });
        res.json({ message: "Stock deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
