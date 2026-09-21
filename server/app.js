/**
 * @file server/app.js
 * @description Central Express application setup.
 * Configures CORS, middleware, route mounting with fallback aliasing,
 * and global error handling for production environments.
 */

const express = require('express');
const cors = require('cors');

// Import route modules
const authRoutes = require('./routes/auth.routes');
const issueRoutes = require('./routes/issue.routes');

// Safely load activity and telemetry routes if they exist
let activityRoutes;
try {
  activityRoutes = require('./routes/activity.routes');
} catch (e) {
  activityRoutes = null;
}

let telemetryRoutes;
try {
  telemetryRoutes = require('./routes/telemetry.routes');
} catch (e) {
  telemetryRoutes = null;
}

const app = express();

// 1. CORS Configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://bug-board-nu.vercel.app',
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
        callback(null, true);
      } else {
        // Fallback allows requests from other staging or preview deployment branches
        callback(null, true);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// 2. Body Parsing Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. Healthcheck Endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', uptime: process.uptime() });
});

// 4. Mount Routes with dual prefixes (/api/v1 and root fallback)
// This guarantees /auth/login and /api/v1/auth/login both work seamlessly.
app.use('/api/v1/auth', authRoutes);
app.use('/auth', authRoutes);

if (issueRoutes) {
  app.use('/api/v1/issues', issueRoutes);
  app.use('/issues', issueRoutes);
}

if (activityRoutes) {
  app.use('/api/v1/activities', activityRoutes);
  app.use('/activities', activityRoutes);
}

if (telemetryRoutes) {
  app.use('/api/v1/telemetry', telemetryRoutes);
  app.use('/telemetry', telemetryRoutes);
}

// 5. Catch-All 404 Handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found on this server`,
  });
});

// 6. Global Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('[UNHANDLED ERROR]', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

module.exports = app;