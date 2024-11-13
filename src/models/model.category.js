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

    static async findAllCategoriesBySearch(search) {
        try {
            return await Category.findAll({
                where: {
                    [Op.or]: [
                        { title: { [Op.like]: `%${search}%` } },
                        { description: { [Op.like]: `%${search}%` } }
                    ]
                },
            });
        } catch (error) {
            logger.error(`Fetching categories error: ${error.message}`);
            throw error;
        }
    }

    static async getAllCategories(titles) {
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

    static async findPostsByCategoryId(categoryId, { limit, offset }) {
        try {
            const { count, rows: posts } = await Post.findAndCountAll({
                limit,
                offset,
                include: [
                    {
                        model: Category,
                        as: 'categories',
                        through: { attributes: [] },
                        where: { id: categoryId }
                    }
                ],
                distinct: true, // Ensure accurate count for pagination
                order: [['publishDate', 'DESC']] // Optional: Order by publish date
            });

            return {
                totalPosts: count,
                posts: posts.map(post => ({
                    ...post.toJSON(),
                    categories: post.categories
                }))
            };
        } catch (error) {
            logger.error(`Fetching posts by category error: ${error.message}`);
            throw error;
        }
    }

    static async findById(categoryId) {
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
