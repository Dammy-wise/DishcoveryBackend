import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.DB_URL) {
  console.error("❌ DB_URL environment variable is missing!");
  process.exit(1);
}

const sequelize = new Sequelize(
  process.env.DB_URL,
  {
    dialect: "postgres",
    logging: process.env.NODE_ENV === 'development',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

export default sequelize;
