import { Router } from "express";
import { verifyJWT, verifyAdmin } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

import {
    getAdminDashboard,
    getAdminUsers,
    getAdminUserById,
    toggleBlockUser,
    changeUserRole,
    deleteAdminUser,
    adminGetProducts,
    adminCreateProduct,
    adminUpdateProduct,
    adminDeleteProduct,
    adminGetOrders,
    adminGetOrderById,
    adminUpdateOrderStatus,
    markOrderAsSelfShipped,
    verifySecurityPassword
} from "../controllers/admin.controller.js";
import { getSiteStats } from "../controllers/stats.controller.js";

const router = Router();

// Shield all admin routes
router.use(verifyJWT, verifyAdmin);

router.route("/verify-security").post(verifySecurityPassword);

// =======================
// DASHBOARD & ANALYTICS
// =======================
router.route("/dashboard").get(getAdminDashboard);
router.route("/site-stats").get(getSiteStats);

// =======================
// USER MANAGEMENT
// =======================
router.route("/users").get(getAdminUsers);
router.route("/users/:id").get(getAdminUserById);
router.route("/users/:id").delete(deleteAdminUser);
router.route("/users/:id/block").put(toggleBlockUser);
router.route("/users/:id/role").put(changeUserRole);

// =======================
// PRODUCT MANAGEMENT
// =======================
router.route("/products").get(adminGetProducts);
router.route("/products").post(upload.array("images", 5), adminCreateProduct);
router.route("/products/:id").put(adminUpdateProduct);
router.route("/products/:id").delete(adminDeleteProduct);

// =======================
// ORDER MANAGEMENT
// =======================
router.route("/orders").get(adminGetOrders);
router.route("/orders/:id").get(adminGetOrderById);
router.route("/orders/:id/status").put(adminUpdateOrderStatus);
router.route("/orders/:id/self-ship").put(markOrderAsSelfShipped);

export default router;
