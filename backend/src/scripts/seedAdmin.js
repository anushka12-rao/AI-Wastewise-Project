const bcrypt = require('bcryptjs');
const env = require('../config/environment');
const { connectDB, disconnectDB } = require('../config/database');
const { AdminUser } = require('../models/AdminUser');
const logger = require('../utils/logger');

async function seedAdmin() {
  try {
    await connectDB();

    const email = env.ADMIN_EMAIL.toLowerCase().trim();
    const password = env.ADMIN_PASSWORD;

    if (!email || !password) {
      throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD must be set in environment');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const existing = await AdminUser.findOne({ email });
    if (existing) {
      existing.passwordHash = passwordHash;
      await existing.save();
      logger.info(`Admin user [${email}] updated successfully`);
    } else {
      await AdminUser.create({
        email,
        passwordHash
      });
      logger.info(`Admin user [${email}] created successfully`);
    }

    console.log(`[SeedAdmin] Successfully configured admin user: ${email}`);
  } catch (error) {
    logger.error('Error seeding admin user:', { error: error.message });
    console.error('SeedAdmin failed:', error.message);
  } finally {
    await disconnectDB();
  }
}

if (require.main === module) {
  seedAdmin();
}

module.exports = { seedAdmin };
