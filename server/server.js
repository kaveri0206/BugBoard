/**
 * @file server.js
 * @description Application entry point. Connects to MongoDB and starts the HTTP listener.
 */

const app = require('./app');
const mongoose = require('mongoose');
const env = require('./config/env');

const PORT = env.PORT || 5000;

// Connect to MongoDB
mongoose
  .connect(env.MONGO_URI)
  .then(() => {
    console.log(`[DB] MongoDB Connected: ${mongoose.connection.host}/${mongoose.connection.name}`);
    app.listen(PORT, () => {
      console.log(`[BUGBOARD SERVER] Running on port ${PORT} in ${env.NODE_ENV || 'development'} mode.`);
    });
  })
  .catch((err) => {
    console.error('[DB] Connection error:', err.message);
    process.exit(1);
  });