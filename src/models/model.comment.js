const { Comment, Like } = require('../database/db.model.db');
const logger = require('../utils/logger');

class CommentModel {
    static async create({ content, userId, postId }) {
        try {
            return await Comment.create({
                content,
                userId,
                postId
            });
        } catch (error) {
            logger.error(`Comment creation error: ${error.message}`);
            throw error;
        }
    }

    static async findAllByPost(postId) {
        try {
            return await Comment.findAll({
                where: { postId },
                include: [
                    {
                        model: Like,
                        as: 'likes'
                    }
                ]
            });
        } catch (error) {
            logger.error(`Fetching comments with likes error: ${error.message}`);
            throw error;
        }
    }

    static async findById(commentId) {
        try {
            return await Comment.findOne({ where: { id: commentId } });
        } catch (error) {
            logger.error(`Post retrieval error: ${error.message}`);
            throw error;
        }
    }

    static async updateComment(commentId, content) {
        try {
            await Comment.update(content, { where: { id: commentId } });
            return await Comment.findOne({ where: { id: commentId } });
        } catch (error) {
            logger.error(`Comment update error: ${error.message}`);
            throw error;
        }
    }

    static async deleteComment(commentId) {
        try {
            return await Comment.destroy({ where: { id: commentId } });
        } catch (error) {
            logger.error(`Comment deletion error: ${error.message}`);
            throw error;
        }
    }
}

module.exports = CommentModel;
