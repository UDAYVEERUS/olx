const Chat = require('../models/Chat');
const Listing = require('../models/Listing');
const { sendResponse, sendError, asyncHandler } = require('../utils/helpers');

const createChat = asyncHandler(async (req, res) => {
  const { listingId } = req.body;
  const buyerId = req.user._id;
  
  console.log('Creating chat - buyerId:', buyerId, 'listingId:', listingId); // DEBUG
  
  const listing = await Listing.findById(listingId).populate('seller');
  if (!listing) {
    return sendError(res, 404, 'Listing not found');
  }
  
  const sellerId = listing.seller._id;
  
  if (buyerId.toString() === sellerId.toString()) {
    return sendError(res, 400, 'You cannot chat with yourself');
  }
  
  let chat = await Chat.findOne({
    buyer: buyerId,
    seller: sellerId,
    listing: listingId
  }).populate('buyer', 'name email avatar picture')
    .populate('seller', 'name email avatar picture')
    .populate('listing', 'title images price');
  
  if (!chat) {
    chat = await Chat.create({
      buyer: buyerId,
      seller: sellerId,
      listing: listingId
    });
    
    chat = await Chat.findById(chat._id)
      .populate('buyer', 'name email avatar picture')
      .populate('seller', 'name email avatar picture')
      .populate('listing', 'title images price');
  }
  
  console.log('Chat created/found:', chat); // DEBUG
  
  // Use consistent response format
  sendResponse(res, 201, { chat }, 'Chat created successfully');
});

const getMyChats = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  
  const chats = await Chat.find({
    $or: [{ buyer: userId }, { seller: userId }],
    isActive: true
  }).populate('buyer', 'name avatar picture')
    .populate('seller', 'name avatar picture')
    .populate('listing', 'title images price')
    .sort({ lastActivity: -1 });
  
  sendResponse(res, 200, { chats }, 'Chats retrieved successfully');
});

const getChat = asyncHandler(async (req, res) => {
  const chatId = req.params.id;
  const userId = req.user._id;
  
  const chat = await Chat.findById(chatId)
    .populate('buyer', 'name avatar picture')
    .populate('seller', 'name avatar picture')
    .populate('listing', 'title images price')
    .populate('messages.sender', 'name avatar picture');
  
  if (!chat) {
    return sendError(res, 404, 'Chat not found');
  }
  
  if (chat.buyer._id.toString() !== userId.toString() && 
      chat.seller._id.toString() !== userId.toString()) {
    return sendError(res, 403, 'Access denied');
  }
  
  chat.messages.forEach(message => {
    if (message.sender._id.toString() !== userId.toString()) {
      message.isRead = true;
    }
  });
  await chat.save();
  
  sendResponse(res, 200, { chat }, 'Chat retrieved successfully');
});

const sendMessage = asyncHandler(async (req, res) => {
  const chatId = req.params.id;
  const userId = req.user._id;
  const { content } = req.body;
  
  if (!content || content.trim().length === 0) {
    return sendError(res, 400, 'Message content is required');
  }
  
  const chat = await Chat.findById(chatId);
  if (!chat) {
    return sendError(res, 404, 'Chat not found');
  }
  
  if (chat.buyer.toString() !== userId.toString() && 
      chat.seller.toString() !== userId.toString()) {
    return sendError(res, 403, 'Access denied');
  }
  
  chat.messages.push({
    sender: userId,
    content: content.trim()
  });
  
  await chat.save();
  
  const updatedChat = await Chat.findById(chatId)
    .populate('messages.sender', 'name avatar picture');
  
  const newMessage = updatedChat.messages[updatedChat.messages.length - 1];
  
  const io = req.app.get('io');
  if (io) {
    io.to(chatId).emit('new-message', {
      chatId,
      message: newMessage
    });
  }
  
  sendResponse(res, 201, { message: newMessage }, 'Message sent successfully');
});

const getChatMessages = asyncHandler(async (req, res) => {
  const chatId = req.params.id;
  const userId = req.user._id;
  
  const chat = await Chat.findById(chatId)
    .populate('messages.sender', 'name avatar picture');
  
  if (!chat) {
    return sendError(res, 404, 'Chat not found');
  }
  
  if (chat.buyer.toString() !== userId.toString() && 
      chat.seller.toString() !== userId.toString()) {
    return sendError(res, 403, 'Access denied');
  }
  
  sendResponse(res, 200, { messages: chat.messages }, 'Messages retrieved successfully');
});

module.exports = {
  createChat,
  getMyChats,
  getChat,
  sendMessage,
  getChatMessages
};