import { User, Recipe } from '../models/index.js';

//  Get logged-in user's profile
export const getProfile = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    res.json({
      id: user.id,
      name: user.name,
      email: user.email
    });
  } catch (err) {
    next(err);
  }
};

// Get all recipes created by a specific user
export const getUserRecipes = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const recipes = await Recipe.findAll({ where: { userId } });
    res.json(recipes);
  } catch (err) {
    next(err);
  }
};
