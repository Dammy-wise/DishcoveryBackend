
import jwt from 'jsonwebtoken'
import { User } from '../models/index.js'

// Export named function "auth"
export const auth = async (req, res, next) => {
  try {
    const header = req.headers.authorization
    if (!header) {
      return res.status(401).json({ error: 'Authorization header missing' })
    }

    // Bearer token
    const token = header.split(' ')[1]
    if (!token) {
      return res.status(401).json({ error: 'Invalid token format' })
    }

    // Verify token with secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Find user in database
    const user = await User.findByPk(decoded.id)
    if (!user) {
      return res.status(401).json({ error: 'User not found' })
    }

    // Attach user object to request for next handlers
    req.user = user
    next()
  } catch (err) {
    console.error('Auth middleware error:', err.message)
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}
