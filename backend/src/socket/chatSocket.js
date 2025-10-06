const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Chat = require('../models/Chat');

// Store connected users
const connectedUsers = new Map();

const chatSocket = (io) => {
  // Authentication middleware for socket
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);
      
      if (!user || !user.isActive) {
        return next(new Error('User not found or inactive'));
      }
      
      socket.userId = user._id.toString();
      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });
  
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.name} (${socket.userId})`);
    
    // Store connected user
    connectedUsers.set(socket.userId, {
      socketId: socket.id,
      user: socket.user
    });
    
    // Join user to their personal room
    socket.join(socket.userId);
    
    // Handle joining a chat room
    socket.on('join-chat', async (data) => {
      try {
        const { chatId } = data;
        
        // Verify user is part of this chat
        const chat = await Chat.findById(chatId);
        if (!chat) {
          return socket.emit('error', { message: 'Chat not found' });
        }
        
        const isMember = chat.buyer.toString() === socket.userId || 
                        chat.seller.toString() === socket.userId;
        
        if (!isMember) {
          return socket.emit('error', { message: 'Access denied' });
        }
        
        socket.join(chatId);
        console.log(`User ${socket.user.name} joined chat ${chatId}`);
        
        // Notify other user in chat that someone joined
        socket.to(chatId).emit('user-joined', {
          userId: socket.userId,
          userName: socket.user.name
        });
        
      } catch (error) {
        console.error('Error joining chat:', error);
        socket.emit('error', { message: 'Error joining chat' });
      }
    });
    
    // Handle leaving a chat room
    socket.on('leave-chat', (data) => {
      const { chatId } = data;
      socket.leave(chatId);
      
      socket.to(chatId).emit('user-left', {
        userId: socket.userId,
        userName: socket.user.name
      });
    });
    
    // Handle sending a message
    socket.on('send-message', async (data) => {
      try {
        const { chatId, content } = data;
        
        if (!content || content.trim().length === 0) {
          return socket.emit('error', { message: 'Message content is required' });
        }
        
        // Find the chat and verify membership
        const chat = await Chat.findById(chatId);
        if (!chat) {
          return socket.emit('error', { message: 'Chat not found' });
        }
        
        const isMember = chat.buyer.toString() === socket.userId || 
                        chat.seller.toString() === socket.userId;
        
        if (!isMember) {
          return socket.emit('error', { message: 'Access denied' });
        }
        
        // Add message to chat
        chat.messages.push({
          sender: socket.userId,
          content: content.trim()
        });
        
        await chat.save();
        
        // Get the newly added message with populated sender
        const updatedChat = await Chat.findById(chatId)
          .populate('messages.sender', 'name avatar');
        
        const newMessage = updatedChat.messages[updatedChat.messages.length - 1];
        
        // Emit message to all users in the chat room
        io.to(chatId).emit('new-message', {
          chatId,
          message: newMessage
        });
        
        console.log(`Message sent in chat ${chatId} by ${socket.user.name}`);
        
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Error sending message' });
      }
    });
    
    // Handle typing indicator
    socket.on('typing', (data) => {
      const { chatId, isTyping } = data;
      
      socket.to(chatId).emit('user-typing', {
        userId: socket.userId,
        userName: socket.user.name,
        isTyping
      });
    });
    
    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user.name} (${socket.userId})`);
      
      // Remove from connected users
      connectedUsers.delete(socket.userId);
      
      // Notify all rooms that user is offline
      socket.broadcast.emit('user-offline', {
        userId: socket.userId,
        userName: socket.user.name
      });
    });
    
    // Handle connection errors
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });
  
  // Helper function to get online users
  io.getOnlineUsers = () => {
    return Array.from(connectedUsers.values()).map(user => ({
      userId: user.user._id,
      name: user.user.name,
      avatar: user.user.avatar
    }));
  };
};

module.exports = chatSocket;