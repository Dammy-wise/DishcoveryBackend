// routes/recipes.js
// ✅ UPDATED - Better multipart/form-data handling

const express = require('express');
const router = express.Router();
const multer = require('multer');
const { authenticateToken } = require('../middleware/auth');
const pool = require('../config/database');
const { uploadToCloudinary } = require('../config/cloudinary');

// Configure multer for memory storage
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
router.get('/', async (req, res) => {
  try {
    const { 
      q,           // Search query
      category,    // Filter by category
      minRating,   // Minimum rating
      maxCookingTime, // Maximum cooking time
      page = 1,    // Page number
      limit = 20   // Items per page
    } = req.query;

    let query = `
      SELECT 
        r.id, 
        r.name, 
        r.category, 
        r."cookingTime", 
        r."prepTime", 
        r.rating, 
        r.description, 
        r.image, 
        r."createdAt",
        r."userId",
        u."firstName" || ' ' || u."lastName" as "authorName"
      FROM recipes r
      LEFT JOIN users u ON r."userId" = u.id
      WHERE 1=1
    `;

    const params = [];
    let paramCount = 1;

    // Search by name or description
    if (q) {
      query += ` AND (r.name ILIKE $${paramCount} OR r.description ILIKE $${paramCount})`;
      params.push(`%${q}%`);
      paramCount++;
    }

    // Filter by category
    if (category) {
      query += ` AND r.category = $${paramCount}`;
      params.push(category);
      paramCount++;
    }

    // Filter by minimum rating
    if (minRating) {
      query += ` AND r.rating >= $${paramCount}`;
      params.push(parseFloat(minRating));
      paramCount++;
    }

    // Filter by maximum cooking time
    if (maxCookingTime) {
      query += ` AND r."cookingTime" <= $${paramCount}`;
      params.push(parseInt(maxCookingTime));
      paramCount++;
    }

    // Order by creation date (newest first)
    query += ` ORDER BY r."createdAt" DESC`;

    // Pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    query += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(parseInt(limit), offset);

    const result = await pool.query(query, params);

    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) FROM recipes r WHERE 1=1';
    const countParams = [];
    let countParamCount = 1;

    if (q) {
      countQuery += ` AND (r.name ILIKE $${countParamCount} OR r.description ILIKE $${countParamCount})`;
      countParams.push(`%${q}%`);
      countParamCount++;
    }
    if (category) {
      countQuery += ` AND r.category = $${countParamCount}`;
      countParams.push(category);
      countParamCount++;
    }
    if (minRating) {
      countQuery += ` AND r.rating >= $${countParamCount}`;
      countParams.push(parseFloat(minRating));
      countParamCount++;
    }
    if (maxCookingTime) {
      countQuery += ` AND r."cookingTime" <= $${countParamCount}`;
      countParams.push(parseInt(maxCookingTime));
      countParamCount++;
    }

    const countResult = await pool.query(countQuery, countParams);
    const totalRecipes = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalRecipes / parseInt(limit));

    res.json({
      recipes: result.rows,
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
});

// ============================================
// GET /api/recipes/:id - Get recipe by ID
// ============================================
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const recipeResult = await pool.query(
      `SELECT 
        r.id, 
        r.name, 
        r.category, 
        r."cookingTime", 
        r."prepTime", 
        r.rating, 
        r.description, 
        r.image,
        r.ingredients,
        r.instructions,
        r."createdAt",
        r."updatedAt",
        r."userId",
        u."firstName" || ' ' || u."lastName" as "authorName",
        u."createdAt" as "authorJoinedAt"
      FROM recipes r
      LEFT JOIN users u ON r."userId" = u.id
      WHERE r.id = $1`,
      [id]
    );

    if (recipeResult.rows.length === 0) {
      return res.status(404).json({ error: 'Recipe not found' });
    }

    const recipe = recipeResult.rows[0];

    res.json(recipe);

  } catch (error) {
    console.error('Get recipe error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch recipe',
      details: error.message 
    });
  }
});

// ============================================
// POST /api/recipes - Create new recipe
// ============================================
router.post('/', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    const userId = req.user.userId;

    // Parse form data
    const {
      name,
      category = 'Nigerian',
      cookingTime = '30',
      prepTime = '10',
      rating = '0',
      description = '',
    } = req.body;

    // Parse JSON fields
    const ingredients = parseJSONField(req.body.ingredients);
    const instructions = parseJSONField(req.body.instructions);

    // Validate required fields
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Recipe name is required' });
    }

    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return res.status(400).json({ error: 'At least one ingredient is required' });
    }

    if (!instructions || !Array.isArray(instructions) || instructions.length === 0) {
      return res.status(400).json({ error: 'At least one instruction is required' });
    }

    // Upload image to Cloudinary if provided
    let imageUrl = 'https://res.cloudinary.com/dguseowoa/image/upload/v1762823979/amala_and_gbegiri_lkovb8.jpg'; // Default image
    
    if (req.file) {
      try {
        imageUrl = await uploadToCloudinary(req.file.buffer, 'recipe-images');
        console.log('✅ Image uploaded to Cloudinary:', imageUrl);
      } catch (uploadError) {
        console.error('❌ Image upload failed:', uploadError);
        // Continue with default image
      }
    }

    // Insert recipe
    const recipeResult = await pool.query(
      `INSERT INTO recipes (
        name, category, "cookingTime", "prepTime", rating, description, 
        ingredients, instructions, image, "userId"
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING id, name, category, "cookingTime", "prepTime", rating, 
                description, image, ingredients, instructions, "createdAt", "userId"`,
      [
        name.trim(),
        category,
        parseInt(cookingTime),
        parseInt(prepTime),
        parseFloat(rating),
        description.trim(),
        JSON.stringify(ingredients),
        JSON.stringify(instructions),
        imageUrl,
        userId
      ]
    );

    const newRecipe = recipeResult.rows[0];

    console.log(`✅ Recipe created: ${newRecipe.name} (ID: ${newRecipe.id})`);

    res.status(201).json({
      message: 'Recipe created successfully',
      recipe: newRecipe
    });

  } catch (error) {
    console.error('Create recipe error:', error);
    res.status(500).json({ 
      error: 'Failed to create recipe',
      details: error.message 
    });
  }
});

// ============================================
// PUT /api/recipes/:id - Update recipe
// ============================================
router.put('/:id', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // Check if recipe exists and belongs to user
    const recipeCheck = await pool.query(
      'SELECT "userId", image FROM recipes WHERE id = $1',
      [id]
    );

    if (recipeCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Recipe not found' });
    }

    if (recipeCheck.rows[0].userId !== userId) {
      return res.status(403).json({ error: 'Not authorized to update this recipe' });
    }

    // Parse form data
    const updates = {};
    const allowedFields = [
      'name', 'category', 'cookingTime', 'prepTime', 
      'rating', 'description', 'ingredients', 'instructions'
    ];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        if (field === 'ingredients' || field === 'instructions') {
          updates[field] = parseJSONField(req.body[field]);
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
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    // Build update query
    const setClause = Object.keys(updates).map((key, index) => {
      const dbKey = key === 'cookingTime' || key === 'prepTime' ? `"${key}"` : key;
      return `${dbKey} = $${index + 1}`;
    }).join(', ');

    const values = Object.keys(updates).map(key => {
      if (key === 'ingredients' || key === 'instructions') {
        return JSON.stringify(updates[key]);
      }
      return updates[key];
    });
    values.push(id);

    const query = `
      UPDATE recipes 
      SET ${setClause}, "updatedAt" = CURRENT_TIMESTAMP
      WHERE id = $${values.length}
      RETURNING *
    `;

    const result = await pool.query(query, values);

    console.log(`✅ Recipe ${id} updated`);

    res.json({
      message: 'Recipe updated successfully',
      recipe: result.rows[0]
    });

  } catch (error) {
    console.error('Update recipe error:', error);
    res.status(500).json({ 
      error: 'Failed to update recipe',
      details: error.message 
    });
  }
});

// ============================================
// DELETE /api/recipes/:id - Delete recipe
// ============================================
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // Check if recipe exists and belongs to user
    const recipeCheck = await pool.query(
      'SELECT "userId" FROM recipes WHERE id = $1',
      [id]
    );

    if (recipeCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Recipe not found' });
    }

    if (recipeCheck.rows[0].userId !== userId) {
      return res.status(403).json({ error: 'Not authorized to delete this recipe' });
    }

    // Delete recipe (cascade will handle recipe_ingredients and favorites)
    await pool.query('DELETE FROM recipes WHERE id = $1', [id]);

    console.log(`✅ Recipe ${id} deleted`);

    res.json({ message: 'Recipe deleted successfully' });

  } catch (error) {
    console.error('Delete recipe error:', error);
    res.status(500).json({ 
      error: 'Failed to delete recipe',
      details: error.message 
    });
  }
});

// ============================================
// GET /api/recipes/user/:userId - Get user's recipes
// ============================================
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await pool.query(
      `SELECT 
        r.id, 
        r.name, 
        r.category, 
        r."cookingTime", 
        r."prepTime", 
        r.rating, 
        r.description, 
        r.image,
        r."createdAt"
      FROM recipes r
      WHERE r."userId" = $1
      ORDER BY r."createdAt" DESC`,
      [userId]
    );

    res.json(result.rows);

  } catch (error) {
    console.error('Get user recipes error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch user recipes',
      details: error.message 
    });
  }
});

module.exports = router;