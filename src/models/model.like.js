const { noTrueLogging } = require('sequelize/lib/utils/deprecations');
const { Like } = require('../database/db.model.db');
const logger = require('../utils/logger');

class LikeModel {
    static async create({ userId, postId, commentId, type }) {
        try {
            return await Like.create({ type, userId, postId, commentId });
        } catch (error) {
            logger.error(`Like creation error: ${error.message}`);
            throw error;
        }
    }

    static async find({ userId, postId }) {
        try {
            return await Like.findOne({ where: { postId: postId, userId: userId } });
        } catch (error) {
            logger.error(error.message);
            throw error;
        }
    }

    static async findByCommentUserId({ userId, commentId }) {
        try {
            return await Like.findOne({ where: { userId: userId, commentId: commentId } });
        } catch (error) {
            logger.error(error.message);
            throw error;
        }
    }

    static async findPostCommentLike({ commentId, postId, userId }) {
        try {
            return await Like.findOne({
                where: {
                    userId: userId,
                    commentId: commentId,
                    postId: postId
                }
            })
        } catch (error) {
            logger.error(error.message);
            throw error;
        }
    }

    static async getAllByPost(postId) {
        try {
            return await Like.findAll({ where: { postId } });
        } catch (error) {
            logger.error(`Fetching likes error: ${error.message}`);
            throw error;
        }
    }

    static async findByCommentId(commentId) {
        try {
            const likes = await Like.findAll({ where: { commentId } });
            return likes;
        } catch (error) {
            logger.error(`Fetching likes for comment ID ${commentId} error: ${error.message}`);
            throw error;
        }
    }

    static async findPostCommentLikes({ commentId, postId }) {
        try {
            return await Like.findOne({
                where: {
                    commentId: commentId,
                    postId: postId
                }
            });
        } catch (error) {
            logger.error(error.message);
            throw error;
        }
    }

    static async deleteLike(comment_id, user_id) {
        try {
            return await Like.destroy({ where: { comment_id, user_id } });
        } catch (error) {
            logger.error(`Like deletion error: ${error.message}`);
            throw error;
        }
    }
}

module.exports = LikeModel;
