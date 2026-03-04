import { Router } from "express";
import {
    createShipment,
    trackShipment,
    cancelShipment,
    pingShiprocket,
} from "../controllers/shiprocket.controller.js";

const router = Router();

// Test credentials
router.get("/ping", pingShiprocket);

// Create shipment for an order (Admin use)
router.post("/create/:orderId", createShipment);

// Track shipment by MongoDB order ID
router.get("/track/:orderId", trackShipment);

// Cancel shipment (Admin use)
router.post("/cancel/:orderId", cancelShipment);

export default router;
