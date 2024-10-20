const { Sequelize } = require('sequelize');
require("dotenv").config();
const logger = require("../utils/logger");

// Connect to PostgreSQL using the default admin user
const sequelize = new Sequelize(process.env.DB_ADMIN_DB, process.env.DB_ADMIN_USER, process.env.DB_ADMIN_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    logging: false, // Disable logging
});

const deleteUserAndDatabase = async () => {
    try {
        await sequelize.authenticate();
        logger.info('Connection to default database established successfully.');

        // Check if the database exists before attempting to drop it
        const dbExists = await sequelize.query(`
            SELECT 1 FROM pg_database WHERE datname = '${process.env.DB_NAME}';
        `);
        if (dbExists[0].length > 0) {
            // If the database exists, drop it
            await sequelize.query(`
                DROP DATABASE IF EXISTS "${process.env.DB_NAME}";
            `);
            logger.info(`Database "${process.env.DB_NAME}" dropped successfully.`);
        } else {
            logger.info(`Database "${process.env.DB_NAME}" does not exist. Skipping database drop.`);
        }

        // Check if the user exists before attempting to drop it
        const userExists = await sequelize.query(`
            SELECT 1 FROM pg_roles WHERE rolname = '${process.env.DB_USER}';
        `);
        if (userExists[0].length > 0) {
            // Check if the user owns any objects in the database before dropping it
            const dependentObjects = await sequelize.query(`
                SELECT COUNT(*) FROM pg_class
                WHERE relowner = (SELECT usesysid FROM pg_user WHERE usename = '${process.env.DB_USER}');
            `);

            if (dependentObjects[0][0].count === '0') {
                // If no dependent objects, drop the user
                await sequelize.query(`
                    DROP USER IF EXISTS "${process.env.DB_USER}";
                `);
                logger.info(`User "${process.env.DB_USER}" dropped successfully.`);
            } else {
                logger.warn(`User "${process.env.DB_USER}" owns objects and cannot be dropped.`);
            }
        } else {
            logger.info(`User "${process.env.DB_USER}" does not exist. Skipping user drop.`);
        }

    } catch (error) {
        logger.error('Error deleting user or database:', error);
    } finally {
        await sequelize.close();
    }
};

deleteUserAndDatabase();
