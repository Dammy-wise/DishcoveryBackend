// server.js
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

// Sync DB once
sequelize
  .sync()
  .then(() => console.log("✅ Database synced successfully"))
  .catch((err) => console.error("❌ Database sync error:", err));

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/recipes", recipeRoutes);
app.use("/api/users", userRoutes);
app.use("/api/favorites", favoriteRoutes);

app.get("/", (req, res) => res.send("Dishcovery API Running..."));

app.listen(process.env.PORT || 5000, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
