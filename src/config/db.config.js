const { Sequelize } = require('sequelize');
require("dotenv").config()
const logger = require("../utils/logger")

// Connect to the 'usof-backend' database using the new user 'test-usof-user'
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    logging: false, // Disable logging
});

sequelize
    .authenticate()
    .then(() => {
        logger.info('Connection to the database established successfully.')
    })
    .catch((err) => {
        logger.error('Unable to connect to the new database:', err)
    })

module.exports = sequelize
