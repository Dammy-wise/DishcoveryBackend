import sequelize from "../config/database.js";
import UserModel from "./User.js";
import RecipeModel from "./Recipe.js";

export const User = UserModel(sequelize);
export const Recipe = RecipeModel(sequelize);

// TEMPORARY: Recreate all tables from scratch
sequelize
  .sync({ alter: true })
  .then(() => console.log("Database synced successfully alter:true"))
  .catch((err) => console.error("Database sync error:", err));

export default sequelize;
