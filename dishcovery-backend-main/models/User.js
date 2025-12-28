// dishcovery-backend-main/models/User.js
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
      },
      // ✅ ADD ROLE FIELD
      role: {
        type: DataTypes.STRING,
        defaultValue: "user",
        allowNull: false,
      }
    },
    { timestamps: true }
  );

  // Hash password before creating user
  User.beforeCreate(async (user) => {
    if (user.password) {
      user.password = await bcrypt.hash(user.password, 10);
    }
  });

  // Hash password before updating if it changed
  User.beforeUpdate(async (user) => {
    if (user.changed('password')) {
      user.password = await bcrypt.hash(user.password, 10);
    }
  });

  // Validate password method
  User.prototype.validatePassword = async function (enteredPassword) {
    return bcrypt.compare(enteredPassword, this.password);
  };

  return User;
};