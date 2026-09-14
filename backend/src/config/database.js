const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const env = require('./environment');
const logger = require('../utils/logger');

let isConnected = false;
let embeddedServer = null;

async function startEmbeddedMongo() {
  if (embeddedServer) return embeddedServer;

  const { MongoMemoryServer } = require('mongodb-memory-server');
  const dbDir = path.resolve(__dirname, '../../data/db');
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  logger.info(`Starting persistent embedded MongoDB server on port 27017 with storage at ${dbDir}...`);
  embeddedServer = await MongoMemoryServer.create({
    instance: {
      dbPath: dbDir,
      port: 27017,
      storageEngine: 'wiredTiger'
    }
  });

  return embeddedServer;
}

async function connectDB() {
  if (isConnected && mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  const targetUri = env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ai_wastewise';

  // 1. Try to connect to targetUri directly (e.g. Atlas or already running local MongoDB)
  try {
    const timeoutMs = env.NODE_ENV === 'production' ? 10000 : 2500;
    const conn = await mongoose.connect(targetUri, {
      serverSelectionTimeoutMS: timeoutMs,
      autoIndex: true
    });

    isConnected = true;
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    // 2. If unreachable and in development/test, launch embedded persistent MongoDB on 27017
    if (env.NODE_ENV !== 'production') {
      try {
        await startEmbeddedMongo();
        const conn = await mongoose.connect(targetUri, {
          serverSelectionTimeoutMS: 5000,
          autoIndex: true
        });
        isConnected = true;
        logger.info(`Persistent embedded MongoDB connected on port 27017`);
        return conn;
      } catch (embErr) {
        logger.error(`Failed to start/connect embedded MongoDB: ${embErr.message}`);
      }
    }

    if (env.NODE_ENV === 'production') {
      logger.error(`MongoDB connection error: ${error.message}. Ensure MONGODB_URI is correctly configured in your hosting environment.`);
      process.exit(1);
    }
    return null;
  }
}

async function disconnectDB() {
  if (isConnected) {
    await mongoose.disconnect();
    isConnected = false;
    logger.info('MongoDB disconnected cleanly');
  }
  if (embeddedServer) {
    try {
      await embeddedServer.stop();
      embeddedServer = null;
      logger.info('Embedded MongoDB server stopped');
    } catch (stopErr) {
      logger.warn(`Embedded MongoDB stop note: ${stopErr.message}`);
    }
  }
}

module.exports = { connectDB, disconnectDB };
