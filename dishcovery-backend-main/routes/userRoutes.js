// routes/userRoutes.js
// ✅ Complete user management routes with ES6 modules

import express from "express";
import multer from "multer";
import {
  getCurrentUser,
  updateProfile,
  changePassword,
  updateAvatar,
  deleteAccount,
  getUserById
} from "../controllers/userController.js";
import { auth } from "../middleware/authMiddleware.js";

const router = express.Router();

// ============================================
// Configure multer for avatar uploads
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
// Protected Routes (require authentication)
// ============================================

/**
 * GET /api/users/me
 * Get current user profile with stats
 * Requires: auth token
 */
router.get("/me", auth, getCurrentUser);

/**
 * PUT /api/users/me
 * Update user profile (firstName, lastName, email)
 * Requires: auth token
 * Body: { firstName?, lastName?, email? }
 */
router.put("/me", auth, updateProfile);

/**
 * PUT /api/users/me/password
 * Change user password
 * Requires: auth token
 * Body: { oldPassword, newPassword }
 */
router.put("/me/password", auth, changePassword);

/**
 * PUT /api/users/me/avatar
 * Update profile picture
 * Requires: auth token
 * Form data: profileImage (file)
 */
router.put("/me/avatar", auth, upload.single("profileImage"), updateAvatar);

/**
 * DELETE /api/users/me
 * Delete user account
 * Requires: auth token
 * Body: { password }
 */
router.delete("/me", auth, deleteAccount);

// ============================================
// Public Routes
// ============================================

/**
 * GET /api/users/:id
 * Get public user profile
 * No authentication required
 */
router.get("/:id", getUserById);

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