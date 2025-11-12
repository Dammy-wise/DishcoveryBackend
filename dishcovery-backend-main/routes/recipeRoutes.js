// /routes/recipeRoutes.js
import express from "express";
import multer from "multer";
import {
  createRecipe,
  getAllRecipes,
  getRecipeById,
  updateRecipe,
  deleteRecipe
} from "../controllers/recipeController.js";
import { auth } from "../middleware/authMiddleware.js";

const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

// Public: list with optional filters via query params
router.get("/", getAllRecipes);
router.get("/:id", getRecipeById);

// Protected: create/update/delete
router.post("/", auth, upload.single("image"), createRecipe);
router.put("/:id", auth, upload.single("image"), updateRecipe);
router.delete("/:id", auth, deleteRecipe);

export default router;
