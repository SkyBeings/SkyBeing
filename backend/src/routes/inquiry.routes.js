import { Router } from "express";
import { 
    createInquiry, 
    getAllInquiries, 
    markAsRead, 
    deleteInquiry 
} from "../controllers/inquiry.controller.js";
import { verifyJWT, verifyAdmin } from "../middlewares/auth.middleware.js";

const router = Router();

// Public route to send an inquiry
router.route("/").post(createInquiry);

// Secured admin routes
router.route("/").get(verifyJWT, verifyAdmin, getAllInquiries);
router.route("/:id/read").patch(verifyJWT, verifyAdmin, markAsRead);
router.route("/:id").delete(verifyJWT, verifyAdmin, deleteInquiry);

export default router;
