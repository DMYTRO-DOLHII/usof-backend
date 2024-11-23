const { compareSync } = require('bcrypt');
const CommentModel = require('../models/model.comment');
const LikeModel = require('../models/model.like');
const UserModel = require('../models/model.user');
const logger = require('../utils/logger');
const { Reply, User } = require('../database/db.model.db');

exports.getCommentById = async (req, res) => {
    const { comment_id } = req.params;
    try {
        const comment = await CommentModel.findById(comment_id);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }
        return res.status(200).json(comment);
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getLikesByCommentId = async (req, res) => {
    const { comment_id } = req.params;
    try {
        const likes = await LikeModel.findByCommentId(comment_id);
        return res.status(200).json({ likes });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.createLike = async (req, res) => {
    const { comment_id } = req.params;
    const { type } = req.body;
    const userId = req.user.id;

    try {
        const comment = await CommentModel.findById(comment_id);

        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        const user = await UserModel.findById(comment.userId);

        const existingLike = await LikeModel.findByCommentUserId({ userId: userId, commentId: comment_id });
        if (existingLike) {
            if (existingLike.type === type) {
                if (type === 'like') {
                    await existingLike.destroy();
                    // user.rating -= 1;
                    // await user.save();
                } else {
                    await existingLike.destroy();
                    // user.rating += 1;
                    // await user.save();
                }
            } else {
                if (type === 'like') {
                    existingLike.type = type;
                    await existingLike.save()
                    // user.rating += 2;
                    // await user.save();
                } else {
                    existingLike.type = type;
                    await existingLike.save();
                    // user.rating -= 2;
                    // await user.save();
                }
            }
        }

        const like = await LikeModel.create({
            userId: userId,
            commentId: comment_id,
            type: type
        });

        const likes = await LikeModel.findByCommentId(comment_id);

        return res.status(201).json({ likes });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.createReply = async (req, res) => {
    const { comment_id } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    try {
        const reply = await Reply.create({
            content: content,
            commentId: comment_id,
            userId: userId
        });

        const newReply = await Reply.findByPk(reply.id, {
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'login', 'profilePicture'],
                },
            ],
        });

        return res.status(200).json(newReply);
    } catch (error) {
        logger.error(error.message);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.deleteReply = async (req, res) => {
    const { reply_id } = req.params;

    try {
        const reply = await Reply.findByPk(reply_id);
        await reply.destroy();
        return res.status(200).json({ message: 'Reply deleted' });
    } catch (error) {
        logger.error(error.message);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.updateComment = async (req, res) => {
    const { comment_id } = req.params;
    const { content } = req.body;

    try {
        const comment = await CommentModel.findById(comment_id);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        comment.content = content || comment.content;
        await comment.save();

        return res.status(200).json({ message: 'Comment updated', comment });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.deleteComment = async (req, res) => {
    const { comment_id } = req.params;

    try {
        const comment = await CommentModel.findById(comment_id);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        await comment.destroy();
        return res.status(200).json({ message: 'Comment deleted' });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.deleteLike = async (req, res) => {
    const { comment_id } = req.params;
    const userId = req.user.id;

    try {
        const like = await LikeModel.findByCommentUserId({ userId: userId, commentId: comment_id });
        if (!like) {
            return res.status(404).json({ message: 'Like not found' });
        }

        await like.destroy();
        return res.status(200).json({ message: 'Like deleted' });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};
