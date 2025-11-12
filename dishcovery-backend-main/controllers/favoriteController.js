// /controllers/favoriteController.js
import { Favorite, Recipe } from "../models/index.js";

// Toggle favorite: if exists -> remove, else add
export const toggleFavorite = async (req, res) => {
  try {
    const userId = req.user.id;
    const recipeId = parseInt(req.params.id, 10);

    const existing = await Favorite.findOne({ where: { userId, recipeId } });
    if (existing) {
      await existing.destroy();
      return res.json({ message: "Removed from favorites" });
    }

    await Favorite.create({ userId, recipeId });
    return res.json({ message: "Added to favorites" });
  } catch (err) {
    console.error("toggleFavorite error:", err);
    return res.status(500).json({ error: err.message });
  }
};

// Get user's favorite recipes (full recipe objects)
export const getUserFavorites = async (req, res) => {
  try {
    const userId = req.user.id;

    const favs = await Favorite.findAll({ where: { userId }, attributes: ["recipeId"] });
    const recipeIds = favs.map(f => f.recipeId);

    const recipes = await Recipe.findAll({ where: { id: recipeIds } });
    return res.json(recipes);
  } catch (err) {
    console.error("getUserFavorites error:", err);
    return res.status(500).json({ error: err.message });
  }
};
