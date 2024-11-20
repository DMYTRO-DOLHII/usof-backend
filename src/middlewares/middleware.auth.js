const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');
const UserModel = require('../models/model.user');
const PostModel = require('../models/model.post');
const CommentModel = require('../models/model.comment');
const { Reply } = require('../database/db.model.db');
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
        return res.status(403).json({ message: 'Admin access required' }); w
    }
    next();
};

const authorizePostCreator = async (req, res, next) => {
    try {
        const { post_id } = req.params;
        const userId = req.user.id;
        const userRole = req.user.role;

        const post = await PostModel.findById(post_id)

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        if (post.userId === userId || userRole === 'admin') {
            return next();
        } else {
            return res.status(403).json({ message: 'Not authorized to perform this action' });
        }
    } catch (error) {
        logger.error(`Authorization error: ${error.message}`);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

const authorizeCommentCreator = async (req, res, next) => {
    try {
        const { comment_id } = req.params;
        const userId = req.user.id;
        const userRole = req.user.role;

        const comment = await CommentModel.findById(comment_id);

        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        if (comment.userId === userId || userRole === 'admin') {
            return next();
        } else {
            return res.status(403).json({ message: 'Not authorized to perform this action' });
        }
    } catch (error) {
        logger.error(`Authorization error: ${error.message}`);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

const authorizeReplyCreator = async (req, res, next) => {
    try {
        const { reply_id } = req.params;
        const userId = req.user.id;
        const userRole = req.user.role;
        
        const reply = await Reply.findByPk(reply_id);


        if (!reply) {
            return res.status(404).json({ message: 'Reply not found' });
        }

        if (reply.userId === userId || userRole === 'admin') {
            return next();
        } else {
            return res.status(403).json({ message: 'Not authorized to perform this action' });
        }
    } catch (error) {
        logger.error(`Authorization error: ${error.message}`);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = { validateToken, isAdmin, authorizePostCreator, authorizeCommentCreator, authorizeReplyCreator };
