const express = require('express');
const router = express.Router();
const postController = require('../controllers/controller.posts');
const { validateToken, isAdmin, authorizePostCreator } = require('../middlewares/middleware.auth');

router.get('/', postController.getAllPosts);
router.get('/:post_id', postController.getPostById);
router.get('/', postController.getPostsBySearch);
router.get('/:post_id/comments', postController.getPostComments);
router.get('/:post_id/categories', postController.getPostCategories);
router.get('/:post_id/like', postController.getPostLikes);

router.post('/', validateToken, postController.createPost);
router.post('/:post_id/comments', validateToken, postController.createComment);
router.post('/:post_id/like', validateToken, postController.createPostLike);

router.patch('/:post_id', validateToken, authorizePostCreator, postController.updatePost);

// Add admin behavior
router.delete('/:post_id', validateToken, authorizePostCreator, postController.deletePost); 
router.delete('/:post_id/like', validateToken, postController.deletePostLike);

module.exports = router;
