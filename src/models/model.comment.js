const { User, Comment, Reply, Like } = require('../database/db.model.db');
const logger = require('../utils/logger');

class CommentModel {
    static async create({ content, userId, postId, parentCommentId = null }) {
        try {
            return await Comment.create({
                content,
                userId,
                postId,
                parentCommentId
            });
        } catch (error) {
            logger.error(`Comment creation error: ${error.message}`);
            throw error;
        }
    }

    static async findAllByPost(postId) {
        try {
            return await Comment.findAll({
                where: { postId: postId },
                include: [
                    {
                        model: Like,
                        as: 'likes',
                        where: { postId: postId },
                        required: false
                    },
                    {
                        model: Reply,
                        as: 'replies',
                        include: [
                            {
                                model: User,
                                as: 'user',
                                attributes: ['id', 'login', 'profilePicture'],
                            },
                        ],
                    },
                    {
                        model: User,
                        as: 'user',
                        attributes: ['id', 'login', 'profilePicture'],
                    },
                ],
            });
        } catch (error) {
            logger.error(`Fetching comments with replies error: ${error.message}`);
            throw error;
        }
    }


    static async findById(commentId) {
        try {
            return await Comment.findOne({
                where: { id: commentId },
                include: [
                    {
                        model: Like,
                        as: 'likes',
                    },
                    {
                        model: Reply,
                        as: 'replies',
                        include: [
                            {
                                model: User,
                                as: 'user',
                                attributes: ['id', 'login', 'profilePicture'],
                            },
                        ],
                    },
                    {
                        model: User,
                        as: 'user',
                        attributes: ['id', 'login', 'profilePicture'],
                    },
                ],
            });
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
