import { DataTypes } from "sequelize";

export default (sequelize) => {
  const Favorite = sequelize.define("Favorite", {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    recipeId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  });

  return Favorite;
};
