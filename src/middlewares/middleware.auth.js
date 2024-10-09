const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');
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

module.exports = { validateToken, isAdmin };
