const express = require('express');
const { protect } = require('../middleware/auth');
const { validateObjectId } = require('../middleware/validation');
const {
  createChat,
  getMyChats,
  getChat,
  sendMessage,
  getChatMessages
} = require('../controllers/chatController');

const router = express.Router();

// All routes require authentication
router.use(protect);

router.post('/', [
  require('express-validator').body('listingId').isMongoId().withMessage('Valid listing ID is required'),
  require('../middleware/validation').handleValidationErrors
], createChat);

router.get('/my-chats', getMyChats);
router.get('/:id', validateObjectId(), getChat);
router.get('/:id/messages', validateObjectId(), getChatMessages);
router.post('/:id/messages', validateObjectId(), [
  require('express-validator').body('content').notEmpty().trim().withMessage('Message content is required'),
  require('../middleware/validation').handleValidationErrors
], sendMessage);

module.exports = router;