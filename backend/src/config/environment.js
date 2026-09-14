const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

module.exports = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/ai_wastewise',
  SESSION_SECRET: process.env.SESSION_SECRET || 'wastewise_dev_secret_key_32_characters_minimum',
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'admin@wastewise.org',
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'AdminWasteWise#2026',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
  WATSONX_API_KEY: process.env.WATSONX_API_KEY || '',
  WATSONX_PROJECT_ID: process.env.WATSONX_PROJECT_ID || '',
  WATSONX_URL: process.env.WATSONX_URL || 'https://us-south.ml.cloud.ibm.com',
  WATSONX_SIMULATION_MODE: process.env.WATSONX_SIMULATION_MODE !== 'false',
  IDENTIFICATION_CONFIDENCE_THRESHOLD: parseFloat(process.env.IDENTIFICATION_CONFIDENCE_THRESHOLD || '0.70'),
  RETRIEVAL_SCORE_THRESHOLD: parseFloat(process.env.RETRIEVAL_SCORE_THRESHOLD || '0.65'),
  LANCEDB_PATH: process.env.LANCEDB_PATH || path.join(__dirname, '../../data/lancedb')
};
