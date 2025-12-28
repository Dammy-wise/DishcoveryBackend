import sequelize from "../config/database.js";

import UserModel from "./User.js";
import RecipeModel from "./Recipe.js";
import FavoriteModel from "./favorite.js";

// Initialize models
export const User = UserModel(sequelize);
export const Recipe = RecipeModel(sequelize);
export const Favorite = FavoriteModel(sequelize);

// ✅ Setup relationships
User.hasMany(Recipe, { foreignKey: "userId", onDelete: "CASCADE" });
Recipe.belongsTo(User, { foreignKey: "userId" });

User.hasMany(Favorite, { foreignKey: "userId", onDelete: "CASCADE" });
Favorite.belongsTo(User, { foreignKey: "userId" });

Recipe.hasMany(Favorite, { foreignKey: "recipeId", onDelete: "CASCADE" });
Favorite.belongsTo(Recipe, { foreignKey: "recipeId" });

<<<<<<< HEAD
// ❌ REMOVED: Don't sync here, do it in server.js only
=======
// ✅ TEMP: update DB structure
sequelize
  .then(() => console.log("✅ DB updated with Favorite model"))
  .catch((err) => console.error("❌ DB sync error:", err));
>>>>>>> 94151f6a66c508549eb2e4143245477c0ed5222e

export default sequelize;