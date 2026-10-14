require('dotenv').config();

const app = require('./src/app');
const connectDatabase = require('./src/config/database');
const seedDemoData = require('./scripts/seedDemo');

const port = Number(process.env.PORT) || 5000;
let server;
let isShuttingDown = false;

async function startServer() {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be configured with at least 32 characters');
  }

  await connectDatabase();
  if (process.env.SEED_DEMO_DATA === 'true') {
    await seedDemoData();
  }

  server = app.listen(port, () => {
    console.log(`Marketplace API listening on port ${port}`);
  });
}

async function shutdown(signal) {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;
  console.log(`${signal} received; shutting down gracefully`);

  try {
    if (server) {
      await new Promise((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
      });
    }

    const mongoose = require('mongoose');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error during graceful shutdown:', error);
    process.exit(1);
  }
}

process.once('SIGINT', () => shutdown('SIGINT'));
process.once('SIGTERM', () => shutdown('SIGTERM'));

startServer().catch(async (error) => {
  console.error('Failed to start the marketplace API:', error);

  const mongoose = require('mongoose');
  await mongoose.disconnect();
  process.exitCode = 1;
});
