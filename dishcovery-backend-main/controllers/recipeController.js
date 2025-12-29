// controllers/recipeController.js
// ✅ Fixed with correct import paths

import { Recipe, User } from "../models/index.js";
import { uploadToCloudinary } from "../config/cloudinary.js";

// ============================================
// Helper: Parse JSON fields from form-data
// ============================================
const parseJSONField = (field) => {
  if (!field) return null;
  if (Array.isArray(field)) return field;
  try {
    return JSON.parse(field);
  } catch {
    return field;
  }
};

// ============================================
// GET /api/recipes - Get all recipes with filters
// ============================================
export const getAllRecipes = async (req, res) => {
  try {
    const { 
      q,              // Search query
      category,       // Filter by category
      minRating,      // Minimum rating
      maxCookingTime, // Maximum cooking time
      page = 1,       // Page number
      limit = 20      // Items per page
    } = req.query;

    // Build query conditions
    const where = {};
    
    if (category) {
      where.category = category;
    }
    
    if (minRating) {
      where.rating = { $gte: parseFloat(minRating) };
    }
    
    if (maxCookingTime) {
      where.cookingTime = { $lte: parseInt(maxCookingTime) };
    }
    
    // Search in name or description
    if (q) {
      where.$or = [
        { name: { $iLike: `%${q}%` } },
        { description: { $iLike: `%${q}%` } }
      ];
    }

    // Calculate pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Fetch recipes with user information
    const recipes = await Recipe.findAll({
      where,
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'firstName', 'lastName', 'email']
      }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: offset
    });

    // Get total count for pagination
    const totalRecipes = await Recipe.count({ where });
    const totalPages = Math.ceil(totalRecipes / parseInt(limit));

    // Format response
    const formattedRecipes = recipes.map(recipe => {
      const recipeData = recipe.toJSON();
      return {
        id: recipeData.id,
        name: recipeData.name,
        category: recipeData.category,
        cookingTime: recipeData.cookingTime,
        prepTime: recipeData.prepTime,
        rating: recipeData.rating,
        description: recipeData.description,
        image: recipeData.image,
        ingredients: recipeData.ingredients,
        instructions: recipeData.instructions,
        createdAt: recipeData.createdAt,
        updatedAt: recipeData.updatedAt,
        userId: recipeData.userId,
        authorName: recipeData.user 
          ? `${recipeData.user.firstName} ${recipeData.user.lastName}`
          : 'Unknown'
      };
    });

    res.json({
      recipes: formattedRecipes,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalRecipes,
        limit: parseInt(limit),
      }
    });

  } catch (error) {
    console.error('Get recipes error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch recipes',
      details: error.message 
    });
  }
};

// ============================================
// GET /api/recipes/:id - Get recipe by ID
// ============================================
export const getRecipeById = async (req, res) => {
  try {
    const { id } = req.params;

    const recipe = await Recipe.findByPk(id, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'firstName', 'lastName', 'email', 'createdAt']
      }]
    });

    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found' });
    }

    const recipeData = recipe.toJSON();
    
    // Format response
    const formattedRecipe = {
      id: recipeData.id,
      name: recipeData.name,
      category: recipeData.category,
      cookingTime: recipeData.cookingTime,
      prepTime: recipeData.prepTime,
      rating: recipeData.rating,
      description: recipeData.description,
      image: recipeData.image,
      ingredients: recipeData.ingredients,
      instructions: recipeData.instructions,
      createdAt: recipeData.createdAt,
      updatedAt: recipeData.updatedAt,
      userId: recipeData.userId,
      authorName: recipeData.user 
        ? `${recipeData.user.firstName} ${recipeData.user.lastName}`
        : 'Unknown',
      authorJoinedAt: recipeData.user?.createdAt
    };

    res.json(formattedRecipe);

  } catch (error) {
    console.error('Get recipe error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch recipe',
      details: error.message 
    });
  }
};

// ============================================
// POST /api/recipes - Create new recipe
// ============================================
export const createRecipe = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get form data
    const {
      name,
      category = 'Nigerian',
      cookingTime = 30,
      prepTime = 10,
      rating = 0,
      description = '',
    } = req.body;

    // Parse ingredients and instructions (already parsed by middleware)
    let ingredients = req.body.ingredients;
    let instructions = req.body.instructions;

    // Fallback parsing if middleware didn't handle it
    if (typeof ingredients === 'string') {
      ingredients = parseJSONField(ingredients);
    }
    if (typeof instructions === 'string') {
      instructions = parseJSONField(instructions);
    }

    // Validate required fields
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Recipe name is required' });
    }

    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return res.status(400).json({ 
        error: 'At least one ingredient is required',
        received: ingredients
      });
    }

    if (!instructions || !Array.isArray(instructions) || instructions.length === 0) {
      return res.status(400).json({ 
        error: 'At least one instruction is required',
        received: instructions
      });
    }

    // Default image URL
    let imageUrl = 'https://res.cloudinary.com/dguseowoa/image/upload/v1762823979/amala_and_gbegiri_lkovb8.jpg';
    
    // Upload image to Cloudinary if provided
    if (req.file) {
      try {
        imageUrl = await uploadToCloudinary(req.file.buffer, 'recipe-images');
        console.log('✅ Image uploaded to Cloudinary:', imageUrl);
      } catch (uploadError) {
        console.error('❌ Image upload failed:', uploadError);
        // Continue with default image
      }
    }

    // Create recipe in database
    const recipe = await Recipe.create({
      name: name.trim(),
      category,
      cookingTime: parseInt(cookingTime),
      prepTime: parseInt(prepTime),
      rating: parseFloat(rating),
      description: description.trim(),
      ingredients,
      instructions,
      image: imageUrl,
      userId
    });

    console.log(`✅ Recipe created: ${recipe.name} (ID: ${recipe.id})`);

    res.status(201).json({
      message: 'Recipe created successfully',
      recipe: {
        id: recipe.id,
        name: recipe.name,
        category: recipe.category,
        cookingTime: recipe.cookingTime,
        prepTime: recipe.prepTime,
        rating: recipe.rating,
        description: recipe.description,
        image: recipe.image,
        ingredients: recipe.ingredients,
        instructions: recipe.instructions,
        createdAt: recipe.createdAt,
        userId: recipe.userId
      }
    });

  } catch (error) {
    console.error('Create recipe error:', error);
    res.status(500).json({ 
      error: 'Failed to create recipe',
      details: error.message 
    });
  }
};

// ============================================
// PUT /api/recipes/:id - Update recipe
// ============================================
export const updateRecipe = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Find recipe
    const recipe = await Recipe.findByPk(id);

    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found' });
    }

    // Check ownership
    if (recipe.userId !== userId) {
      return res.status(403).json({ 
        error: 'Not authorized to update this recipe',
        message: 'You can only update your own recipes'
      });
    }

    // Prepare updates
    const updates = {};
    const allowedFields = [
      'name', 'category', 'cookingTime', 'prepTime', 
      'rating', 'description', 'ingredients', 'instructions'
    ];

    // Process each field
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        if (field === 'ingredients' || field === 'instructions') {
          // Already parsed by middleware, but fallback just in case
          updates[field] = typeof req.body[field] === 'string' 
            ? parseJSONField(req.body[field])
            : req.body[field];
        } else if (field === 'cookingTime' || field === 'prepTime') {
          updates[field] = parseInt(req.body[field]);
        } else if (field === 'rating') {
          updates[field] = parseFloat(req.body[field]);
        } else {
          updates[field] = req.body[field];
        }
      }
    });

    // Handle image update
    if (req.file) {
      try {
        const imageUrl = await uploadToCloudinary(req.file.buffer, 'recipe-images');
        updates.image = imageUrl;
        console.log('✅ New image uploaded:', imageUrl);
      } catch (uploadError) {
        console.error('❌ Image upload failed:', uploadError);
        // Don't fail the entire update if image upload fails
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    // Update recipe
    await recipe.update(updates);

    console.log(`✅ Recipe ${id} updated`);

    res.json({
      message: 'Recipe updated successfully',
      recipe: {
        id: recipe.id,
        name: recipe.name,
        category: recipe.category,
        cookingTime: recipe.cookingTime,
        prepTime: recipe.prepTime,
        rating: recipe.rating,
        description: recipe.description,
        image: recipe.image,
        ingredients: recipe.ingredients,
        instructions: recipe.instructions,
        createdAt: recipe.createdAt,
        updatedAt: recipe.updatedAt,
        userId: recipe.userId
      }
    });

  } catch (error) {
    console.error('Update recipe error:', error);
    res.status(500).json({ 
      error: 'Failed to update recipe',
      details: error.message 
    });
  }
};

// ============================================
// DELETE /api/recipes/:id - Delete recipe
// ============================================
export const deleteRecipe = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Find recipe
    const recipe = await Recipe.findByPk(id);

    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found' });
    }

    // Check ownership
    if (recipe.userId !== userId) {
      return res.status(403).json({ 
        error: 'Not authorized to delete this recipe',
        message: 'You can only delete your own recipes'
      });
    }

    // Delete recipe (cascade will handle favorites)
    await recipe.destroy();

    console.log(`✅ Recipe ${id} deleted`);

    res.json({ message: 'Recipe deleted successfully' });

  } catch (error) {
    console.error('Delete recipe error:', error);
    res.status(500).json({ 
      error: 'Failed to delete recipe',
      details: error.message 
    });
  }
};

// ============================================
// GET /api/recipes/user/:userId - Get user's recipes
// ============================================
export const getUserRecipes = async (req, res) => {
  try {
    const { userId } = req.params;

    const recipes = await Recipe.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
      attributes: [
        'id', 'name', 'category', 'cookingTime', 
        'prepTime', 'rating', 'description', 'image', 'createdAt'
      ]
    });

    res.json(recipes);

  } catch (error) {
    console.error('Get user recipes error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch user recipes',
      details: error.message 
    });
  }
};