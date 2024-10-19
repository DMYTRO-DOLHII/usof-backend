const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');
const { validate } = require('uuid');
const logger = require('../utils/logger');

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
    emailConfirmed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
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

// Relationships
Post.belongsTo(User, { as: 'user', foreignKey: 'userId'});
Post.belongsToMany(Category, { through: 'PostCategories', as: 'categories' });
Post.hasMany(Comment, { foreignKey: 'postId', as: 'comments' });
Post.hasMany(Like, { foreignKey: 'postId', as: 'likes' });

Comment.belongsTo(Post, { foreignKey: 'postId' });

Like.belongsTo(Post, { foreignKey: 'postId' });

Category.belongsToMany(Post, { through: 'PostCategories', as: 'posts' });

(async () => {
    try {
        await sequelize
            .sync({ force: false })
            .then(() => {
                logger.info("Tables created successfully");
            })
            .catch((error) => {
                logger.error(error.message);
            });
    } catch (error) {
        logger.error(error.message);
    }
})();

module.exports = {
    User,
    Post,
    Category,
    Comment,
    Like
};
