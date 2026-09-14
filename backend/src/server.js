const bcrypt = require('bcryptjs');
const app = require('./app');
const env = require('./config/environment');
const { connectDB, disconnectDB } = require('./config/database');
const { getTable, syncAllToVectorStore } = require('./services/vectorStoreService');
const logger = require('./utils/logger');

async function startServer() {
  try {
    // 1. Connect to persistent MongoDB (Atlas, external, or embedded 27017 with wiredTiger)
    await connectDB();

    // 2. Synchronize AdminUser from environment credentials
    try {
      const { AdminUser } = require('./models/AdminUser');
      const email = env.ADMIN_EMAIL.toLowerCase().trim();
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(env.ADMIN_PASSWORD, salt);

      await AdminUser.findOneAndUpdate(
        { email },
        { email, passwordHash },
        { upsert: true, new: true }
      );
      logger.info(`Admin user [${email}] synchronized with environment credentials`);
    } catch (adminErr) {
      logger.warn(`AdminUser sync note: ${adminErr.message}`);
    }

    // 3. Auto-seed Knowledge Base if empty on first startup
    try {
      const { KnowledgeEntry } = require('./models/KnowledgeEntry');
      const count = await KnowledgeEntry.countDocuments();
      if (count === 0) {
        logger.info('Database empty. Performing initial seed of knowledge entries...');
        const { SEED_DATA } = require('./scripts/seedKnowledgeBase');
        await KnowledgeEntry.insertMany(SEED_DATA);
        logger.info(`Auto-seeded ${SEED_DATA.length} categories`);
      }
    } catch (seedErr) {
      logger.warn(`Initial seed check note: ${seedErr.message}`);
    }

    // 4. Initialize LanceDB Vector Table and sync
    try {
      await getTable();
      await syncAllToVectorStore();
      logger.info('LanceDB vector store initialized and synchronized');
    } catch (lErr) {
      logger.warn(`LanceDB initial check note: ${lErr.message}`);
    }

    // 5. Start Express server
    const server = app.listen(env.PORT, '0.0.0.0', () => {
      logger.info(`AI WasteWise Backend running on port ${env.PORT} in [${env.NODE_ENV}] mode`);
      logger.info(`Access Health Check: http://localhost:${env.PORT}/api/health`);
    });

    // Graceful shutdown handling
    const shutdown = async (signal) => {
      logger.info(`Received ${signal}. Shutting down gracefully...`);
      server.close(async () => {
        logger.info('HTTP server closed');
        await disconnectDB();
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    logger.error('Failed to start AI WasteWise server:', { error: error.message });
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}

module.exports = { startServer };
