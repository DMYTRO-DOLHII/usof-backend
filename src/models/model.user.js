const bcrypt = require('bcrypt');
const { User } = require('../database/db.model.db');
const logger = require('../utils/logger');
const { Op } = require("sequelize");
const generateToken = require('../utils/token');

class UserModel {
    static async register({ login, password, fullName, email, profilePicture }) {
        try {
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

            const hashedPassword = await bcrypt.hash(password, 10);

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
            throw error;
        }
    }

    static async login({ login, email, password }) {
        try {
            const user = await User.findOne({
                where: {
                    [Op.or]: [
                        { login: login },
                        { email: email }
                    ]
                }
            });

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

            return { status: 200, message: 'Login successful', token }
        } catch (error) {
            logger.error(`Login error: ${error.message}`);
        }
    }

    static async getAllUsers() {
        return await User.findAll();
    }

    static async findById(user_id) {
        return await User.findOne({ where: { id: user_id } });
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
            throw error;
        }
    }

    static async findByEmail(email) {
        try {
            const user = await User.findOne({
                where: { email: email }
            });

            if (!user) {
                logger.warn(`No user found with email: ${email}`);
                return null;
            }

            logger.info(`User found with email: ${email}`);
            return user;
        } catch (error) {
            logger.error(`Error finding user by email: ${email} - ${error.message}`);
            throw error;
        }
    }

    static async updateUser(user_id, updateData) {
        return await User.update(updateData, { where: { id: user_id } });
    }

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
            throw error;
        }
    }

    static async deleteUser(user_id) {
        return await User.destroy({ where: { id: user_id } });
    }

    static async resetPassword(login, newPassword) {
        try {
            const user = await User.findOne({ where: { login } });
            if (!user) {
                logger.error(`User with login "${login}" not found`);
                throw new Error('User not found');
            }

            const hashedPassword = await bcrypt.hash(newPassword, 10);
            await user.update({ password: hashedPassword });

            return user;
        } catch (error) {
            logger.error(`Password reset error for "${login}": ${error.message}`);
            throw error;
        }
    }
}

module.exports = UserModel;
