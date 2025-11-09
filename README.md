Dishcovery Backend API

Dishcovery is a recipe-sharing platform built with Node.js, Express, Sequelize, and PostgreSQL.
It allows users to register, log in, upload and manage recipes (with images), and save favorite recipes.

Live Backend https://dishcovery-backend-1.onrender.com

Tech Stack

Node.js (Express)
Sequelize ORM
PostgreSQL (Render Cloud Database)
Multer for image upload
JWT Authentication
API Endpoints

Auth Routes | Endpoint | Method | Description | Auth |

| /api/auth/signup | POST | Register a new user | Nil |

| /api/auth/login | POST | Login and get JWT token | Nil |

Recipe Routes | Endpoint | Method | Description | Auth |

| /api/recipes | GET | Get all recipes | Nil |

| /api/recipes/:id | GET | Get single recipe by ID | Nil |

| /api/recipes | POST | Create new recipe (with image) | Yes |

| /api/recipes/:id | PUT | Update existing recipe | Tes |

| /api/recipes/:id | DELETE | Delete a recipe | Yes |

| /api/recipes/search?q= | GET | Search for recipes | Nil |

| /api/recipes/save/:id | POST | Save a recipe | Yes |

| /api/recipes/saved/user | GET | Get user’s saved recipes |yes|

User Route | Endpoint | Method | Description | Auth |

| /api/users/me | GET | Get current user profile

Authentication  

After login, copy the token from response JSON.
In Postman or frontend, send this in the header:

Authorization: Bearer <your_token>
