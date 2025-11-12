// /routes/userRoutes.js
import express from "express";
import { listUsers, makeAdmin, deleteUser } from "../controllers/userController.js";
import { auth } from "../middleware/authMiddleware.js";
import { admin } from "../middleware/adminMiddleware.js";

const router = express.Router();

// Admin-only user management
router.get("/", auth, admin, listUsers);
router.put("/:id/make-admin", auth, admin, makeAdmin);
router.delete("/:id", auth, admin, deleteUser);

export default router;
