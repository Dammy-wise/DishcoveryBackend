import sequelize from "../config/database.js";

import UserModel from "./User.js";
import RecipeModel from "./Recipe.js";
import FavoriteModel from "./favorite.js";

// Initialize models
export const User = UserModel(sequelize);
export const Recipe = RecipeModel(sequelize);
export const Favorite = FavoriteModel(sequelize);

// ✅ Setup relationships
User.hasMany(Recipe, { foreignKey: "userId" });
Recipe.belongsTo(User, { foreignKey: "userId" });

// ✅ A user can favorite many recipes
User.hasMany(Favorite, { foreignKey: "userId", onDelete: "CASCADE" });
Favorite.belongsTo(User, { foreignKey: "userId" });

// ✅ A recipe can be favorited many times
Recipe.hasMany(Favorite, { foreignKey: "recipeId", onDelete: "CASCADE" });
Favorite.belongsTo(Recipe, { foreignKey: "recipeId" });

// ✅ TEMP: update DB structure
sequelize
  .sync({ alter: true })
  .then(() => console.log("✅ DB updated with Favorite model"))
  .catch((err) => console.error("❌ DB sync error:", err));

export default sequelize;
