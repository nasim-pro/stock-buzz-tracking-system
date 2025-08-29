import express from "express";
import { addInstitutionalActivity, getRecentInstitutional } from "../controllers/institutionalController.js";

const router = express.Router();

router.post("/", addInstitutionalActivity);    // Add institutional activity
router.get("/recent", getRecentInstitutional); // Get recent activity

export default router;
