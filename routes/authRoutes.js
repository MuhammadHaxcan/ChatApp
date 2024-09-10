const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Route to show registration form
router.get('/register', authController.showRegisterPage);

// Route to handle registration
router.post('/register', authController.register);

// Route to show login form
router.get('/login', authController.showLoginPage);

// Route to handle login
router.post('/login', authController.login);

// Route to handle logout
router.get('/logout', authController.logout);

module.exports = router;
