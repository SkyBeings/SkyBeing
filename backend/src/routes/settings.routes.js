import { Router } from "express";
import { getMaintenanceStatus, updateMaintenanceSettings } from "../controllers/settings.controller.js";
import { verifyJWT, verifyAdmin } from "../middlewares/auth.middleware.js";

const router = Router();

// Publicly accessible to check the site's status
router.route("/maintenance").get(getMaintenanceStatus);

// Admin-only route to flip the switch
router.route("/maintenance").put(verifyJWT, verifyAdmin, updateMaintenanceSettings);

export default router;
