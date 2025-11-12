// /controllers/recipeController.js
import { Recipe } from "../models/index.js";
import cloudinary from "../utils/cloudinary.js";

// helper: upload buffer to cloudinary (already used in your project)
const uploadToCloudinary = (fileBuffer) =>
  new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream({ folder: "recipes" }, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
    uploadStream.end(fileBuffer);
  });

// CREATE
export const createRecipe = async (req, res) => {
  try {
    const { name, category, cookingTime, prepTime, rating, description, ingredients, instructions } = req.body;

    if (!name || !cookingTime || !prepTime || !ingredients || !instructions) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    if (!req.file) return res.status(400).json({ error: "Image file is required" });

    // parse arrays
    let parsedIngredients = typeof ingredients === "string" ? JSON.parse(ingredients) : ingredients;
    let parsedInstructions = typeof instructions === "string" ? JSON.parse(instructions) : instructions;

    // upload
    const uploadResult = await uploadToCloudinary(req.file.buffer);
    const imageUrl = uploadResult.secure_url;

    const recipe = await Recipe.create({
      name,
      category: category || "Nigerian",
      cookingTime: parseInt(cookingTime, 10),
      prepTime: parseInt(prepTime, 10),
      rating: rating ? parseFloat(rating) : 0,
      description: description || "",
      ingredients: parsedIngredients,
      instructions: parsedInstructions,
      image: imageUrl,
      userId: req.user.id,
    });

    return res.status(201).json({ message: "Recipe created successfully", recipe });
  } catch (err) {
    console.error("createRecipe error:", err);
    return res.status(500).json({ error: err.message });
  }
};

// GET ALL (with optional filters: q, category, minRating, maxTime, page, limit)
export const getAllRecipes = async (req, res) => {
  try {
    const { q, category, minRating, maxCookingTime, page = 1, limit = 20 } = req.query;

    const where = {};
    // simple filtering using Sequelize operators
    import('sequelize').then(({ Op }) => {
      // used inside Promise below
    });

    // We'll build a raw where: simpler using Sequelize.literal? Let's use basic approach:
    // Since we can't dynamically import Op at top for ESM in some setups, use this:
    const { Op } = await import("sequelize");

    if (q) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${q}%` } },
        { description: { [Op.iLike]: `%${q}%` } },
      ];
    }
    if (category) where.category = category;
    if (minRating) where.rating = { [Op.gte]: parseFloat(minRating) };
    if (maxCookingTime) where.cookingTime = { [Op.lte]: parseInt(maxCookingTime, 10) };

    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    const recipes = await Recipe.findAll({
      where,
      order: [["createdAt", "DESC"]],
      offset,
      limit: parseInt(limit, 10),
    });

    return res.json(recipes);
  } catch (err) {
    console.error("getAllRecipes error:", err);
    return res.status(500).json({ error: err.message });
  }
};

// GET BY ID
export const getRecipeById = async (req, res) => {
  try {
    const recipe = await Recipe.findByPk(req.params.id);
    if (!recipe) return res.status(404).json({ error: "Recipe not found" });
    return res.json(recipe);
  } catch (err) {
    console.error("getRecipeById error:", err);
    return res.status(500).json({ error: err.message });
  }
};

// UPDATE recipe (owner or admin)
export const updateRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findByPk(req.params.id);
    if (!recipe) return res.status(404).json({ error: "Recipe not found" });

    // owner or admin?
    if (req.user.role !== "admin" && recipe.userId !== req.user.id) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const { name, category, cookingTime, prepTime, rating, description, ingredients, instructions } = req.body;

    // if image provided, upload new
    if (req.file) {
      const uploadResult = await uploadToCloudinary(req.file.buffer);
      recipe.image = uploadResult.secure_url;
    }

    if (name) recipe.name = name;
    if (category) recipe.category = category;
    if (cookingTime) recipe.cookingTime = parseInt(cookingTime, 10);
    if (prepTime) recipe.prepTime = parseInt(prepTime, 10);
    if (rating) recipe.rating = parseFloat(rating);
    if (description !== undefined) recipe.description = description;
    if (ingredients) recipe.ingredients = typeof ingredients === "string" ? JSON.parse(ingredients) : ingredients;
    if (instructions) recipe.instructions = typeof instructions === "string" ? JSON.parse(instructions) : instructions;

    await recipe.save();
    return res.json({ message: "Recipe updated", recipe });
  } catch (err) {
    console.error("updateRecipe error:", err);
    return res.status(500).json({ error: err.message });
  }
};

// DELETE recipe (owner or admin)
export const deleteRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findByPk(req.params.id);
    if (!recipe) return res.status(404).json({ error: "Recipe not found" });

    if (req.user.role !== "admin" && recipe.userId !== req.user.id) {
      return res.status(403).json({ error: "Forbidden" });
    }

    await recipe.destroy();
    return res.json({ message: "Recipe deleted" });
  } catch (err) {
    console.error("deleteRecipe error:", err);
    return res.status(500).json({ error: err.message });
  }
};
