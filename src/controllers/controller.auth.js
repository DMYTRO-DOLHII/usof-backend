const bcrypt = require('bcrypt');
const UserModel = require('../models/model.user');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const generateToken = require('../utils/token');
const { sendConfirmationEmail } = require('../utils/email');
const crypto = require('crypto');
const { doesNotMatch } = require('assert');
const logger = require('../utils/logger');

exports.registerUser = async (req, res) => {
    const { login, email, fullName, password, confirmPassword } = req.body;

    if (!login || !password || !confirmPassword || !email || !fullName) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    if (!validator.isEmail(email)) {
        return res.status(400).json({ message: 'Invalid email format' });
    }

    try {
        const user = UserModel.register({
            login: login,
            email: email,
            fullName: fullName,
            password: password
        });

        await sendConfirmationEmail(email, login);

        return res.status(201).json({ message: 'User registered successfully. Please confirm your email.' });
    } catch (error) {
        return res.status(500).json({ message: 'Server error. Please try again later.' });
    }
};

exports.loginUser = async (req, res) => {
    const { login, email, password } = req.body;

    if (!login || !email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        const response = await UserModel.login({ login: login, email: email, password: password });
        res.status(response.status).json( { message: response.message, token: response.token});
    } catch (error) {
        return res.status(500).json({ message: 'Server error. Please try again later.' });
    }
};

exports.logoutUser = async (req, res) => {

    return res.status(200).json({ message: 'Logout successful' });
};

exports.requestPasswordReset = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: 'Email is required' });
    }

    try {
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(404).json({ message: 'No user found with this email' });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenHash = await bcrypt.hash(resetToken, 10);

        user.resetToken = resetTokenHash;
        await user.save();

        const resetLink = `${process.env.FRONTEND_URL}/password-reset/${resetToken}`;


        return res.status(200).json({ message: 'Password reset link sent to email' });
    } catch (error) {
        return res.status(500).json({ message: 'Server error. Please try again later.' });
    }
};

exports.confirmPasswordReset = async (req, res) => {
    const { confirmToken } = req.params;
    const { newPassword } = req.body;

    if (!newPassword) {
        return res.status(400).json({ message: 'New password is required' });
    }

    try {
        const decode_v2 = jwt.verify(confirmToken, process.env.JWT_SECRET);

        const user = await UserModel.findByEmail(decode_v2.email);

        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        user.password = await bcrypt.hash(newPassword, 10);;
        user.resetToken = null;
        await user.save();

        return res.status(200).json({ message: 'Password reset successfully' });
    } catch (error) {
        return res.status(500).json({ message: 'Server error. Please try again later.' });
    }
};

exports.confirmEmail = async (req, res) => {
    const { token } = req.params;

    if (!token) {
        return res.status(400).json({ message: 'Token is required' });
    }

    try {
        const decoded = jwt.verify(token, process.env.SECRET_KEY);

        const user = await UserModel.findByEmail(decoded.email);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.emailConfirmed) {
            return res.status(400).json({ message: 'Email already confirmed' });
        }

        user.emailConfirmed = true;
        await user.save();

        return res.status(200).json({ message: 'Email confirmed successfully' });
    } catch (error) {
        logger.error('Error during email confirmation:', error);
        return res.status(500).json({ message: 'Server error. Please try again later.' });
    }
};
