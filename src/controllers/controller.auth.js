const bcrypt = require('bcrypt');
const UserModel = require('../models/model.user'); // Assuming User is defined in db.model.js
const validator = require('validator');
const jwt = require('jsonwebtoken');
const generateToken = require('../utils/token');
const nodemailer = require('nodemailer'); // For sending emails (password reset)
const crypto = require('crypto'); // For generating reset tokens
const { doesNotMatch } = require('assert');

// User registration
exports.registerUser = async (req, res) => {
    const { login, email, fullName, password, confirmPassword } = req.body;

    if (!login || !password || !confirmPassword || !email || !fullName) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    if (!validator.isEmail(email)) {
        return res.status(400).json({ message: 'Invalid email format' });
    }

    try {
        UserModel.register({
            login: login,
            email: email,
            fullName: fullName,
            password: password
        });

        // Simulate sending an email confirmation link (this part can be expanded)
        // Use nodemailer to send email for email confirmation

        return res.status(201).json({ message: 'User registered successfully. Please confirm your email.' });
    } catch (error) {
        return res.status(500).json({ message: 'Server error. Please try again later.' });
    }
};

// User login
exports.loginUser = async (req, res) => {
    const { login, email, password } = req.body;

    if (!login || !email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        UserModel.login({ login: login, password: password });

        const token = generateToken(user);

        return res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
        return res.status(500).json({ message: 'Server error. Please try again later.' });
    }
};

// User logout
exports.logoutUser = async (req, res) => {
    // Simulate token invalidation (JWT can't be invalidated on server side directly)
    // Implement session-based authentication for true invalidation or token blacklist

    return res.status(200).json({ message: 'Logout successful' });
};

// Request password reset link
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

        // Store the hashed token in the user record
        user.resetToken = resetTokenHash;
        await user.save();

        // Send reset link via email (use nodemailer)
        const resetLink = `${process.env.FRONTEND_URL}/password-reset/${resetToken}`;

        // Implement nodemailer email sending logic here...

        return res.status(200).json({ message: 'Password reset link sent to email' });
    } catch (error) {
        return res.status(500).json({ message: 'Server error. Please try again later.' });
    }
};

// Confirm password reset using token
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
        user.resetToken = null; // TODO: sdelat krasivee
        await user.save();

        return res.status(200).json({ message: 'Password reset successfully' });
    } catch (error) {
        return res.status(500).json({ message: 'Server error. Please try again later.' });
    }
};
