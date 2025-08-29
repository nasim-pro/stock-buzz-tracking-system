import mongoose from "mongoose";

const institutionalActivitySchema = new mongoose.Schema(
    {
        stockName: {
            type: String,   // e.g. "Tanla Platforms"
            required: true,
            index: true,
            trim: true,
        },
        investor: {
            type: String,   // e.g. "HDFC Mutual Fund"
            required: true,
        },
        activityType: {
            type: String,
            enum: ["buy", "sell"],  // institutional action
            required: true,
        },
        quantity: {
            type: Number,   // number of shares
            required: true,
        },
        price: {
            type: Number,   // price per share
            required: true,
        },
        source: {
            type: String,   // e.g. "bse_bulk_deals"
            lowercase: true,
        },
    },
    { timestamps: true }
);

export default mongoose.model("InstitutionalActivity", institutionalActivitySchema);
