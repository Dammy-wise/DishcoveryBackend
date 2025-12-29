// models/index.js - Fixed with proper associations
import sequelize from "../config/database.js";
import UserModel from "./User.js";
import RecipeModel from "./Recipe.js";
import FavoriteModel from "./favorite.js";

// Initialize models
export const User = UserModel(sequelize);
export const Recipe = RecipeModel(sequelize);
export const Favorite = FavoriteModel(sequelize);

// ✅ Setup relationships with proper aliases
User.hasMany(Recipe, { 
  foreignKey: "userId", 
  as: "recipes",
  onDelete: "CASCADE" 
});

Recipe.belongsTo(User, { 
  foreignKey: "userId",
  as: "user"
});

User.hasMany(Favorite, { 
  foreignKey: "userId",
  as: "favorites",
  onDelete: "CASCADE" 
});

Favorite.belongsTo(User, { 
  foreignKey: "userId",
  as: "user"
});

Recipe.hasMany(Favorite, { 
  foreignKey: "recipeId",
  as: "favorites",
  onDelete: "CASCADE" 
});

Favorite.belongsTo(Recipe, { 
  foreignKey: "recipeId",
  as: "recipe"
});

console.log('✅ Models initialized with associations');

export default sequelize;