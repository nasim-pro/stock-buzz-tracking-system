import mongoose from "mongoose";

const mentionSchema = new mongoose.Schema(
    {
        stockId: { type: String, required: true },
        stockName: { type: String, required: true },
        ticker: { type: String, required: false },
        source: { type: String, required: true },
        url: { type: String, required: false },
        mentionText: { type: String, required: false },
        sentimentScore: { type: String, required: false },
        publishedAt: { type: Date, required: false },
    },
    { timestamps: true } // adds createdAt, updatedAt automatically
);



export default mongoose.model("Mention", mentionSchema);
