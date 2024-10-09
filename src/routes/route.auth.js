const express = require('express');
const router = express.Router();
const authController = require('../controllers/controller.auth');

// Register a new user
router.post('/register', authController.registerUser);
router.post('/login', authController.loginUser);
router.post('/logout', authController.logoutUser);
router.post('/password-reset', authController.requestPasswordReset);
router.post('/password-reset/:confirmToken', authController.confirmPasswordReset);
// confirm email route

module.exports = router;
