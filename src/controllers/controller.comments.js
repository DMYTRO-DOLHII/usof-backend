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
    const { userId } = req.body;

    try {
        const like = await LikeModel.create({ commentId: comment_id, userId });
        return res.status(201).json({ message: 'Like added', like });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.updateComment = async (req, res) => {
    const { comment_id } = req.params;
    const updateData = req.body;

    try {
        const updatedComment = await CommentModel.updateComment(comment_id, updateData);
        if (!updatedComment) {
            return res.status(404).json({ message: 'Comment not found' });
        }
        return res.status(200).json({ message: 'Comment updated', updatedComment });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.deleteComment = async (req, res) => {
    const { comment_id } = req.params;

    try {
        const deleted = await CommentModel.deleteComment(comment_id);
        if (!deleted) {
            return res.status(404).json({ message: 'Comment not found' });
        }
        return res.status(200).json({ message: 'Comment deleted' });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.deleteLike = async (req, res) => {
    const { comment_id } = req.params;
    const { user_id } = req.body;

    try {
        const deleted = await LikeModel.deleteLike(comment_id, user_id);
        if (!deleted) {
            return res.status(404).json({ message: 'Like not found' });
        }
        return res.status(200).json({ message: 'Like deleted' });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};
