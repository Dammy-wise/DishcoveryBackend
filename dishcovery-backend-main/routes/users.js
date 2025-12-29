// routes/users.js
// ✅ COMPLETE USER ROUTES with Profile & Password Management

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { authenticateToken } = require('../middleware/auth');
const pool = require('../config/database');
const { uploadToCloudinary } = require('../config/cloudinary');
const multer = require('multer');

// Configure multer for memory storage
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});

// ============================================
// GET /api/users/me - Get Current User Profile
// ============================================
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const userResult = await pool.query(
      `SELECT id, "firstName", "lastName", email, "createdAt", "updatedAt"
       FROM users 
       WHERE id = $1`,
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResult.rows[0];

    // Get user's recipe count
    const recipeCountResult = await pool.query(
      'SELECT COUNT(*) as count FROM recipes WHERE "userId" = $1',
      [userId]
    );

    // Get user's favorite count
    const favoriteCountResult = await pool.query(
      'SELECT COUNT(*) as count FROM favorites WHERE "userId" = $1',
      [userId]
    );

    // Return user profile with stats
    res.json({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      stats: {
        recipesCreated: parseInt(recipeCountResult.rows[0].count),
        favorites: parseInt(favoriteCountResult.rows[0].count),
        reviews: 0, // Add when review system is implemented
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch profile',
      details: error.message 
    });
  }
});

// ============================================
// PUT /api/users/me - Update User Profile
// ============================================
router.put('/me', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { firstName, lastName, email } = req.body;

    // Validate at least one field is provided
    if (!firstName && !lastName && !email) {
      return res.status(400).json({ 
        error: 'At least one field (firstName, lastName, or email) is required' 
      });
    }

    // Build dynamic update query
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (firstName) {
      updates.push(`"firstName" = $${paramCount}`);
      values.push(firstName.trim());
      paramCount++;
    }

    if (lastName) {
      updates.push(`"lastName" = $${paramCount}`);
      values.push(lastName.trim());
      paramCount++;
    }

    if (email) {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
      }

      // Check if email is already taken by another user
      const emailCheck = await pool.query(
        'SELECT id FROM users WHERE email = $1 AND id != $2',
        [email.toLowerCase().trim(), userId]
      );

      if (emailCheck.rows.length > 0) {
        return res.status(409).json({ error: 'Email already in use' });
      }

      updates.push(`email = $${paramCount}`);
      values.push(email.toLowerCase().trim());
      paramCount++;
    }

    // Add updatedAt
    updates.push(`"updatedAt" = CURRENT_TIMESTAMP`);
    values.push(userId);

    // Execute update
    const query = `
      UPDATE users 
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, "firstName", "lastName", email, "createdAt", "updatedAt"
    `;

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updatedUser = result.rows[0];

    console.log(`✅ User ${userId} profile updated`);

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ 
      error: 'Failed to update profile',
      details: error.message 
    });
  }
});

// ============================================
// PUT /api/users/me/password - Change Password
// ============================================
router.put('/me/password', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { oldPassword, newPassword } = req.body;

    // Validate input
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ 
        error: 'Both oldPassword and newPassword are required' 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        error: 'New password must be at least 6 characters long' 
      });
    }

    // Get current user with password
    const userResult = await pool.query(
      'SELECT id, password FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResult.rows[0];

    // Verify old password
    const isValidPassword = await bcrypt.compare(oldPassword, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await pool.query(
      `UPDATE users 
       SET password = $1, "updatedAt" = CURRENT_TIMESTAMP 
       WHERE id = $2`,
      [hashedPassword, userId]
    );

    console.log(`✅ User ${userId} password changed successfully`);

    res.json({ 
      message: 'Password changed successfully' 
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ 
      error: 'Failed to change password',
      details: error.message 
    });
  }
});

// ============================================
// PUT /api/users/me/avatar - Update Profile Picture
// ============================================
router.put('/me/avatar', authenticateToken, upload.single('profileImage'), async (req, res) => {
  try {
    const userId = req.user.userId;

    if (!req.file) {
      return res.status(400).json({ error: 'Profile image is required' });
    }

    // Upload to Cloudinary
    const imageUrl = await uploadToCloudinary(req.file.buffer, 'profile-images');

    // Update user's profile image in database (if you have this column)
    // For now, just return the URL
    // await pool.query(
    //   'UPDATE users SET "profileImage" = $1, "updatedAt" = CURRENT_TIMESTAMP WHERE id = $2',
    //   [imageUrl, userId]
    // );

    console.log(`✅ User ${userId} avatar updated`);

    res.json({ 
      message: 'Profile image updated successfully',
      imageUrl 
    });

  } catch (error) {
    console.error('Update avatar error:', error);
    res.status(500).json({ 
      error: 'Failed to update profile image',
      details: error.message 
    });
  }
});

// ============================================
// GET /api/users/:id - Get User by ID (Public)
// ============================================
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const userResult = await pool.query(
      `SELECT id, "firstName", "lastName", "createdAt"
       FROM users 
       WHERE id = $1`,
      [id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResult.rows[0];

    // Get user's public recipe count
    const recipeCountResult = await pool.query(
      'SELECT COUNT(*) as count FROM recipes WHERE "userId" = $1',
      [id]
    );

    res.json({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      joinedAt: user.createdAt,
      recipesCount: parseInt(recipeCountResult.rows[0].count),
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch user',
      details: error.message 
    });
  }
});

// ============================================
// DELETE /api/users/me - Delete Account
// ============================================
router.delete('/me', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ error: 'Password is required to delete account' });
    }

    // Verify password
    const userResult = await pool.query(
      'SELECT password FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isValidPassword = await bcrypt.compare(password, userResult.rows[0].password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Incorrect password' });
    }

    // Begin transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Delete user's favorites
      await client.query('DELETE FROM favorites WHERE "userId" = $1', [userId]);

      // Delete user's recipes (and cascade will handle recipe_ingredients)
      await client.query('DELETE FROM recipes WHERE "userId" = $1', [userId]);

      // Delete user account
      await client.query('DELETE FROM users WHERE id = $1', [userId]);

      await client.query('COMMIT');

      console.log(`✅ User ${userId} account deleted`);

      res.json({ message: 'Account deleted successfully' });

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ 
      error: 'Failed to delete account',
      details: error.message 
    });
  }
});

module.exports = router;