import express from "express";
import {
    createStock,
    getStocks,
    getStockById,
    updateStock,
    deleteStock,
} from "../controllers/stockController.js";

const router = express.Router();

// CRUD routes
router.post("/", createStock);
router.get("/", getStocks);
router.get("/:id", getStockById);
router.put("/:id", updateStock);
router.delete("/:id", deleteStock);

export default router;
