const express = require('express');
const { authenticate } = require('../middleware/auth');
const chatController = require('../controllers/chat.controller');

const router = express.Router();

router.use(authenticate);

router.get('/:requestId/messages', chatController.getChatMessages);
router.post('/:requestId/messages', chatController.sendMessage);

module.exports = router;
