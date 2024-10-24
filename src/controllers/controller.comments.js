const { compareSync } = require('bcrypt');
const CommentModel = require('../models/model.comment');
const LikeModel = require('../models/model.like');

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

        const user = await UserModel.findById(post.userId);

        const existingLike = await LikeModel.findByCommentUserId({ userId: userId, commentId: comment_id });
        if (existingLike) {
            if (existingLike.type === type) {
                if (type === 'like') {
                    await existingLike.destroy();
                    user.rating -= 1;
                    await user.save();
                    return res.status(201).json({ message: "Like deleted" });
                } else {
                    await existingLike.destroy();
                    user.rating += 1;
                    await user.save();
                    return res.status(201).json({ message: "Dislike deleted" });
                }
            } else {
                if (type === 'like') {
                    existingLike.type = type;
                    user.rating += 2;
                    await user.save();
                    return res.status(201).json({ message: "Dislike deleted, Like added" });
                } else {
                    existingLike.type = type;
                    user.rating -= 2;
                    await user.save();
                    return res.status(201).json({ message: "Like deleted, Dislike added" });
                }
            }
        }

        const like = await LikeModel.create({
            userId: userId,
            postId: comment.postId,
            commentId: comment_id,
            type: type
        });

        if (type === 'like') user.rating++;
        else user.rating--;

        await user.save();

        return res.status(201).json({ message: 'Like added successfully', like });
    } catch (error) {
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
