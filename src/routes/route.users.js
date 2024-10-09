const express = require('express');
const router = express.Router();
const userController = require('../controllers/controller.users');
const { validateToken, isAdmin } = require('../middlewares/middleware.auth'); // Middleware for authentication and admin check
const multer = require('multer'); // For handling avatar uploads

// Define file storage for multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/avatars/');
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage: storage });

// Routes
router.get('/', validateToken, userController.getAllUsers); // Get all users
router.get('/:user_id', validateToken, userController.getUserById); // Get specific user by ID
router.post('/', [validateToken, isAdmin], userController.createUser); // Admins only: Create a new user
router.patch('/avatar', validateToken, upload.single('avatar'), userController.uploadUserAvatar); // Upload user avatar
router.patch('/:user_id', validateToken, userController.updateUser); // Update user data
router.delete('/:user_id', [validateToken, isAdmin], userController.deleteUser); // Admins only: Delete user

module.exports = router;
