// /routes/favoriteRoutes.js
import express from "express";
import { toggleFavorite, getUserFavorites } from "../controllers/favoriteController.js";
import { auth } from "../middleware/authMiddleware.js";

const router = express.Router();

// Toggle favorite for recipe id
router.post("/:id/toggle", auth, toggleFavorite);

// Get user's favorites
router.get("/", auth, getUserFavorites);

export default router;
