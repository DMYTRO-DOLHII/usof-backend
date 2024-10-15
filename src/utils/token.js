const jwt = require('jsonwebtoken');
const { SECRET_KEY } = process.env;

const generateToken = (user) => {
    return jwt.sign({ id: user.id, login: user.login, role: user.role }, SECRET_KEY, { expiresIn: '1h' });
};

module.exports = generateToken;