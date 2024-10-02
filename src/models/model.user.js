const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');

const User = sequelize.define('User', {
    // Primary Key≈
    id: {
        type: DataTypes.UUID, // UUID is often a good choice for user IDs
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
    },
    // login field
    login: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    // Email field
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true,
        },
    },
    // Password field
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    // Role field (e.g., 'admin', 'user')
    role: {
        type: DataTypes.ENUM('user', 'admin'),
        allowNull: false,
        defaultValue: 'user',
    },
    // Timestamps field (to store when the user is created/updated)
}, {
    timestamps: true,  // Adds createdAt and updatedAt fields
    tableName: 'users', // Table name in PostgreSQL
});

module.exports = User;
