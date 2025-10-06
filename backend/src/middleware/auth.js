const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendError } = require('../utils/helpers');

// Protect routes - require authentication
const protect = async (req, res, next) => {
  try {
    let token;
    
    // Get token from header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer')) {
      token = authHeader.split(' ')[1];
    }
    
    // Check if token exists
    if (!token) {
      return sendError(res, 401, 'Access denied. No token provided');
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from token
    const user = await User.findById(decoded.userId);
    if (!user) {
      return sendError(res, 401, 'Token is invalid - user not found');
    }
    
    // Check if user is active
    if (!user.isActive) {
      return sendError(res, 401, 'Account is disabled');
    }
    
    // Add user to request
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return sendError(res, 401, 'Token is invalid');
    } else if (error.name === 'TokenExpiredError') {
      return sendError(res, 401, 'Token has expired');
    }
    return sendError(res, 500, 'Server error during authentication');
  }
};

// Optional authentication - set user if token is valid
const optionalAuth = async (req, res, next) => {
  try {
    let token;
    
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer')) {
      token = authHeader.split(' ')[1];
    }
    
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);
      if (user && user.isActive) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

module.exports = {
  protect,
  optionalAuth
};