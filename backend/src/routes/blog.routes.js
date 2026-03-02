import { Router } from "express";
import {
    getPublishedBlogs, getBlogBySlug,
    getAllBlogs, createBlog, updateBlog, deleteBlog
} from "../controllers/blog.controller.js";
import { verifyJWT, verifyAdmin } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

// Public
router.get("/",        getPublishedBlogs);
router.get("/:slug",   getBlogBySlug);

// Admin
router.use(verifyJWT, verifyAdmin);
router.get("/admin/all",        getAllBlogs);
router.post("/",       upload.single("coverImage"), createBlog);
router.put("/:id",     upload.single("coverImage"), updateBlog);
router.delete("/:id",  deleteBlog);

export default router;
