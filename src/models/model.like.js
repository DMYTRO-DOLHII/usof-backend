const { Like } = require('../database/db.model.db');
const logger = require('../utils/logger');

class LikeModel {
    static async create({ userId, postId }) {
        try {
            const newLike = await Like.create({ userId, postId });
            return newLike;
        } catch (error) {
            logger.error(`Like creation error: ${error.message}`);
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
            // Fetch likes associated with the given commentId
            const likes = await Like.findAll({ where: { commentId } });
            return likes;
        } catch (error) {
            logger.error(`Fetching likes for comment ID ${commentId} error: ${error.message}`);
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
