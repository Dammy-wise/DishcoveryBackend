// /middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import { User } from "../models/index.js";
import dotenv from "dotenv";
dotenv.config();

export const auth = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header) return res.status(401).json({ error: "Authorization header missing" });

    const token = header.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Invalid token format" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id);
    if (!user) return res.status(401).json({ error: "User not found" });

    // attach user
    req.user = user;
    next();
  } catch (err) {
    console.error("Auth middleware error:", err.message || err);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};
