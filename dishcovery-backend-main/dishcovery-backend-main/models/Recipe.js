import { DataTypes } from "sequelize";

export default (sequelize) => {
  const Recipe = sequelize.define("Recipe", {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    category: {
      type: DataTypes.STRING,
      defaultValue: "Nigerian",
    },

    cookingTime: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    prepTime: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    rating: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },

    description: {
      type: DataTypes.TEXT,
    },

    // ✅ JSONB because PostgreSQL handles arrays as JSONB 
    ingredients: {
      type: DataTypes.JSONB,
      allowNull: false,
    },

    instructions: {
      type: DataTypes.JSONB,
      allowNull: false,
    },

    // ✅ Image URL from Cloudinary
    image: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    // ✅ Foreign key (links recipe to user who posted it)
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    }
  });

  return Recipe;
};
