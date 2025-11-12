import sequelize from "./models/index.js";
import { Recipe, User } from "./models/index.js";

// ✅ Run seeding inside async function
const seed = async () => {
  try {
    console.log("🌱 Starting recipe seeding...");

    await sequelize.authenticate();
    console.log("✅ DB connected");

    const user = await User.findOne();
    if (!user) {
      throw new Error("❌ No user found. Create at least 1 user first.");
    }

    console.log("✅ Using userId:", user.id);

    // ✅ DELETE OLD RECIPES
    await Recipe.destroy({ where: {} });

    // ✅ Placeholder — REAL 50 recipes will be generated next
    const recipes = [];

    await Recipe.bulkCreate(recipes);
    console.log("✅ Seed completed successfully!");

    process.exit();
  } catch (error) {
    console.error("❌ SEED ERROR:", error);
    process.exit(1);
  }
};

seed();
