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

exports.registerUser = async (req, res) => {
    const { login, email, fullName, password, confirmPassword } = req.body;

    if (!login || !password || !confirmPassword || !email || !fullName) {
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

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            login,
            password: hashedPassword,
            fullName,
            email,
            profilePicture,
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
        const user = await UserModel.findUser({ login, email });

        if (!user) {
            logger.info('Invalid login or email');
            return { status: 400, message: 'Invalid login or email' };
        }

        if (!user.emailConfirmed) {
            logger.info('Please confirm your email to log in');
            return { status: 403, message: 'Please confirm your email to log in' };
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            logger.info('Invalid password');
            return { status: 400, message: 'Invalid password' };
        }

        const token = generateToken(user);

        res.status(200).json({ message: 'Login successful', token: token });
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
