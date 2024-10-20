const { Category, Post } = require('../database/db.model.db');
const logger = require('../utils/logger');
const { Op } = require('sequelize');

class CategoryModel {
    static async create(title) {
        try {
            return await Category.create({ title });
        } catch (error) {
            logger.error(`Category creation error: ${error.message}`);
            throw error;
        }
    }

    static async findAll() {
        try {
            return await Category.findAll();
        } catch (error) {
            logger.error(`Fetching categories error: ${error.message}`);
            throw error;
        }
    }

    static async findAll(titles) {
        try {
            return await Category.findAll({
                where: {
                    title: { [Op.in]: titles }
                }
            });
        } catch (error) {
            logger.error(error.message);
            throw error;
        }
    }

    static async findAllByPostId(postId) {
        try {
            const categories = await Category.findAll({
                include: {
                    model: Post,
                    as: 'posts',
                    through: {
                        attributes: []
                    }
                },
                where: {
                    id: postId
                }
            });

            return categories;
        } catch (error) {
            logger.error(error.message);
            throw error;
        }
    }

    static async findByPk(categoryId) {
        try {
            return await Category.findByPk(categoryId);
        } catch (error) {
            logger.error(`Find category by ID error: ${error.message}`);
            throw error;
        }
    }

    static async updateCategory(categoryId, updateData) {
        try {
            await Category.update(updateData, { where: { id: categoryId } });
            return await Category.findOne({ where: { id: categoryId } });
        } catch (error) {
            logger.error(`Category update error: ${error.message}`);
            throw error;
        }
    }

    static async deleteCategory(categoryId) {
        try {
            return await Category.destroy({ where: { id: categoryId } });
        } catch (error) {
            logger.error(`Category deletion error: ${error.message}`);
            throw error;
        }
    }
}

module.exports = CategoryModel;
