// dishcovery-backend-main/server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import recipeRoutes from "./routes/recipeRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import favoriteRoutes from "./routes/favoriteRoutes.js";
import sequelize from "./models/index.js";

dotenv.config();
const app = express();

// ✅ Better CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// ✅ Add body parsers BEFORE routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Request logging middleware (helps debug)
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  console.log('Body:', req.body);
  next();
});

// ✅ Sync database
// Remove auto-sync from models/index.js
// Only sync in server.js with proper error handling

// In server.js:
sequelize
  .authenticate()
  .then(() => {
    console.log("✅ Database connected");
    return sequelize.sync({ alter: false }); // Don't alter in production
  })
  .then(() => console.log("✅ Database synced"))
  .catch((err) => {
    console.error("❌ Database error:", err);
    process.exit(1);
  });

// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/api/recipes", recipeRoutes);
app.use("/api/users", userRoutes);
app.use("/api/favorites", favoriteRoutes);

// ✅ Root route
app.get("/", (req, res) => {
  res.json({ 
    message: "Dishcovery API Running",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      recipes: "/api/recipes",
      users: "/api/users",
      favorites: "/api/favorites"
    }
  });
});

// ✅ Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ✅ 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: "Not Found",
    message: `Cannot ${req.method} ${req.path}` 
  });
});

// ✅ Error handler
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({ 
    error: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 API URL: http://localhost:${PORT}`);
  console.log(`🔗 Render URL: ${process.env.RENDER_EXTERNAL_URL || 'Not set'}`);
});