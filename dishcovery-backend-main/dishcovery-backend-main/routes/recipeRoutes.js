import express from "express";
import multer from "multer";
import { createRecipe, getAllRecipes, getRecipeById } from "../controllers/recipeController.js";
import { auth } from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ Multer **memory storage** for Render + Cloudinary
const upload = multer({
  storage: multer.memoryStorage(),
});

// ✅ Public routes
router.get("/", getAllRecipes);
router.get("/:id", getRecipeById);

// ✅ Protected route — create recipe
router.post("/", auth, upload.single("image"), createRecipe);

export default router;
