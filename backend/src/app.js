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

// CORS locked to frontend origin with cookie credentials support
const allowedOrigins = [
  env.FRONTEND_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173'
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, postman)
    if (!origin || allowedOrigins.includes(origin)) {
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
  res.status(200).json({
    status: 'healthy',
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
