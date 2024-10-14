const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');
const Post = require('../models/model.post');
const { SECRET_KEY } = process.env;

const validateToken = (req, res, next) => {
    const token = req.headers['authorization'];

    if (!token) {
        logger.warn('No token provided');
        return res.status(401).json({ error: 'Unauthorized. No token provided.' });
    }

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) {
            logger.error(`Invalid token: ${err.message}`);
            return res.status(401).json({ error: 'Unauthorized. Invalid token.' });
        }

        req.user = decoded;
        logger.info(`Token verified. User ID: ${decoded.id}`);
        next();
    });
};

const isAdmin = async (req, res, next) => {
    const user = await UserModel.findById(req.user.id);
    if (user.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
    }
    next();
};

// Middleware to ensure the user is the post creator
const authorizePostCreator =  (req, res, next) => {
    const { post_id } = req.params;
    try {
        const post = Post.findByPk(post_id);
        if (post.userId !== req.user.id) {
            return res.status(403).json({ message: 'You are not authorized to modify this post' });
        }
        next();
    } catch (error) {
        return res.status(500).json({ message: 'Server error. Please try again later.' });
    }
};


module.exports = { validateToken, isAdmin, authorizePostCreator };
