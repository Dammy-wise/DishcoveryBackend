// models/Favorite.js - Fixed with proper field definitions
import { DataTypes } from "sequelize";

export default (sequelize) => {
  const Favorite = sequelize.define("Favorite", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    recipeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Recipes',
        key: 'id'
      }
    }
  }, {
    tableName: 'Favorites',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['userId', 'recipeId']
      }
    ]
  });

  return Favorite;
};