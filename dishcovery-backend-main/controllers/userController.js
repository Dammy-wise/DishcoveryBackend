// /controllers/userController.js
import { User } from "../models/index.js";
import bcrypt from "bcryptjs";

// List all users (admin)
export const listUsers = async (req, res) => {
  try {
    const users = await User.findAll({ attributes: ["id", "firstName", "lastName", "email", "role", "createdAt"] });
    return res.json(users);
  } catch (err) {
    console.error("listUsers error:", err);
    return res.status(500).json({ error: err.message });
  }
};

// Make a user admin (admin only)
export const makeAdmin = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.role = "admin";
    await user.save();
    return res.json({ message: "User promoted to admin", user: { id: user.id, email: user.email, role: user.role } });
  } catch (err) {
    console.error("makeAdmin error:", err);
    return res.status(500).json({ error: err.message });
  }
};

// Delete user (admin)
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    await user.destroy();
    return res.json({ message: "User deleted" });
  } catch (err) {
    console.error("deleteUser error:", err);
    return res.status(500).json({ error: err.message });
  }
};
