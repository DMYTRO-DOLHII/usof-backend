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

        // Terminate any active connections to the target database
        await sequelize.query(`
            SELECT pg_terminate_backend(pid)
            FROM pg_stat_activity
            WHERE datname = '${process.env.DB_NAME}' AND pid <> pg_backend_pid();
        `);
        logger.info(`Terminated active connections to database "${process.env.DB_NAME}".`);

        // Check if the database exists before attempting to drop it
        const dbExists = await sequelize.query(`
            SELECT 1 FROM pg_database WHERE datname = '${process.env.DB_NAME}';
        `);
        if (dbExists[0].length > 0) {
            // Drop the database if it exists
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
            // Check if the user owns any objects in the database before dropping
            const dependentObjects = await sequelize.query(`
                SELECT COUNT(*) FROM pg_class
                WHERE relowner = (SELECT oid FROM pg_roles WHERE rolname = '${process.env.DB_USER}');
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
