const sequelize = require('../config/db.config');
const User = require('../models/model.user');
const logger = require("../utils/logger");

const initDB = async () => {
    try {
        // Synchronize all defined models with the database
        await sequelize.sync({ force: true });  // `force: true` drops the table if it already exists
        logger.info('Database synced successfully!');

        // You can add some test data after syncing if necessary:
        const user = await User.create({
            login: 'testuser',
            email: 'testuser@example.com',
            password: '123',
        });

        logger.info('Test user created:', user.toJSON());
    } catch (error) {
        logger.error('Failed to sync the database:', error);
    } finally {
        await sequelize.close();
    }
};

initDB();
