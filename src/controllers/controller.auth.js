const bcrypt = require('bcrypt');
const UserModel = require('../models/model.user');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const generateToken = require('../utils/token');
const { sendConfirmationEmail } = require('../utils/email');
const crypto = require('crypto');
const { doesNotMatch } = require('assert');
const logger = require('../utils/logger');
const { User } = require('../database/db.model.db');
const { ExceptionHandler } = require('winston');

exports.registerUser = async (req, res) => {
    const { login, email, fullName, password } = req.body;

    if (!login || !password || !email || !fullName) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    if (!validator.isEmail(email)) {
        return res.status(400).json({ message: 'Invalid email format' });
    }

    try {
        const existingLogin = await UserModel.findByLogin(login);
        if (existingLogin) {
            return res.status(400).json(`User with login "${login}" already exists`);
        }

        const existingEmail = await UserModel.findByEmail(email);
        if (existingEmail) {
            return res.status(400).json(`Email already registered`);
        }

        const newUser = await User.create({
            login,
            password: await bcrypt.hash(password, 10),
            fullName,
            email,
            profilePicture: 'uploads/default.png'
        });

        const token = jwt.sign({ email: email }, process.env.SECRET_KEY, { expiresIn: '1h' });

        const confirmationLink = `${process.env.FRONT_URL}/confirm-email?token=${token}`;

        await sendConfirmationEmail(email, login, confirmationLink);

        return res.status(201).json({ message: 'User registered successfully. Please confirm your email.' });
    } catch (error) {
        return res.status(500).json({ message: 'Server error. Please try again later.' });
    }
};

exports.loginUser = async (req, res) => {
    const { login, password } = req.body;

    if (!login || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        const user = await UserModel.findUser(login);

        if (!user) {
            logger.info('Invalid login');
            return res.status(403).json({ message: 'Invalid login' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            logger.info('Invalid login or password');
            return res.status(403).json({ message: 'Invalid login or password' });
        }

        if (!user.emailConfirmed) {
            logger.info('Please confirm your email to log in');
            return res.status(403).json({ message: 'Please confirm your email to log in' });
        }

        const token = generateToken(user);

        res.status(200).json({ message: 'Login successful', token: token });
    } catch (error) {
        return res.status(500).json({ message: 'Server error. Please try again later.' });
    }
};

exports.refreshToken = async (req, res) => {
    const { token } = req.body;

    if (!token) {
        return res.status(401).json({ message: 'No refresh token provided' });
    }

    try {
        const decoded = jwt.decode(token);
        if (!decoded || !decoded.id) {
            return res.status(403).json({ message: 'Invalid refresh token' });
        }

        const user = await UserModel.findById(decoded.id);
        if (!user) {
            return res.status(403).json({ message: 'User not found' });
        }

        const newAccessToken = generateToken(user);

        res.json({ token: newAccessToken });
    } catch (error) {
        console.error('Error generating new access token:', error);
        res.status(500).json({ message: 'Server error' });
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
        const user = await UserModel.findByEmail(email);

        if (!user) {
            return res.status(404).json({ message: 'No user found with this email' });
        }

        const resetToken = jwt.sign({ email: email }, process.env.SECRET_KEY, { expiresIn: '1h' });

        const resetLink = `${process.env.FRONT_URL}/password-reset/${resetToken}`;

        sendConfirmationEmail(user.email, user.login, resetLink);

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
        const decode_v2 = jwt.verify(confirmToken, process.env.SECRET_KEY);

        const user = await UserModel.findByEmail(decode_v2.email);

        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        return res.status(200).json({ message: 'Password reset successfully' });
    } catch (error) {
        logger.error(error.message);
        return res.status(500).json({ message: 'Server error. Please try again later.' });
    }
};

exports.confirmEmail = async (req, res) => {
    const { token } = req.body;

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
