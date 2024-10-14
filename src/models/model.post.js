const { Post } = require('../database/db.model.db');
const logger = require('../utils/logger');

class PostModel {
    static async create({ title, content, userId, category }) {
        try {
            const newPost = await Post.create({
                title,
                content,
                userId,
                category
            });
            return newPost;
        } catch (error) {
            logger.error(`Post creation error: ${error.message}`);
            throw error;
        }
    }

    static async findAll({ limit, offset }) {
        try {
            const posts = await Post.findAll({ limit, offset });
            return posts;
        } catch (error) {
            logger.error(`Fetching posts error: ${error.message}`);
            throw error;
        }
    }

    static async findById(postId) {
        try {
            return await Post.findOne({ where: { id: postId } });
        } catch (error) {
            logger.error(`Post retrieval error: ${error.message}`);
            throw error;
        }
    }

    static async findByCategoryId(categoryId, { limit, offset }) {
        try {
            const posts = await Post.findAndCountAll({
                where: { category: categoryId },
                limit,
                offset
            });
            return {
                totalPosts: posts.count,
                posts: posts.rows
            };
        } catch (error) {
            logger.error(`Fetching posts by category error: ${error.message}`);
            throw error;
        }
    }

    static async updatePost(postId, updateData) {
        try {
            await Post.update(updateData, { where: { id: postId } });
            return await Post.findOne({ where: { id: postId } });
        } catch (error) {
            logger.error(`Post update error: ${error.message}`);
            throw error;
        }
    }

    static async deletePost(postId) {
        try {
            return await Post.destroy({ where: { id: postId } });
        } catch (error) {
            logger.error(`Post deletion error: ${error.message}`);
            throw error;
        }
    }
}

module.exports = PostModel;
