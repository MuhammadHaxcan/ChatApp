const express = require('express');
const router = express.Router();
const defaultController = require('../controllers/defaultController');
const authMiddleware = require('../middleware/authMiddleware'); // Import the middleware

// Home route
router.get('/', defaultController.home);

// About route
router.get('/about', defaultController.showAboutPage);

// Dashboard route with authentication middleware
router.get('/dashboard', authMiddleware, defaultController.showDashboardPage);

module.exports = router;
