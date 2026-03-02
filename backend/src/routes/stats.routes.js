import { Router } from "express";
import { recordVisit } from "../controllers/stats.controller.js";

const router = Router();

// Public — frontend calls this on every page load
router.post("/visit", recordVisit);

export default router;
