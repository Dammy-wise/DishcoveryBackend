import { DataTypes } from "sequelize";
import bcrypt from "bcryptjs";

export default (sequelize) => {
  const User = sequelize.define(
    "User",
    {
      firstName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      }
    },
    { timestamps: true }
  );

  // Hash password
  User.beforeCreate(async (user) => {
    user.password = await bcrypt.hash(user.password, 10);
  });

  // Validate password
  User.prototype.validatePassword = async function (enteredPassword) {
    return bcrypt.compare(enteredPassword, this.password);
  };

  return User;
};
