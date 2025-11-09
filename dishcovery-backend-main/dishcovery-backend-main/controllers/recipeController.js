import { Recipe } from "../models/index.js";
import cloudinary from "../utils/cloudinary.js";

// ✅ Helper function to upload buffer to Cloudinary
const uploadToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: "recipes" },
      (error, result) => {
        if (error) {
          console.error("❌ Cloudinary upload error:", error);
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    uploadStream.end(fileBuffer);
  });
};

// ✅ CREATE RECIPE (USER OR ADMIN)
export const createRecipe = async (req, res) => {
  try {
    console.log("✅ Incoming recipe request");

    // ✅ Log metadata
    console.log("📦 req.body:", req.body);
    console.log("📸 Multer file received:", req.file);

    // ✅ Image validation
    if (!req.file) {
      return res.status(400).json({ error: "Image file is required" });
    }

    const {
      name,
      category,
      cookingTime,
      prepTime,
      rating,
      description,
      ingredients,
      instructions
    } = req.body;

    // ✅ Validate important fields
    if (!name || !cookingTime || !prepTime || !ingredients || !instructions) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // ✅ Ensure ingredients & instructions are arrays (JSON)
    let parsedIngredients;
    let parsedInstructions;

    try {
      parsedIngredients =
        typeof ingredients === "string"
          ? JSON.parse(ingredients)
          : ingredients;

      parsedInstructions =
        typeof instructions === "string"
          ? JSON.parse(instructions)
          : instructions;
    } catch (err) {
      console.error("❌ JSON parse error:", err);
      return res
        .status(400)
        .json({ error: "Ingredients and instructions must be valid JSON arrays" });
    }

    // ✅ Upload image buffer to Cloudinary
    console.log("⬆️ Uploading image to Cloudinary...");
    const uploadResult = await uploadToCloudinary(req.file.buffer);
    const imageUrl = uploadResult.secure_url;

    // ✅ Save recipe in DB
    const recipe = await Recipe.create({
      name,
      category: category || "Nigerian",
      cookingTime,
      prepTime,
      rating: rating || 0,
      description,
      ingredients: parsedIngredients,
      instructions: parsedInstructions,
      image: imageUrl,
      userId: req.user.id
    });

    console.log("✅ Recipe created:", recipe.id);

    return res.json({
      message: "Recipe created successfully",
      recipe
    });

  } catch (error) {
    console.error("🔥 RECIPE CONTROLLER ERROR:", error);
    return res.status(500).json({ error: error.message });
  }
};

// ✅ GET ALL RECIPES (Homepage)
export const getAllRecipes = async (req, res) => {
  try {
    const recipes = await Recipe.findAll({
      order: [["createdAt", "DESC"]],
    });
    return res.json(recipes);
  } catch (error) {
    console.error("🔥 ERROR FETCHING ALL RECIPES:", error);
    return res.status(500).json({ error: error.message });
  }
};

// ✅ GET SINGLE RECIPE
export const getRecipeById = async (req, res) => {
  try {
    const recipe = await Recipe.findByPk(req.params.id);
    if (!recipe) return res.status(404).json({ error: "Recipe not found" });
    return res.json(recipe);
  } catch (error) {
    console.error("🔥 ERROR FETCHING RECIPE:", error);
    return res.status(500).json({ error: error.message });
  }
};
