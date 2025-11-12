import sequelize from "./models/index.js";
import { Recipe, User } from "./models/index.js";

console.log("🌱 Starting auto-seed...");

// ✅ 28 Recipes (23 Nigerian, 5 Global)
const recipes = [
  {
    name: "Amala & Gbegiri",
    category: "Nigerian",
    cookingTime: 60,
    prepTime: 20,
    rating: 5,
    description: "A Yoruba delicacy served with Gbegiri soup and Ewedu.",
    ingredients: ["Amala", "Gbegiri", "Ewedu", "Seasoning"],
    instructions: ["Prepare gbegiri", "Whisk amala", "Serve hot"],
    image: "https://res.cloudinary.com/dguseowoa/image/upload/v1762823979/amala_and_gbegiri_lkovb8.jpg",
  },
  {
    name: "Akara",
    category: "Nigerian",
    cookingTime: 20,
    prepTime: 15,
    rating: 4.6,
    description: "Deep fried bean cakes enjoyed for breakfast.",
    ingredients: ["Beans", "Pepper", "Onion", "Salt"],
    instructions: ["Blend beans", "Mix ingredients", "Fry"],
    image: "https://res.cloudinary.com/dguseowoa/image/upload/v1762823971/akara_nbr7lz.avif",
  },
  {
    name: "Afang Soup",
    category: "Nigerian",
    cookingTime: 45,
    prepTime: 20,
    rating: 4.8,
    description: "Calabar vegetable soup rich in flavor and nutrients.",
    ingredients: ["Afang leaves", "Waterleaf", "Meat", "Fish"],
    instructions: ["Chop leaves", "Cook meat", "Combine all ingredients"],
    image: "https://res.cloudinary.com/dguseowoa/image/upload/v1762823968/afang_soup_and_efo_riro_xsofyc.jpg",
  },
  {
    name: "White Soup (Ofe Nsala)",
    category: "Nigerian",
    cookingTime: 40,
    prepTime: 15,
    rating: 4.7,
    description: "Light Igbo soup made with catfish and local spices.",
    ingredients: ["Catfish", "Utazi", "Yam", "Spices"],
    instructions: ["Boil yam", "Blend spices", "Cook fish"],
    image: "https://res.cloudinary.com/dguseowoa/image/upload/v1762823968/white_soup_iay2xl.jpg",
  },
  {
    name: "Tuwo Shinkafa",
    category: "Nigerian",
    cookingTime: 35,
    prepTime: 10,
    rating: 4.5,
    description: "Northern Nigerian swallow made from soft rice.",
    ingredients: ["Rice", "Water"],
    instructions: ["Boil rice", "Mash gently"],
    image: "https://res.cloudinary.com/dguseowoa/image/upload/v1762823967/Tuwo_shinkafa_ahc87v.jpg",
  },
  {
    name: "Suya Skewers",
    category: "Nigerian",
    cookingTime: 20,
    prepTime: 10,
    rating: 5,
    description: "Spicy grilled skewered meat.",
    ingredients: ["Beef", "Yaji spice"],
    instructions: ["Season beef", "Grill"],
    image: "https://res.cloudinary.com/dguseowoa/image/upload/v1762823957/suya_skewer_ivnwgh.jpg",
  },
  {
    name: "Pounded Yam & Efo Riro",
    category: "Nigerian",
    cookingTime: 50,
    prepTime: 20,
    rating: 5,
    description: "Rich Yoruba stew served with smooth pounded yam.",
    ingredients: ["Yam", "Spinach", "Pepper mix"],
    instructions: ["Boil yam", "Pound", "Cook stew"],
    image: "https://res.cloudinary.com/dguseowoa/image/upload/v1762823943/punded_yam_and_efo_riro_pwdm3f.jpg",
  },
  {
    name: "Beans & Plantain (Ewa Agoyin)",
    category: "Nigerian",
    cookingTime: 60,
    prepTime: 20,
    rating: 4.9,
    description: "Mashed beans with pepper sauce and fried plantain.",
    ingredients: ["Beans", "Palm oil", "Pepper"],
    instructions: ["Cook beans", "Prepare sauce", "Serve"],
    image: "https://res.cloudinary.com/dguseowoa/image/upload/v1762823943/plantain_and_beans_qdaagg.jpg",
  },
  {
    name: "Pepper Soup",
    category: "Nigerian",
    cookingTime: 30,
    prepTime: 10,
    rating: 5,
    description: "Spicy broth made with assorted meats and spices.",
    ingredients: ["Goat meat", "Spices"],
    instructions: ["Season meat", "Boil", "Add spices"],
    image: "https://res.cloudinary.com/dguseowoa/image/upload/v1762823936/pepper_soup_s8xzed.jpg",
  },
  {
    name: "Okra Soup",
    category: "Nigerian",
    cookingTime: 25,
    prepTime: 10,
    rating: 4.8,
    description: "Slimy delicious okra soup rich in vegetables and protein.",
    ingredients: ["Okra", "Fish", "Palm oil"],
    instructions: ["Slice okra", "Cook ingredients"],
    image: "https://res.cloudinary.com/dguseowoa/image/upload/v1762823931/okra_soup_ertvjv.jpg",
  },
  {
    name: "Ogbono Soup",
    category: "Nigerian",
    cookingTime: 30,
    prepTime: 10,
    rating: 4.7,
    description: "Thick soup made from ground ogbono seeds.",
    ingredients: ["Ogbono", "Palm oil", "Meat"],
    instructions: ["Dissolve ogbono", "Cook ingredients"],
    image: "https://res.cloudinary.com/dguseowoa/image/upload/v1762823923/Ogbono_soup_n2oqs6.jpg",
  },
  {
    name: "Suya Deluxe",
    category: "Nigerian",
    cookingTime: 20,
    prepTime: 10,
    rating: 5,
    description: "Extra spicy and juicy suya served with onions.",
    ingredients: ["Beef", "Yaji", "Onions"],
    instructions: ["Marinate", "Grill"],
    image: "https://res.cloudinary.com/dguseowoa/image/upload/v1762823923/nigerian_suya_delux_kjrnud.jpg",
  },
  {
    name: "Nkwobi",
    category: "Nigerian",
    cookingTime: 45,
    prepTime: 15,
    rating: 4.8,
    description: "Spicy cow foot delicacy native to the Igbos.",
    ingredients: ["Cow foot", "Palm oil", "Spices"],
    instructions: ["Cook meat", "Mix palm oil paste"],
    image: "https://res.cloudinary.com/dguseowoa/image/upload/v1762823923/nkwobi_drqetn.jpg",
  },
  {
    name: "Moi Moi",
    category: "Nigerian",
    cookingTime: 60,
    prepTime: 25,
    rating: 4.9,
    description: "Steamed bean pudding with pepper and spices.",
    ingredients: ["Beans", "Pepper", "Palm oil"],
    instructions: ["Blend", "Mix", "Steam"],
    image: "https://res.cloudinary.com/dguseowoa/image/upload/v1762823922/moi_moi_tz2ox0.jpg",
  },
  {
    name: "Jollof Spaghetti",
    category: "Nigerian",
    cookingTime: 35,
    prepTime: 15,
    rating: 4.7,
    description: "Spaghetti cooked in rich Nigerian jollof sauce.",
    ingredients: ["Spaghetti", "Tomato mix"],
    instructions: ["Boil spaghetti", "Cook sauce", "Mix"],
    image: "https://res.cloudinary.com/dguseowoa/image/upload/v1762823916/jollof_spaghetti_yjhrga.jpg",
  },
  {
    name: "Fried Rice",
    category: "Nigerian",
    cookingTime: 30,
    prepTime: 10,
    rating: 4.9,
    description: "Nigerian fried rice cooked with veggies and liver.",
    ingredients: ["Rice", "Carrots", "Peas", "Liver"],
    instructions: ["Parboil rice", "Stir fry"],
    image: "https://res.cloudinary.com/dguseowoa/image/upload/v1762823915/fried_rice_myd71z.jpg",
  },
  {
    name: "Egusi Soup",
    category: "Nigerian",
    cookingTime: 40,
    prepTime: 20,
    rating: 5,
    description: "Rich, thick melon seed soup enjoyed with swallow.",
    ingredients: ["Egusi", "Palm oil", "Vegetables"],
    instructions: ["Blend egusi", "Cook soup"],
    image: "https://res.cloudinary.com/dguseowoa/image/upload/v1762823912/Egusi_nqs33r.webp",
  },
  {
    name: "Banga Soup",
    category: "Nigerian",
    cookingTime: 60,
    prepTime: 30,
    rating: 4.7,
    description: "Warri-style palm fruit soup served with starch.",
    ingredients: ["Palm fruit", "Spices"],
    instructions: ["Extract juice", "Cook"],
    image: "https://res.cloudinary.com/dguseowoa/image/upload/v1762823905/banga_iihhsv.webp",
  },
  {
    name: "Roasted Plantain (Boli)",
    category: "Nigerian",
    cookingTime: 20,
    prepTime: 5,
    rating: 4.8,
    description: "Roasted ripe plantain enjoyed with groundnut.",
    ingredients: ["Plantain"],
    instructions: ["Roast"],
    image: "https://res.cloudinary.com/dguseowoa/image/upload/v1762823910/boli_rosted_plantain_ykuvqm.webp",
  },

  // ✅ INTERNATIONAL (5)
  {
    name: "Sushi Platter",
    category: "International",
    cookingTime: 45,
    prepTime: 30,
    rating: 4.9,
    description: "Japanese assorted sushi platter.",
    ingredients: ["Rice", "Fish", "Seaweed"],
    instructions: ["Prepare rice", "Roll sushi"],
    image: "https://res.cloudinary.com/dguseowoa/image/upload/v1762823957/sushi_platter_m3f1pf.webp",
  },
  {
    name: "Tacos",
    category: "International",
    cookingTime: 25,
    prepTime: 15,
    rating: 4.8,
    description: "Mexican tacos stuffed with meat and veggies.",
    ingredients: ["Tortilla", "Meat", "Cheese"],
    instructions: ["Cook meat", "Assemble tacos"],
    image: "https://res.cloudinary.com/dguseowoa/image/upload/v1762823958/Tacos_v1eiam.jpg",
  },
  {
    name: "Spaghetti Bolognese",
    category: "International",
    cookingTime: 40,
    prepTime: 15,
    rating: 4.7,
    description: "Classic Italian pasta with meat sauce.",
    ingredients: ["Spaghetti", "Tomato", "Beef"],
    instructions: ["Cook pasta", "Prepare sauce"],
    image: "https://res.cloudinary.com/dguseowoa/image/upload/v1762823956/spagetti_bolognese_b3vmjj.jpg",
  },
  {
    name: "Shakshuka",
    category: "International",
    cookingTime: 30,
    prepTime: 10,
    rating: 4.8,
    description: "Eggs poached in spiced tomato sauce.",
    ingredients: ["Eggs", "Tomato", "Pepper"],
    instructions: ["Cook sauce", "Add eggs"],
    image: "https://res.cloudinary.com/dguseowoa/image/upload/v1762823943/shakshuka_bptjz5.jpg",
  },
  {
    name: "Beef Bourguignon",
    category: "International",
    cookingTime: 120,
    prepTime: 20,
    rating: 5,
    description: "French beef stew slow-cooked in wine.",
    ingredients: ["Beef", "Red wine", "Carrots"],
    instructions: ["Sear beef", "Slow cook"],
    image: "https://res.cloudinary.com/dguseowoa/image/upload/v1762823909/beef_burguignon_l19ppr.jpg",
  },
];

const seed = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ DB connected");

    const user = await User.findOne();
    if (!user) throw new Error("Create at least one user first!");

    // ✅ Attach userId to every recipe
    recipes.forEach((r) => (r.userId = user.id));

    // ✅ Clear existing recipes
    await Recipe.destroy({ where: {} });

    // ✅ Insert new recipes
    await Recipe.bulkCreate(recipes);
    console.log("✅ 28 recipes seeded successfully!");
    process.exit();
  } catch (err) {
    console.error("❌ Error:", err);
    process.exit(1);
  }
};

seed();
