// cleanUp.js
/**
 * Deletes all files in the 'recipes' folder on Cloudinary.
 * * Usage: node cleanUp.js
 * * Requirements:
 * - .env must contain CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
 */
import dotenv from "dotenv";
dotenv.config();

import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary using your environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

(async () => {
  const FOLDER_NAME = "recipes";
  console.log(`Attempting to delete all assets in folder: ${FOLDER_NAME} ...`);

  try {
    // 1. List all resources in the folder
    const listResult = await cloudinary.api.resources({
      type: 'upload',
      prefix: `${FOLDER_NAME}/`, // Use prefix to target files inside the folder
      max_results: 500, // Fetch up to 500 files
    });

    if (listResult.resources.length === 0) {
      console.log(`No images found in the '${FOLDER_NAME}' folder. Cleanup is complete!`);
      process.exit(0);
    }
    
    // 2. Extract public IDs
    const publicIds = listResult.resources.map(resource => resource.public_id);
    console.log(`Found ${publicIds.length} images to delete.`);
    
    // 3. Delete all resources using their public IDs
    const deleteResult = await cloudinary.api.delete_resources(publicIds);
    
    // 4. Delete the folder itself (optional, but good practice)
    await cloudinary.api.delete_folder(FOLDER_NAME);

    console.log(`Successfully deleted ${publicIds.length} images and the folder '${FOLDER_NAME}' from Cloudinary.`);
    console.log(`Deletion results:`, deleteResult.deleted);
    process.exit(0);

  } catch (error) {
    console.error("Cleanup failed. Check your Cloudinary API keys and permissions.");
    console.error(error.message);
    process.exit(1);
  }
})();

