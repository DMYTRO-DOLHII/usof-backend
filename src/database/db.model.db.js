const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('./db.config');

// User entity
const User = sequelize.define('User', {
    login: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            notEmpty: true,
        },
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    fullName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true,
        },
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true,
        },
    },
    profilePicture: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    rating: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    role: {
        type: DataTypes.ENUM('admin', 'user'),
        defaultValue: 'user',
    },
}, {
    timestamps: false,
});

// Post entity
const Post = sequelize.define('Post', {
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    publishDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    status: {
        type: DataTypes.ENUM('active', 'inactive'),
        defaultValue: 'active',
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
}, {
    timestamps: false,
});

// Category entity
const Category = sequelize.define('Category', {
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
}, {
    timestamps: false,
});

// Comment entity
const Comment = sequelize.define('Comment', {
    publishDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
}, {
    timestamps: false,
});

// Like entity
const Like = sequelize.define('Like', {
    publishDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    type: {
        type: DataTypes.ENUM('like', 'dislike'),
        allowNull: false,
    },
}, {
    timestamps: false,
});

// Export all entities
module.exports = {
    User,
    Post,
    Category,
    Comment,
    Like
};
