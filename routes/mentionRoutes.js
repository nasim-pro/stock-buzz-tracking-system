import express from "express";
import { addMention, getTrendingStocks, leastRanking } from "../controllers/mentionController.js";

const router = express.Router();

router.post("/", addMention);         // Add a mention
router.get("/top-trending", getTrendingStocks);  // Get trending stocks
router.get("/bottom-trending", leastRanking);   // Get least trending stocks

export default router;
