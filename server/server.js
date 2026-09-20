const app = require('./app');
const env = require('./config/env');
const connectDB = require('./config/db');

const startServer = async () => {
  await connectDB();

  const server = app.listen(env.PORT, () => {
    console.log(`[BUGBOARD SERVER] Running on port ${env.PORT} in ${env.NODE_ENV} mode.`);
  });

  const shutdown = () => {
    console.log('[BUGBOARD SERVER] Graceful shutdown initiated...');
    server.close(() => {
      console.log('[BUGBOARD SERVER] Process terminated cleanly.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
};

startServer();