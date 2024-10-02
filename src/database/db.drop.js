const { Sequelize } = require('sequelize');
require("dotenv").config();
const logger = require("../utils/logger");

// Connect to PostgreSQL using the default admin user
const sequelize = new Sequelize(process.env.DB_ADMIN_USER, process.env.DB_ADMIN_DB, process.env.DB_ADMIN_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    logging: false, // Disable logging
});

const deleteUserAndDatabase = async () => {
    try {
        await sequelize.authenticate();
        logger.info('Connection to default database established successfully.');

        // Drop the database 'usof-backend' (disconnecting all users first)
        await sequelize.query(`
            DROP DATABASE IF EXISTS "usof-backend";
        `);
        logger.info('Database "usof-backend" dropped successfully.');

        // Drop the user 'test-usof-user'
        await sequelize.query(`
            DROP USER IF EXISTS "test-usof-user";
        `);
        logger.info('User "test-usof-user" deleted successfully.');
    } catch (error) {
        logger.error('Error deleting user or database:', error);
    } finally {
        await sequelize.close();
    }
};

deleteUserAndDatabase();
