const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const env = require('./config/environment');
const logger = require('./utils/logger');

const analyzeRoutes = require('./routes/analyzeRoutes');
const queryRoutes = require('./routes/queryRoutes');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');

const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Security Headers via Helmet
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// CORS origin resolution with credentials support
function isOriginAllowed(origin) {
  if (!origin) return true; // Non-browser clients (curl, mobile, health checks)
  
  const cleanOrigin = origin.replace(/\/+$/, '');
  const cleanFrontend = (env.FRONTEND_URL || '').replace(/\/+$/, '');
  
  if (cleanFrontend && cleanOrigin === cleanFrontend) return true;
  if (cleanOrigin === 'http://localhost:5173' || cleanOrigin === 'http://127.0.0.1:5173' || cleanOrigin === 'http://localhost:3000') return true;
  
  try {
    const { hostname } = new URL(origin);
    if (hostname.endsWith('.onrender.com') || hostname.endsWith('.vercel.app')) {
      return true;
    }
  } catch {
    // Malformed origin URL
  }
  return false;
}

app.use(cors({
  origin: (origin, callback) => {
    if (isOriginAllowed(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked for origin: ${origin}`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Request logging (sanitized)
app.use((req, res, next) => {
  if (env.NODE_ENV !== 'test') {
    logger.info(`${req.method} ${req.url}`);
  }
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  const mongoose = require('mongoose');
  res.status(200).json({
    status: 'healthy',
    database: mongoose.connection.readyState === 1 ? 'connected' : (mongoose.connection.readyState === 2 ? 'connecting' : 'disconnected'),
    service: 'AI WasteWise API',
    sdg: 'SDG 12: Responsible Consumption and Production',
    timestamp: new Date().toISOString()
  });
});

// Mount Routes
app.use('/api/analyze', analyzeRoutes);
app.use('/api/query', queryRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

// Catch 404 & Errors
app.use(notFound);
app.use(errorHandler);

module.exports = app;
