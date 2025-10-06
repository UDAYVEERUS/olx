const express = require('express');
const { body } = require('express-validator');
const { protect } = require('../middleware/auth');
const { validateObjectId, handleValidationErrors } = require('../middleware/validation');
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

// Create or get existing chat
router.post('/', [
  body('listingId')
    .notEmpty().withMessage('Listing ID is required')
    .isMongoId().withMessage('Valid listing ID is required'),
  handleValidationErrors
], createChat);

// Get all user's chats
router.get('/my-chats', getMyChats);

// Get specific chat
router.get('/:id', validateObjectId(), getChat);

// Get chat messages
router.get('/:id/messages', validateObjectId(), getChatMessages);

// Send message in chat
router.post('/:id/messages', [
  validateObjectId(),
  body('content')
    .notEmpty().withMessage('Message content is required')
    .trim()
    .isLength({ min: 1, max: 5000 }).withMessage('Message must be 1-5000 characters'),
  handleValidationErrors
], sendMessage);

module.exports = router;