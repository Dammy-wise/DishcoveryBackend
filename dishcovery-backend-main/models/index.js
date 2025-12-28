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

// ❌ REMOVED: Don't sync here, do it in server.js only

export default sequelize;