// controllers/userController.js
// ✅ Fixed with correct import paths

import bcrypt from "bcryptjs";
import { User, Recipe, Favorite } from "../models/index.js";
import { uploadToCloudinary } from "../config/cloudinary.js";

// ============================================
// GET /api/users/me - Get current user profile
// ============================================
export const getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find user
    const user = await User.findByPk(userId, {
      attributes: ['id', 'firstName', 'lastName', 'email', 'createdAt', 'updatedAt']
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get user's recipe count
    const recipesCreated = await Recipe.count({ 
      where: { userId } 
    });

    // Get user's favorite count
    const favorites = await Favorite.count({ 
      where: { userId } 
    });

    // Return user profile with stats
    res.json({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      stats: {
        recipesCreated,
        favorites,
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
};

// ============================================
// PUT /api/users/me - Update user profile
// ============================================
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { firstName, lastName, email } = req.body;

    // Validate at least one field is provided
    if (!firstName && !lastName && !email) {
      return res.status(400).json({ 
        error: 'At least one field (firstName, lastName, or email) is required' 
      });
    }

    // Find user
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prepare updates
    const updates = {};

    if (firstName) {
      updates.firstName = firstName.trim();
    }

    if (lastName) {
      updates.lastName = lastName.trim();
    }

    if (email) {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
      }

      // Check if email is already taken by another user
      const existingUser = await User.findOne({
        where: { 
          email: email.toLowerCase().trim() 
        }
      });

      if (existingUser && existingUser.id !== userId) {
        return res.status(409).json({ error: 'Email already in use' });
      }

      updates.email = email.toLowerCase().trim();
    }

    // Update user
    await user.update(updates);

    console.log(`✅ User ${userId} profile updated`);

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ 
      error: 'Failed to update profile',
      details: error.message 
    });
  }
};

// ============================================
// PUT /api/users/me/password - Change password
// ============================================
export const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
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

    // Find user with password
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify old password
    const isValidPassword = await bcrypt.compare(oldPassword, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await user.update({ password: hashedPassword });

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
};

// ============================================
// PUT /api/users/me/avatar - Update profile picture
// ============================================
export const updateAvatar = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!req.file) {
      return res.status(400).json({ error: 'Profile image is required' });
    }

    // Upload to Cloudinary
    const imageUrl = await uploadToCloudinary(req.file.buffer, 'profile-images');

    // Note: If you add a profileImage column to User model, update it here
    // await user.update({ profileImage: imageUrl });

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
};

// ============================================
// DELETE /api/users/me - Delete account
// ============================================
export const deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ error: 'Password is required to delete account' });
    }

    // Find user
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Incorrect password' });
    }

    // Delete user's recipes
    await Recipe.destroy({ where: { userId } });

    // Delete user's favorites
    await Favorite.destroy({ where: { userId } });

    // Delete user account
    await user.destroy();

    console.log(`✅ User ${userId} account deleted`);

    res.json({ message: 'Account deleted successfully' });

  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ 
      error: 'Failed to delete account',
      details: error.message 
    });
  }
};

// ============================================
// GET /api/users/:id - Get user by ID (Public)
// ============================================
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    // Find user (exclude password and sensitive info)
    const user = await User.findByPk(id, {
      attributes: ['id', 'firstName', 'lastName', 'createdAt']
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get user's public recipe count
    const recipesCount = await Recipe.count({ 
      where: { userId: id } 
    });

    res.json({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      joinedAt: user.createdAt,
      recipesCount,
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch user',
      details: error.message 
    });
  }
};