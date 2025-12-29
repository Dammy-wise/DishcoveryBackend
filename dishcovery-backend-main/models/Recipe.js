// models/Recipe.js - Fixed with proper field definitions
import { DataTypes } from "sequelize";

export default (sequelize) => {
  const Recipe = sequelize.define("Recipe", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
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
      defaultValue: 30
    },
    prepTime: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 10
    },
    rating: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 5
      }
    },
    description: {
      type: DataTypes.TEXT,
      defaultValue: ''
    },
    // ✅ JSONB for PostgreSQL arrays
    ingredients: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: []
    },
    instructions: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: []
    },
    // ✅ Image URL from Cloudinary
    image: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'https://res.cloudinary.com/dguseowoa/image/upload/v1762823979/amala_and_gbegiri_lkovb8.jpg'
    },
    // ✅ Foreign key (links recipe to user who posted it)
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    }
  }, {
    tableName: 'Recipes',
    timestamps: true
  });

  return Recipe;
};