import { User } from "../models/index.js";
import jwt from "jsonwebtoken";

// ✅ Generate JWT
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// ✅ SIGNUP CONTROLLER
export const signup = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Check duplicate email
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "Email already exists" });
    }


   // Validate input first
if (!firstName || !lastName || !email || !password) {
  return res.status(400).json({ 
    error: "All fields are required" 
  });
}

if (password.length < 6) {
  return res.status(400).json({ 
    error: "Password must be at least 6 characters" 
  });
}

// Then create user...



    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
    });

    const token = generateToken(user);

    return res.status(201).json({
      message: "Signup successful",
      token,
      user: {
        id: user.id,
        firstName,
        lastName,
        email,
      },
    });
  } catch (error) {
    console.error("Signup Error:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

// ✅ LOGIN CONTROLLER
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ error: "Email and password required" });

    // Check if user exists
    const user = await User.findOne({ where: { email } });

    if (!user)
      return res.status(404).json({ error: "User not found" });

    // Validate password
    const valid = await user.validatePassword(password);

    if (!valid)
      return res.status(400).json({ error: "Invalid password" });

    const token = generateToken(user);

    return res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ error: "Server error" });
  }
};
