const bcrypt = require('bcrypt');
const { User } = require('../database/db.model.db'); // Import the User model from db.model.js
const logger = require('../utils/logger'); // Import the logger

class UserModel {
    // Register a new user
    static async register({ login, password, fullName, email, profilePicture }) {
        try {
            // Check if the user already exists
            const existingLogin = await User.findOne({ where: { login } });
            if (existingLogin) {
                logger.error(`User with login "${login}" already exists`);
                throw new Error('User already exists');
            }

            const existingEmail = await User.findOne({ where: { email } });
            if (existingEmail) {
                logger.error(`Email already registered`);
                throw new Error(`Email already registered`);
            }

            // Hash the password before storing it
            const hashedPassword = await bcrypt.hash(password, 10);

            // Create and save the new user
            const newUser = await User.create({
                login,
                password: hashedPassword,
                fullName,
                email,
                profilePicture,
            });

            await newUser.save();

            return newUser;
        } catch (error) {
            logger.error(`Registration error: ${error.message}`);
            throw error; // Re-throw the caught error
        }
    }

    // Login a user
    static async login({ login, password }) {
        try {
            const user = await User.findOne({ where: { login, email } });

            if (!user) {
                return res.status(400).json({ message: 'Invalid login or email' });
            }

            if (!user.isEmailConfirmed) {
                return res.status(403).json({ message: 'Please confirm your email to log in' });
            }

            const isPasswordValid = await bcrypt.compare(password, user.password);

            if (!isPasswordValid) {
                return res.status(400).json({ message: 'Invalid password' });
            }

            // Return the logged-in user
            return user;
        } catch (error) {
            logger.error(`Login error: ${error.message}`);
            throw error; // Re-throw the caught error
        }
    }

    static async findByLogin(login) {
        try {
            const user = await User.findOne({ where: { login } });
            if (!user) {
                logger.error(`User with login "${login}" not found`);
                throw new Error('User not found');
            }
            return user;
        } catch (error) {
            logger.error(`Find user error: ${error.message}`);
            throw error; // Re-throw the caught error
        }
    }

    static async findByEmail(email) {
        try {
            const user = await User.findOne({
                where: { email: email }
            });

            if (!user) {
                logger.warn(`No user found with email: ${email}`);
                return null; // Return null if no user is found
            }

            logger.info(`User found with email: ${email}`);
            return user;
        } catch (error) {
            logger.error(`Error finding user by email: ${email} - ${error.message}`);
            throw error; // Throw error, avoid creating a new error object
        }
    }

    // Update user details
    static async updateUser(login, updatedData) {
        try {
            const user = await User.findOne({ where: { login } });
            if (!user) {
                logger.error(`User with login "${login}" not found`);
                throw new Error('User not found');
            }

            await user.update(updatedData);
            return user;
        } catch (error) {
            logger.error(`Update user error for "${login}": ${error.message}`);
            throw error; // Re-throw the caught error
        }
    }

    // Reset password
    static async resetPassword(login, newPassword) {
        try {
            const user = await User.findOne({ where: { login } });
            if (!user) {
                logger.error(`User with login "${login}" not found`);
                throw new Error('User not found');
            }

            // Hash the new password
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            await user.update({ password: hashedPassword });

            return user;
        } catch (error) {
            logger.error(`Password reset error for "${login}": ${error.message}`);
            throw error; // Re-throw the caught error
        }
    }
}

module.exports = UserModel;
