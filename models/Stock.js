import mongoose from "mongoose";

const stockSchema = new mongoose.Schema({
    stockName: { type: String, required: true }, // Full company name
    ticker: { type: String, required: true },    // e.g., RELIANCE, TCS
    aliases: [{ type: String }],                 // nicknames, abbreviations
    sector: { type: String },
    isin: { type: String }
});

export default mongoose.model("Stock", stockSchema);
