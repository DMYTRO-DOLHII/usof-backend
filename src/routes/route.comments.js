const express = require('express');
const router = express.Router();
const commentController = require('../controllers/controller.comments');
const { validateToken, authorizeCommentCreator } = require('../middlewares/middleware.auth');

router.get('/:comment_id', commentController.getCommentById);
router.get('/:comment_id/like', commentController.getLikesByCommentId);

router.post('/:comment_id/reply', validateToken, commentController.createReply);
router.post('/:comment_id/like', validateToken, commentController.createLike);

router.patch('/:comment_id', validateToken, commentController.updateComment);

router.delete('/:comment_id', validateToken, authorizeCommentCreator, commentController.deleteComment);
router.delete('/:comment_id/like', validateToken, commentController.deleteLike);

module.exports = router;
