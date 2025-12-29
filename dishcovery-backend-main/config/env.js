// app/config/env.js - UPDATED with correct Render URL
/**
 * Environment Configuration
 * Automatically switches between development and production based on __DEV__ flag
 */

const ENV = {
  // Local development (when running expo start)
  development: {
    API_URL: 'http://localhost:5000/api',
    TIMEOUT: 30000,
    DEBUG: true,
  },
  
  // Production (deployed app) - USING YOUR ACTUAL RENDER URL
  production: {
    // ✅ CORRECTED: Using your actual Render deployment URL
    API_URL: 'https://dishcovery-backend-ln31.onrender.com/api',
    TIMEOUT: 30000,
    DEBUG: false,
  },
};

/**
 * Get environment variables based on current mode
 * @returns {object} Environment configuration
 */
const getEnvVars = () => {
  // __DEV__ is automatically set by React Native
  // true when running in development, false in production
  if (__DEV__) {
    console.log('🔧 Running in DEVELOPMENT mode');
    console.log('📍 API URL:', ENV.development.API_URL);
    return ENV.development;
  }
  
  console.log('🚀 Running in PRODUCTION mode');
  console.log('📍 API URL:', ENV.production.API_URL);
  return ENV.production;
};

// Export the appropriate environment config
const config = getEnvVars();

// Also export individual values for convenience
export const API_URL = config.API_URL;
export const API_TIMEOUT = config.TIMEOUT;
export const DEBUG_MODE = config.DEBUG;

export default config;