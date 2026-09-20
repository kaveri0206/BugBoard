const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const env = require('./config/env');
const routes = require('./routes');
const errorHandler = require('./middleware/error.middleware');
const { apiLimiter } = require('./middleware/rateLimiter.middleware');

const app = express();

// Trust reverse proxy for correct client IP detection in local & cloud environments
app.set('trust proxy', 1);

// Security Headers
app.use(helmet({ crossOriginResourcePolicy: false }));

// CORS Policy
app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Logging
if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Request Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static local uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Apply global rate limiter only to general API routes (auth routes use their own dedicated limiter)
app.use('/api', apiLimiter);

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Mount Routes
app.use('/api/v1', routes);

// 404 Route Catcher
app.use('*', (req, res, next) => {
  const ApiError = require('./utils/apiError');
  next(new ApiError(404, `Cannot find route: ${req.originalUrl}`));
});

// Centralized Error Middleware
app.use(errorHandler);

module.exports = app;