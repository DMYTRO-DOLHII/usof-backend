const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');
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
        defaultValue: false,
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
    status: {
        type: DataTypes.ENUM('active', 'inactive'),
        defaultValue: 'active',
    }
}, {
    timestamps: false,
});

const Reply = sequelize.define('Reply', {
    content: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    publishDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
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

const Favourite = sequelize.define('Favourite', {
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    postId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
}, {
    timestamps: false,
});

// Relationships
// Post relationships
Post.belongsTo(User, { as: 'user', foreignKey: 'userId', onDelete: 'CASCADE' }); // Each post belongs to a user (author)
Post.belongsToMany(Category, { through: 'PostCategories', as: 'categories' }); // Many-to-Many between Post and Category
Post.hasMany(Comment, { foreignKey: 'postId', as: 'comments', onDelete: 'CASCADE' }); // Each post can have multiple comments
Post.hasMany(Like, { foreignKey: 'postId', as: 'likes', onDelete: 'CASCADE' }); // Each post can have multiple likes

// Category relationships
Category.belongsToMany(Post, { through: 'PostCategories', as: 'posts' }); // Many-to-Many between Category and Post

// Comment relationships
Comment.belongsTo(Post, { foreignKey: 'postId', as: 'post', onDelete: 'CASCADE' }); // Each comment belongs to a post
Comment.belongsTo(User, { foreignKey: 'userId', as: 'user', onDelete: 'CASCADE' }); // Each comment belongs to a user (author)
Comment.hasMany(Like, { foreignKey: 'commentId', as: 'likes', onDelete: 'CASCADE' });
Comment.hasMany(Reply, { foreignKey: 'commentId', as: 'replies', onDelete: 'CASCADE' }); // Each comment can have multiple replies

// Reply relationships
Reply.belongsTo(Comment, { foreignKey: 'commentId', as: 'comment', onDelete: 'CASCADE' }); // Each reply belongs to a single comment
Reply.belongsTo(User, { foreignKey: 'userId', as: 'user', onDelete: 'CASCADE' }); // Each reply belongs to a user (author)

// Like relationships
Like.belongsTo(Post, { foreignKey: 'postId', as: 'post', onDelete: 'CASCADE' }); // Each like belongs to a post
Like.belongsTo(User, { foreignKey: 'userId', as: 'user', onDelete: 'CASCADE' }); // Each like belongs to a user (author)
Like.belongsTo(Comment, { foreignKey: 'commentId', as: 'comment', onDelete: 'CASCADE' });

// Favorite relationships
Favourite.belongsTo(User, { foreignKey: 'userId', onDelete: 'CASCADE' }); // Each Favourite belongs to a user
Favourite.belongsTo(Post, { foreignKey: 'postId', onDelete: 'CASCADE' }); // Each Favourite belongs to a post

// Sync database and tables
(async () => {
    try {
        await sequelize
            .sync({ force: false }) // Set force: true for recreating tables during development
            .then(() => {
                logger.info("Tables created successfully");
            })
            .catch((error) => {
                logger.error("Error creating tables: ", error.message);
            });
    } catch (error) {
        logger.error("Error during table synchronization: ", error.message);
    }
})();

module.exports = {
    User,
    Post,
    Category,
    Comment,
    Reply,
    Like,
    Favourite
};
