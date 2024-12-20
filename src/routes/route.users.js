const express = require('express');
const router = express.Router();
const userController = require('../controllers/controller.users');
const { validateToken, isAdmin } = require('../middlewares/middleware.auth');
const upload = require('../middlewares/middlware.upload');

router.get('/', userController.getAllUsers);
router.get('/:user_id', userController.getUserById);
router.get('/:user_id/favourites', userController.getUserFavouritePosts);

router.post('/', [validateToken, isAdmin], userController.createUser);

router.patch('/avatar', validateToken, upload.single('file'), userController.uploadUserAvatar);
router.patch('/:user_id', validateToken, userController.updateUser);

router.delete('/:user_id', [validateToken, isAdmin], userController.deleteUser);

module.exports = router;
