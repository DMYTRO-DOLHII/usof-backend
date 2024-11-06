const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/controller.categories');
const { validateToken, isAdmin } = require('../middlewares/middleware.auth');

router.get('/', validateToken, categoryController.getAllCategories);
router.get('/:category_id', validateToken, categoryController.getCategoryById);
router.get('/:category_id/posts', validateToken, categoryController.getCategoryPosts);

router.post('/', validateToken, categoryController.createCategory);
router.patch('/:category_id', validateToken, categoryController.updateCategory);
router.delete('/:category_id', validateToken, categoryController.deleteCategory);

module.exports = router;
