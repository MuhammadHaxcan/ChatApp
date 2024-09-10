const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const chatController = require('../controllers/chatController');

// Updated routes for getting and sending messages
router.get('/user/:userId', authMiddleware, chatController.showChatPage);
router.get('/getmessages/:user1Id/:user2Id', authMiddleware, chatController.getMessages);
router.post('/sendmessages/:user1Id/:user2Id', authMiddleware, chatController.sendMessage);

module.exports = router;
