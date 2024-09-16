const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

// Search users
router.get('/search', authMiddleware, userController.searchUser);

// Search Group
router.get('/searchgroup', authMiddleware, userController.searchGroup);

// Send a friend request
router.post('/sendrequest', authMiddleware, userController.sendFriendRequest);

// Cancel a friend request
router.post('/cancelrequest', authMiddleware, userController.cancelFriendRequest);

// Fetch incoming user requests
router.get('/incomingrequests', authMiddleware, userController.getIncomingRequests);

// Accept a user request
router.post('/acceptrequest', authMiddleware, userController.acceptFriendRequest);

// Reject a user request
router.post('/rejectrequest', authMiddleware, userController.rejectFriendRequest);

// Show user friends
router.get('/friends', authMiddleware, userController.getFriends);


module.exports = router;
