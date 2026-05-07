const dotenv = require('dotenv');
const path = require('path');

// Load env vars from .env file
dotenv.config({ path: path.join(__dirname, '../.env') });

const config = {
  PORT: process.env.PORT || 5000,
  MONGODB_URI: process.env.MONGODB_URI,
  JWT_SECRET: process.env.JWT_SECRET || 'fallback_secret_key',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  NODE_ENV: process.env.NODE_ENV || 'development',
};

module.exports = config;
