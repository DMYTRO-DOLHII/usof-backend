const bcrypt = require('bcrypt');
const { User, Post, Favourite, Category, Like } = require('../database/db.model.db');
const { Op, Sequelize } = require('sequelize');
const logger = require('../utils/logger');

class UserModel {
    static async getAllUsers() {
        return await User.findAll();
    }

    static async findAllAndCount({ limit, offset, search, order }) {
        try {
            return await User.findAndCountAll({
                limit,
                offset,
                order: [[order, 'DESC']],
                where: {
                    [Op.or]: [
                        { login: { [Op.like]: `%${search}%` } },
                        { fullName: { [Op.like]: `%${search}%` } }
                    ]
                },
            });
        } catch (error) {
            logger.error(`Fetching users error: ${error.message}`);
            throw error;
        }
    }

    static async findUserFavouritePosts(userId) {
        try {
            const favourites = await Favourite.findAll({
                where: { userId }
            });

            if (!favourites || favourites.length === 0) {
                return [];
            }

            const postIds = favourites.map((fav) => fav.postId);

            const posts = await Post.findAll({
                where: { id: postIds },
                include: ['user', 'categories', 'favourites', 'comments', {
                    model: Like,
                    as: 'likes',
                    where: { commentId: null }
                }],
                distinct: true
            });

            return posts;
        } catch (error) {
            logger.error(error.message);
            throw error;
        }
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

    static async findUserByLoginOrEmail({ login, email }) {
        try {
            return await User.findOne({
                where: { [Op.or]: [{ login: login }, { email: email }] }
            });
        } catch (error) {
            logger.error(error);
            throw error;
        }
    }

    static async findUser(login) {
        try {
            return await User.findOne({
                where: {
                    [Op.or]: [
                        { login: login },
                        { email: login }
                    ]
                }
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
                emailConfirmed: true,
                profilePicture: 'uploads/default.png'
            });
        } catch (error) {
            logger.error(`Error creating user.`);
            throw error;
        }
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
