import express from "express";
import { addMention, getTrendingStocks } from "../controllers/mentionController.js";

const router = express.Router();

router.post("/", addMention);         // Add a mention
router.get("/trending", getTrendingStocks);  // Get trending stocks

export default router;
