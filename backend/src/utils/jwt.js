const jwt = require('jsonwebtoken');

// Generate JWT token
const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// Verify JWT token
const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

// Generate tokens for user
const generateTokensForUser = (user) => {
  const payload = {
    userId: user._id,
    email: user.email,
    isAdmin: user.isAdmin
  };
  
  const token = generateToken(payload);
  
  return {
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar,
      isAdmin: user.isAdmin
    }
  };
};

module.exports = {
  generateToken,
  verifyToken,
  generateTokensForUser
};