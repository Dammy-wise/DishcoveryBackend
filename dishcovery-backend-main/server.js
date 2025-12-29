// server.js - Complete Updated Version with User Routes
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import recipeRoutes from "./routes/recipeRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import favoriteRoutes from "./routes/favoriteRoutes.js";
import sequelize from "./models/index.js";

// Load environment variables
dotenv.config();

// Validate required environment variables
const requiredEnvVars = ['DB_URL', 'JWT_SECRET', 'CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error(`❌ Missing required environment variables: ${missingEnvVars.join(', ')}`);
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 5000;

// ============================================
// CORS Configuration - Mobile App Compatible
// ============================================
app.use(cors({
  origin: (origin, callback) => {
    // ✅ Always allow requests with no origin (mobile apps, Postman, curl)
    if (!origin) {
      return callback(null, true);
    }
    
    // ✅ Allow all origins in production (needed for React Native apps)
    callback(null, true);
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 200
}));

// Handle preflight requests
app.options('*', cors());

// ============================================
// Middleware
// ============================================

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware (helpful for debugging)
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`${timestamp} - ${req.method} ${req.path}`);
  next();
});

// ============================================
// Routes
// ============================================
app.use("/api/auth", authRoutes);
app.use("/api/recipes", recipeRoutes);
app.use("/api/users", userRoutes);
app.use("/api/favorites", favoriteRoutes);

// ============================================
// Health Check & API Info Endpoints
// ============================================

// Root endpoint - API documentation
app.get("/", (req, res) => {
  res.json({ 
    message: "🍽️ Dishcovery API Running",
    version: "1.0.0",
    status: "healthy",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    endpoints: {
      auth: {
        signup: "POST /api/auth/signup",
        login: "POST /api/auth/login",
        forgotPassword: "POST /api/auth/forgot-password",
        resetPassword: "POST /api/auth/reset-password"
      },
      users: {
        profile: "GET /api/users/me (authenticated)",
        updateProfile: "PUT /api/users/me (authenticated)",
        changePassword: "PUT /api/users/me/password (authenticated)",
        updateAvatar: "PUT /api/users/me/avatar (authenticated)",
        deleteAccount: "DELETE /api/users/me (authenticated)",
        getUser: "GET /api/users/:id"
      },
      recipes: {
        list: "GET /api/recipes",
        create: "POST /api/recipes (authenticated)",
        get: "GET /api/recipes/:id",
        update: "PUT /api/recipes/:id (authenticated)",
        delete: "DELETE /api/recipes/:id (authenticated)",
        userRecipes: "GET /api/recipes/user/:userId"
      },
      favorites: {
        list: "GET /api/favorites (authenticated)",
        toggle: "POST /api/favorites/:recipeId/toggle (authenticated)"
      }
    },
    documentation: {
      note: "All authenticated endpoints require 'Authorization: Bearer <token>' header",
      baseUrl: "https://dishcovery-backend-ln31.onrender.com/api"
    }
  });
});

// Health check for monitoring services
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    database: "connected",
    environment: process.env.NODE_ENV || 'development'
  });
});

// Test endpoint to verify user routes are working
app.get("/api/test", (req, res) => {
  res.json({
    message: "API is working correctly",
    routes: {
      userRoutes: "mounted at /api/users",
      authRoutes: "mounted at /api/auth",
      recipeRoutes: "mounted at /api/recipes",
      favoriteRoutes: "mounted at /api/favorites"
    }
  });
});

// ============================================
// Error Handling
// ============================================

// 404 handler - Route not found
app.use((req, res) => {
  res.status(404).json({ 
    error: "Route not found",
    path: req.path,
    method: req.method,
    message: `Cannot ${req.method} ${req.path}`,
    availableRoutes: [
      "GET /",
      "GET /api/health",
      "GET /api/test",
      "POST /api/auth/signup",
      "POST /api/auth/login",
      "GET /api/users/me (authenticated)",
      "PUT /api/users/me (authenticated)",
      "PUT /api/users/me/password (authenticated)",
      "GET /api/recipes",
      "POST /api/recipes (authenticated)",
      "GET /api/favorites (authenticated)",
      "POST /api/favorites/:id/toggle (authenticated)"
    ]
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("❌ Error:", err);
  console.error("Stack:", err.stack);
  
  // Handle CORS errors specifically
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ 
      error: "CORS error",
      message: "Origin not allowed"
    });
  }
  
  // Handle multer errors (file upload)
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        error: "File too large",
        message: "Maximum file size is 5MB"
      });
    }
    return res.status(400).json({ 
      error: "File upload error",
      message: err.message
    });
  }
  
  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ 
      error: "Invalid token",
      message: "Please login again"
    });
  }
  
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ 
      error: "Token expired",
      message: "Please login again"
    });
  }
  
  // Handle Sequelize validation errors
  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({ 
      error: "Validation error",
      details: err.errors.map(e => e.message)
    });
  }
  
  // Handle Sequelize unique constraint errors
  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({ 
      error: "Duplicate entry",
      message: "This value already exists"
    });
  }
  
  // Generic error response
  res.status(err.status || 500).json({ 
    error: err.message || "Internal Server Error",
    details: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// ============================================
// Database Connection and Server Startup
// ============================================
const startServer = async () => {
  try {
    console.log("\n" + "=".repeat(60));
    console.log("🔄 Starting Dishcovery API Server...");
    console.log("=".repeat(60));
    
    console.log("\n📊 Environment Configuration:");
    console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`   Port: ${PORT}`);
    console.log(`   Database: ${process.env.DB_URL ? '✅ Configured' : '❌ Not configured'}`);
    console.log(`   JWT Secret: ${process.env.JWT_SECRET ? '✅ Set' : '❌ Not set'}`);
    console.log(`   Cloudinary: ${process.env.CLOUDINARY_CLOUD_NAME ? '✅ Configured' : '❌ Not configured'}`);
    
    // Test database connection
    console.log("\n🔄 Connecting to database...");
    await sequelize.authenticate();
    console.log("✅ Database connected successfully");

    // Sync models with safer options for production
    console.log("\n🔄 Syncing database models...");
    
    const syncOptions = {
      // In production, only alter if NODE_ENV explicitly says so
      // Otherwise, just check tables exist
      alter: process.env.NODE_ENV === 'development',
      force: false // NEVER use force: true - it deletes all data!
    };
    
    await sequelize.sync(syncOptions);
    console.log("✅ Database models synced");

    // Log all registered routes
    console.log("\n📍 Registered Routes:");
    console.log("   Auth: /api/auth/*");
    console.log("   Users: /api/users/* (✅ NEW)");
    console.log("   Recipes: /api/recipes/*");
    console.log("   Favorites: /api/favorites/*");

    // Start server - bind to 0.0.0.0 for Render
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log("\n" + "=".repeat(60));
      console.log("🚀 SERVER RUNNING SUCCESSFULLY");
      console.log("=".repeat(60));
      console.log(`\n📍 Server URLs:`);
      console.log(`   Local: http://localhost:${PORT}`);
      console.log(`   Production: https://dishcovery-backend-ln31.onrender.com`);
      console.log(`\n🔧 Configuration:`);
      console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`   CORS: ✅ Enabled for all origins (mobile app compatible)`);
      console.log(`   Database: ✅ Connected`);
      console.log(`   File Upload: ✅ Enabled (max 10MB)`);
      console.log(`\n📚 API Documentation:`);
      console.log(`   Root: GET /`);
      console.log(`   Health: GET /api/health`);
      console.log(`   Test: GET /api/test`);
      console.log("\n" + "=".repeat(60) + "\n");
      console.log("✅ Ready to accept requests!\n");
    });

    // Graceful shutdown handlers
    const gracefulShutdown = async (signal) => {
      console.log(`\n👋 ${signal} signal received: starting graceful shutdown`);
      
      server.close(async () => {
        console.log('✅ HTTP server closed');
        
        try {
          await sequelize.close();
          console.log('✅ Database connection closed');
          console.log('✅ Graceful shutdown completed');
          process.exit(0);
        } catch (error) {
          console.error('❌ Error during shutdown:', error);
          process.exit(1);
        }
      });
      
      // Force shutdown after 10 seconds
      setTimeout(() => {
        console.error('⚠️ Forcing shutdown after 10 second timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    
  } catch (error) {
    console.error("\n" + "=".repeat(60));
    console.error("❌ FAILED TO START SERVER");
    console.error("=".repeat(60));
    console.error("\nError:", error.message);
    console.error("\nStack trace:");
    console.error(error.stack);
    
    // More detailed error logging
    if (error.name === 'SequelizeConnectionError') {
      console.error("\n💡 Database connection failed.");
      console.error("   Check your DB_URL environment variable.");
      console.error("   Format should be: postgresql://user:password@host:port/database");
    } else if (error.code === 'EADDRINUSE') {
      console.error(`\n💡 Port ${PORT} is already in use.`);
      console.error("   Try using a different port or stop the other process.");
    }
    
    console.error("\n" + "=".repeat(60) + "\n");
    process.exit(1);
  }
};

// ============================================
// Process Error Handlers
// ============================================

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('\n❌ UNHANDLED PROMISE REJECTION');
  console.error('Error:', err.message);
  console.error('Stack:', err.stack);
  console.error('\n⚠️ This might cause unexpected behavior\n');
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('\n❌ UNCAUGHT EXCEPTION');
  console.error('Error:', err.message);
  console.error('Stack:', err.stack);
  console.error('\n⚠️ Process will exit\n');
  process.exit(1);
});

// Log when process exits
process.on('exit', (code) => {
  console.log(`\n👋 Process exited with code: ${code}\n`);
});

// ============================================
// Start the Server
// ============================================
startServer();