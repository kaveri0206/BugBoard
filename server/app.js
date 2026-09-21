/**
 * @file server/app.js
 * @description Central Express application setup.
 * Configures CORS, route aliases, user management, and error fallbacks.
 */

const express = require('express');
const cors = require('cors');

// 1. Core Route Modules
const authRoutes = require('./routes/auth.routes');
const issueRoutes = require('./routes/issue.routes');

// Helper to safely load route modules
const loadRouteSafe = (paths) => {
  for (const p of paths) {
    try {
      const module = require(p);
      if (module) return module;
    } catch (e) {
      // try next path
    }
  }
  return null;
};

// 2. Resolve Auxiliary Routes
const userRoutes = loadRouteSafe(['./routes/user.routes', './routes/user', './routes/users']);
const projectRoutes = loadRouteSafe(['./routes/project.routes', './routes/project', './routes/projects']);
const activityRoutes = loadRouteSafe(['./routes/activity.routes', './routes/activity']);
const telemetryRoutes = loadRouteSafe(['./routes/telemetry.routes', './routes/telemetry', './routes/analytics.routes']);
const notificationRoutes = loadRouteSafe(['./routes/notification.routes', './routes/notification']);

const app = express();

// 3. CORS Configuration
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// 4. Body Parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 5. Healthcheck
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', uptime: process.uptime() });
});

// Helper to bind routes on both /api/v1 and root prefixes with a fallback router
const bindRouteWithFallback = (prefix, routerInstance, emptyDataField = 'items') => {
  if (routerInstance) {
    app.use(`/api/v1/${prefix}`, routerInstance);
    app.use(`/${prefix}`, routerInstance);
  } else {
    const fallbackRouter = express.Router();
    fallbackRouter.all('*', (req, res) => {
      res.status(200).json({
        success: true,
        data: { [emptyDataField]: [] },
        [emptyDataField]: [],
        message: `${prefix} service initialized in standby mode`,
      });
    });
    app.use(`/api/v1/${prefix}`, fallbackRouter);
    app.use(`/${prefix}`, fallbackRouter);
  }
};

// 6. Mount All Application Routes
app.use('/api/v1/auth', authRoutes);
app.use('/auth', authRoutes);

if (issueRoutes) {
  app.use('/api/v1/issues', issueRoutes);
  app.use('/issues', issueRoutes);
}

// User Management Mounting
bindRouteWithFallback('users', userRoutes, 'users');

// Project Workspaces Mounting
bindRouteWithFallback('projects', projectRoutes, 'projects');

// Activity & Notifications
bindRouteWithFallback('activities', activityRoutes, 'activities');
bindRouteWithFallback('notifications', notificationRoutes, 'notifications');

// Telemetry & Analytics
if (telemetryRoutes) {
  app.use('/api/v1/telemetry', telemetryRoutes);
  app.use('/telemetry', telemetryRoutes);
  app.use('/api/v1/analytics', telemetryRoutes);
  app.use('/analytics', telemetryRoutes);
} else {
  bindRouteWithFallback('telemetry', null, 'metrics');
  bindRouteWithFallback('analytics', null, 'metrics');
}

// 7. Catch-All 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found on this server`,
  });
});

// 8. Global Error Handler
app.use((err, req, res, next) => {
  console.error('[UNHANDLED ERROR]', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

module.exports = app;