// routes/recipeRoutes.js
// ✅ UPDATED - ES6 modules with enhanced multipart/form-data handling

import express from "express";
import multer from "multer";
import {
  createRecipe,
  getAllRecipes,
  getRecipeById,
  updateRecipe,
  deleteRecipe,
  getUserRecipes
} from "../controllers/recipeController.js";
import { auth } from "../middleware/authMiddleware.js";

const router = express.Router();

// ============================================
// Configure multer for memory storage with validation
// ============================================
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept images only
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// ============================================
// Middleware: Parse JSON fields from multipart/form-data
// ============================================
const parseMultipartJSON = (req, res, next) => {
  // Parse ingredients if it's a JSON string
  if (req.body.ingredients && typeof req.body.ingredients === 'string') {
    try {
      req.body.ingredients = JSON.parse(req.body.ingredients);
    } catch (error) {
      console.error('Failed to parse ingredients:', error);
      return res.status(400).json({ 
        error: 'Invalid ingredients format',
        message: 'Ingredients must be a valid JSON array'
      });
    }
  }

  // Parse instructions if it's a JSON string
  if (req.body.instructions && typeof req.body.instructions === 'string') {
    try {
      req.body.instructions = JSON.parse(req.body.instructions);
    } catch (error) {
      console.error('Failed to parse instructions:', error);
      return res.status(400).json({ 
        error: 'Invalid instructions format',
        message: 'Instructions must be a valid JSON array'
      });
    }
  }

  // Convert numeric fields
  if (req.body.cookingTime) {
    req.body.cookingTime = parseInt(req.body.cookingTime);
  }
  if (req.body.prepTime) {
    req.body.prepTime = parseInt(req.body.prepTime);
  }
  if (req.body.rating) {
    req.body.rating = parseFloat(req.body.rating);
  }

  next();
};

// ============================================
// Public Routes
// ============================================

/**
 * GET /api/recipes
 * Get all recipes with optional filters
 * Query params: q, category, minRating, maxCookingTime, page, limit
 */
router.get("/", getAllRecipes);

/**
 * GET /api/recipes/:id
 * Get single recipe by ID
 */
router.get("/:id", getRecipeById);

/**
 * GET /api/recipes/user/:userId
 * Get all recipes by a specific user
 */
router.get("/user/:userId", getUserRecipes);

// ============================================
// Protected Routes (require authentication)
// ============================================

/**
 * POST /api/recipes
 * Create new recipe (with optional image upload)
 * Requires: auth token
 * Form data:
 * - name (string, required)
 * - category (string, default: 'Nigerian')
 * - cookingTime (number, default: 30)
 * - prepTime (number, default: 10)
 * - rating (number, default: 0)
 * - description (string)
 * - ingredients (JSON array, required)
 * - instructions (JSON array, required)
 * - image (file, optional)
 */
router.post(
  "/", 
  auth, 
  upload.single("image"), 
  parseMultipartJSON,
  createRecipe
);

/**
 * PUT /api/recipes/:id
 * Update existing recipe (with optional image upload)
 * Requires: auth token, must be recipe owner
 * Form data: same as POST, all fields optional
 */
router.put(
  "/:id", 
  auth, 
  upload.single("image"), 
  parseMultipartJSON,
  updateRecipe
);

/**
 * DELETE /api/recipes/:id
 * Delete recipe
 * Requires: auth token, must be recipe owner
 */
router.delete("/:id", auth, deleteRecipe);

// ============================================
// Error handling for multer
// ============================================
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        error: 'File too large',
        message: 'Maximum file size is 5MB'
      });
    }
    return res.status(400).json({ 
      error: 'File upload error',
      message: error.message
    });
  }
  
  if (error.message === 'Only image files are allowed!') {
    return res.status(400).json({ 
      error: 'Invalid file type',
      message: 'Only image files (JPEG, PNG, WebP, etc.) are allowed'
    });
  }
  
  next(error);
});

export default router;