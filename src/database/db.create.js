const { Sequelize } = require('sequelize');
require("dotenv").config();
const logger = require("../utils/logger");

// Connect to PostgreSQL using the default admin user
const sequelize = new Sequelize(process.env.DB_ADMIN_DB, process.env.DB_ADMIN_USER, process.env.DB_ADMIN_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    logging: false, // Disable logging
});

const createUserAndDatabase = async () => {
    try {
        await sequelize.authenticate();
        logger.info('Connection to default database established successfully.');

        // Check if the user already exists
        const userExists = await sequelize.query(`
            SELECT 1 FROM pg_roles WHERE rolname = '${process.env.DB_USER}';
        `);
        if (userExists[0].length === 0) {
            // If the user doesn't exist, create it
            await sequelize.query(`
                CREATE USER "${process.env.DB_USER}" WITH PASSWORD '${process.env.DB_PASSWORD}';
            `);
            logger.info(`User "${process.env.DB_USER}" created successfully.`);
        } else {
            logger.info(`User "${process.env.DB_USER}" already exists. Skipping user creation.`);
        }

        // Check if the database already exists
        const dbExists = await sequelize.query(`
            SELECT 1 FROM pg_database WHERE datname = '${process.env.DB_NAME}';
        `);
        if (dbExists[0].length === 0) {
            // If the database doesn't exist, create it
            await sequelize.query(`
                CREATE DATABASE "${process.env.DB_NAME}" WITH OWNER = "${process.env.DB_USER}";
            `);
            logger.info(`Database "${process.env.DB_NAME}" created successfully.`);
        } else {
            logger.info(`Database "${process.env.DB_NAME}" already exists. Skipping database creation.`);
        }

        // Now connect to the new database to handle schema and privileges
        const newDbConnection = new Sequelize(process.env.DB_NAME, process.env.DB_ADMIN_USER, process.env.DB_ADMIN_PASSWORD, {
            host: process.env.DB_HOST,
            dialect: 'postgres',
            logging: false, // Disable logging
        });

        // Check if the public schema is already owned by the user
        const schemaOwner = await newDbConnection.query(`
            SELECT nspname, usename
            FROM pg_namespace
            JOIN pg_user ON pg_namespace.nspowner = pg_user.usesysid
            WHERE nspname = 'public';
        `);

        if (schemaOwner[0].length > 0 && schemaOwner[0][0].usename !== process.env.DB_USER) {
            // If the public schema exists but isn't owned by the user, transfer ownership
            await newDbConnection.query(`
                ALTER SCHEMA public OWNER TO "${process.env.DB_USER}";
                GRANT USAGE, CREATE ON SCHEMA public TO "${process.env.DB_USER}";
            `);
            logger.info(`Ownership of the public schema transferred to "${process.env.DB_USER}" and privileges granted.`);
        } else {
            logger.info(`"${process.env.DB_USER}" already owns the public schema or ownership is correct. Skipping ownership transfer.`);
        }

        // Ensure the user has all privileges on tables and sequences in the public schema
        await newDbConnection.query(`
            ALTER DEFAULT PRIVILEGES IN SCHEMA public 
            GRANT ALL ON TABLES TO "${process.env.DB_USER}";
            ALTER DEFAULT PRIVILEGES IN SCHEMA public 
            GRANT ALL ON SEQUENCES TO "${process.env.DB_USER}";
        `);
        logger.info(`Default privileges on tables and sequences granted to "${process.env.DB_USER}".`);
    } catch (error) {
        logger.error('Error creating user and database:', error);
    } finally {
        await sequelize.close();
    }
};

createUserAndDatabase();
