import mongoose from "mongoose";

const mentionSchema = new mongoose.Schema(
    {
        stockId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Stock",
            required: true,
            index: true,
        },
        stockName: {
            type: String,   // e.g. "Tanla Platforms", "Control Print"
            required: true,
            trim: true,
        },
        source: {
            type: String,   // e.g. "moneycontrol", "twitter", "reddit"
            required: true,
            lowercase: true,
        },
        url: {
            type: String,   // link to article/post
        },
        mentionText: {
            type: String,   // snippet/headline
            required: true,
        },
        sentimentScore: {
            type: Number,   // -1 (negative), 0 (neutral), +1 (positive)
            default: 0,
            min: -1,
            max: 1,
        },
        publishedAt: {
            type: Date,     // when article was published (optional)
        },
    },
    { timestamps: true } // adds createdAt, updatedAt automatically
);

// Prevent duplicates: same stock + same text + same source + same url
mentionSchema.index(
    { stockId: 1, mentionText: 1, source: 1, url: 1 },
    { unique: true }
);

export default mongoose.model("Mention", mentionSchema);
