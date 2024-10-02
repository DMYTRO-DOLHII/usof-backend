const { Sequelize } = require('sequelize');
require("dotenv").config();
const logger = require("../utils/logger");

// Connect to PostgreSQL using the default admin user
const sequelize = new Sequelize(process.env.DB_ADMIN_USER, process.env.DB_ADMIN_DB, process.env.DB_ADMIN_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    logging: false, // Disable logging
});

const createUserAndDatabase = async () => {
    try {
        await sequelize.authenticate();
        logger.info('Connection to default database established successfully.');

        // Create a new user 'test-usof-user' with the password 'test'
        await sequelize.query(`
      CREATE USER "test-usof-user" WITH PASSWORD 'test';
    `);

        // Create the database 'usof-backend'
        await sequelize.query(`
      CREATE DATABASE "usof-backend";
    `);

        // Grant privileges to the new user on the new database
        await sequelize.query(`
      GRANT ALL PRIVILEGES ON DATABASE "usof-backend" TO "test-usof-user";
    `);

        logger.info('User and database created successfully.');
    } catch (error) {
        logger.error('Error creating user and database:', error);
    } finally {
        await sequelize.close();
    }
};

createUserAndDatabase();
