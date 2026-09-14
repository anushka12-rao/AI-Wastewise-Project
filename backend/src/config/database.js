const mongoose = require('mongoose');
const env = require('./environment');
const logger = require('../utils/logger');

let isConnected = false;

async function connectDB() {
  if (isConnected) {
    return mongoose.connection;
  }

  try {
    const conn = await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 2500,
      autoIndex: true
    });

    isConnected = true;
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    logger.warn(`External MongoDB (${env.MONGODB_URI}) unreachable: ${error.message}`);
    
    // In development or test, fall back to in-memory MongoDB so demo runs seamlessly out of the box
    if (env.NODE_ENV !== 'production') {
      try {
        const { MongoMemoryServer } = require('mongodb-memory-server');
        logger.info('Initializing embedded in-memory MongoDB server for local run...');
        const memServer = await MongoMemoryServer.create();
        const uri = memServer.getUri();
        const conn = await mongoose.connect(uri);
        isConnected = true;
        logger.info(`In-Memory MongoDB successfully connected: ${uri}`);
        return conn;
      } catch (memErr) {
        logger.error(`Embedded MongoDB startup failed: ${memErr.message}`);
      }
    }

    if (env.NODE_ENV === 'production') {
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
}

module.exports = { connectDB, disconnectDB };
