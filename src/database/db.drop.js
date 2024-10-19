const { Sequelize } = require('sequelize');
require("dotenv").config();
const logger = require("../utils/logger");

const sequelize = new Sequelize(process.env.DB_ADMIN_DB, process.env.DB_ADMIN_USER, process.env.DB_ADMIN_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    logging: false,
});

const deleteUserAndDatabase = async () => {
    try {
        await sequelize.authenticate();
        logger.info('Connection to default database established successfully.');

        await sequelize.query(`
            SELECT pg_terminate_backend(pg_stat_activity.pid)
            FROM pg_stat_activity
            WHERE pg_stat_activity.datname = 'usof-backend'
            AND pid <> pg_backend_pid();
        `);
        logger.info('Terminated all active connections to the "usof-backend" database.');

        await sequelize.query(`
            REVOKE ALL PRIVILEGES ON DATABASE "usof-backend" FROM "test-usof-user";
        `);
        logger.info('Revoked all privileges from "test-usof-user".');

        await sequelize.query(`
            REASSIGN OWNED BY "test-usof-user" TO "postgres"; 
        `);
        logger.info('Reassigned ownership of objects from "test-usof-user" to "postgres".');

        await sequelize.query(`
            DROP OWNED BY "test-usof-user";
        `);
        logger.info('Dropped all objects owned by "test-usof-user".');

        await sequelize.query(`
            DROP USER IF EXISTS "test-usof-user";
        `);
        logger.info('User "test-usof-user" deleted successfully.');

        await sequelize.query(`
            DROP DATABASE IF EXISTS "usof-backend";
        `);
        logger.info('Database "usof-backend" dropped successfully.');

    } catch (error) {
        logger.error('Error deleting user or database:', error);
    } finally {
        await sequelize.close();
    }
};

deleteUserAndDatabase();
