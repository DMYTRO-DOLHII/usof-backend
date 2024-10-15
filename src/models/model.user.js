const bcrypt = require('bcrypt');
const { User } = require('../database/db.model.db');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

class UserModel {
    static async getAllUsers() {
        return await User.findAll();
    }

    static async findById(user_id) {
        return await User.findOne({ where: { id: user_id } });
    }

    static async findByLogin(login) {
        try {
            return await User.findOne({ where: { login } });
        } catch (error) {
            logger.error(`Find user error: ${error.message}`);
            throw error;
        }
    }

    static async findByEmail(email) {
        try {
            return await User.findOne({ where: { email: email } });
        } catch (error) {
            logger.error(`Error finding user by email: ${email} - ${error.message}`);
            throw error;
        }
    }

    static async findUser({ login, email }) {
        try {
            return await User.findOne({
                where: { [Op.or]: [{ login }, { email }] }
            });
        } catch (error) {
            logger.error(error);
            throw error;
        }
    }

    static async createUser({ login, password, email, fullName, role }) {
        try {
            return await User.create({
                login,
                password: await bcrypt.hash(password, 10),
                email,
                fullName,
                role: role,
                emailConfirmed: true
            });
        } catch (error) {
            logger.error(`Error creating user.`);
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
