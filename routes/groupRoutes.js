const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const groupController = require('../controllers/groupController');

router.use(authMiddleware);
router.get('/groups', groupController.showGroupsPage);
router.post('/createGroup', groupController.createGroup);
router.delete('/deleteGroup/:groupId', groupController.deleteGroup);
router.get('/incomingInvites', groupController.incomingInvites);

module.exports = router;
