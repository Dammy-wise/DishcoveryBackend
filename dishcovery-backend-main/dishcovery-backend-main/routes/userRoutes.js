import express from 'express'
import { getProfile, getUserRecipes } from '../controllers/userController.js'
import { auth } from '../middleware/authMiddleware.js'

const router = express.Router()

router.get('/me', auth, getProfile)
router.get('/:id/recipes', getUserRecipes)

export default router
