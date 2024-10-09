const jwt = require('jsonwebtoken');

const generateToken = (user) => {
    return jwt.sign({ id: user.id, login: user.login, role: user.role }, "ZALUPA", { expiresIn: '1h' });
};

module.exports = generateToken;