const app = require('./app');
const env = require('./config/environment');
const { connectDB } = require('./config/database');
const { getTable, syncAllToVectorStore } = require('./services/vectorStoreService');
const logger = require('./utils/logger');

async function startServer() {
  try {
    // 1. Connect to MongoDB Atlas / local MongoDB
    await connectDB();

    // 2. Auto-seed if database is empty on first startup
    try {
      const { KnowledgeEntry } = require('./models/KnowledgeEntry');
      const count = await KnowledgeEntry.countDocuments();
      if (count === 0) {
        logger.info('Database empty. Performing initial seed of admin user and knowledge entries...');
        const { SEED_DATA } = require('./scripts/seedKnowledgeBase');
        await KnowledgeEntry.insertMany(SEED_DATA);
        
        const { AdminUser } = require('./models/AdminUser');
        const bcrypt = require('bcryptjs');
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(env.ADMIN_PASSWORD, salt);
        await AdminUser.create({ email: env.ADMIN_EMAIL, passwordHash });
        
        logger.info(`Auto-seeded ${SEED_DATA.length} categories and admin user [${env.ADMIN_EMAIL}]`);
      }
    } catch (seedErr) {
      logger.warn(`Initial seed check note: ${seedErr.message}`);
    }

    // 3. Initialize LanceDB Vector Table and sync
    try {
      await getTable();
      await syncAllToVectorStore();
      logger.info('LanceDB vector store initialized and synchronized');
    } catch (lErr) {
      logger.warn(`LanceDB initial check note: ${lErr.message}`);
    }

    // 3. Start Express server
    const server = app.listen(env.PORT, () => {
      logger.info(`AI WasteWise Backend running on port ${env.PORT} in [${env.NODE_ENV}] mode`);
      logger.info(`Access Health Check: http://localhost:${env.PORT}/api/health`);
    });

    // Graceful shutdown handling
    const shutdown = async (signal) => {
      logger.info(`Received ${signal}. Shutting down gracefully...`);
      server.close(() => {
        logger.info('HTTP server closed');
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
