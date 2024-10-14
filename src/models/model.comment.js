const { Comment } = require('../database/db.model.db');
const logger = require('../utils/logger');

class CommentModel {
    static async create({ content, userId, postId }) {
        try {
            const newComment = await Comment.create({
                content,
                userId,
                postId
            });
            return newComment;
        } catch (error) {
            logger.error(`Comment creation error: ${error.message}`);
            throw error;
        }
    }

    static async getAllByPost(postId) {
        try {
            return await Comment.findAll({ where: { postId } });
        } catch (error) {
            logger.error(`Fetching comments error: ${error.message}`);
            throw error;
        }
    }

    static async updateComment(commentId, updateData) {
        try {
            await Comment.update(updateData, { where: { id: commentId } });
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
