✅ ✅ ✅ DISHCOVERY BACKEND — COMPLETE API DOCUMENTATION

(Everything implemented so far, with all endpoints and usage instructions)

🍽️ Dishcovery Backend API Documentation

Node.js + Express + PostgreSQL + Sequelize + Cloudinary + JWT Auth

This documentation contains:

✅ Authentication (Signup/Login/Forgot/Reset)
✅ Recipe CRUD (Create with Cloudinary, Fetch, Get One)
✅ Favorites System (Save/Remove)
✅ Admin System (List Users, Make Admin, Delete User, Delete Recipe)
✅ Search & Filtering
✅ Postman Collection (Import Ready)
✅ Frontend Integration Guide

✅ BASE URLS
✅ Local:
http://localhost:5000

✅ Render Deployment:
https://dishcovery-backend-1.onrender.com

✅ SECTION 1 — AUTHENTICATION API

Supports: firstName, lastName, email, password

✅ 1.1 Register (Signup)

POST /api/auth/signup

✅ Body (JSON)
{
"firstName": "John",
"lastName": "James",
"email": "john@example.com",
"password": "pass1234"
}

✅ Response
{
"message": "Signup successful",
"token": "JWT_TOKEN",
"user": {
"id": 1,
"firstName": "John",
"lastName": "James",
"email": "john@example.com",
"role": "user"
}
}

✅ 1.2 Login

POST /api/auth/login

✅ Body
{
"email": "john@example.com",
"password": "pass1234"
}

✅ Response
{
"message": "Login successful",
"token": "JWT_TOKEN",
"user": {
"id": 1,
"firstName": "John",
"lastName": "James",
"email": "john@example.com",
"role": "user"
}
}

✅ 1.3 Forgot Password

(Capstone placeholder — no email service required)

POST /api/auth/forgot-password

✅ Response:
{
"message": "Password reset link would be emailed in production. Placeholder only."
}

✅ 1.4 Reset Password

(Capstone placeholder — UI only)

POST /api/auth/reset-password

✅ Response:
{
"message": "Password has been reset (demo version)."
}

✅ AUTH HEADER (Required for all protected routes)
Authorization: Bearer <token>

✅ SECTION 2 — RECIPES API
✅ 2.1 Get All Recipes

(Used for homepage feed)

GET /api/recipes

✅ Returns:
[
{
"id": 1,
"name": "Amala & Gbegiri",
"category": "Nigerian",
"image": "cloudinary_url",
"description": "Delicious...",
"ingredients": [...],
"instructions": [...],
"createdAt": "...",
"updatedAt": "..."
}
]

✅ 2.2 Get Recipe by ID

GET /api/recipes/:id

✅ 2.3 Create Recipe (User or Admin)

Protected → Requires token
Uses Cloudinary → Requires multipart/form-data

POST /api/recipes

✅ Form-data fields in Postman:
field type value
name text Fried Rice
category text Nigerian
cookingTime text 25
prepTime text 10
rating text 5
description text Tasty rice
ingredients text ["rice","oil"]
instructions text ["cook","serve"]
image file <upload file>
✅ Response:
{
"message": "Recipe created successfully",
"recipe": {...}
}

✅ SECTION 3 — FAVORITES SYSTEM

Allows a user to save/unsave recipes.

✅ 3.1 Toggle Favorite (Save/Unsave)

POST /api/favorites/:recipeId/toggle
Headers: Authorization: Bearer <token>

✅ Response:
{ "message": "Added to favorites" }

or

{ "message": "Removed from favorites" }

✅ 3.2 Get User Favorites

GET /api/favorites
Requires token.

✅ Response:
[
{
"id": 1,
"recipe": { ... }
}
]

✅ SECTION 4 — ADMIN SYSTEM (Option C)

Supports:

✅ Make user admin
✅ List users
✅ Delete user
✅ Delete recipe
✅ View DB stats

✅ 4.1 List All Users

(Admins only)

GET /api/admin/users

Header:

Authorization: Bearer <admin_token>

✅ 4.2 Make User an Admin

PUT /api/admin/users/:id/make-admin

✅ 4.3 Delete User

DELETE /api/admin/users/:id

✅ 4.4 Delete Recipe

DELETE /api/admin/recipes/:id

✅ SECTION 5 — SEARCH & FILTERING
✅ 5.1 Search Recipes by Name

?search=jollof

GET /api/recipes/search?query=jollof

✅ 5.2 Filter by Category

?category=Nigerian

GET /api/recipes/filter?category=Nigerian

✅ 5.3 Filter by Cooking Time

GET /api/recipes/filter?maxTime=30

✅ 5.4 Filter by Rating

GET /api/recipes/filter?rating=4

✅ SECTION 6 — FRONTEND INTEGRATION

Your frontend team needs:

✅ 6.1 Signup Form Fields

Must send:

{
"firstName": "",
"lastName": "",
"email": "",
"password": ""
}

✅ Matches frontend design

✅ 6.2 Login Form Fields
{
"email": "",
"password": ""
}

✅ 6.3 How frontend stores token

After login:

localStorage.setItem("token", response.data.token)

Then for all protected requests (recipe upload, favorites, admin):

axios.get("/api/recipes", {
headers: { Authorization: `Bearer ${token}` }
})

✅ SECTION 7 — DIRECTORY STRUCTURE FOR ALL FEATURES
/config
database.js

/controllers
authController.js
recipeController.js
adminController.js
favoritesController.js

/middleware
authMiddleware.js
adminMiddleware.js

/models
index.js
User.js
Recipe.js
Favorite.js

/routes
authRoutes.js
recipeRoutes.js
adminRoutes.js
favoritesRoutes.js

/utils
cloudinary.js

autoSeed.js
server.js
