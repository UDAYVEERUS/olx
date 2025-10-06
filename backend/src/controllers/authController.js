const User = require('../models/User');
const { generateTokensForUser } = require('../utils/jwt');
const { sendResponse, sendError, asyncHandler } = require('../utils/helpers');

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;
  
  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return sendError(res, 400, 'User with this email already exists');
  }
  
  // Create user
  const user = await User.create({
    name,
    email,
    password,
    phone,
    provider: 'local',
    emailVerified: false
  });
  
  // Generate token
  const { token, user: userData } = generateTokensForUser(user);
  
  sendResponse(res, 201, { token, user: userData }, 'User registered successfully');
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  
  // Find user and include password
  const user = await User.findOne({ email }).select('+password');
  
  // Check if user exists
  if (!user) {
    return sendError(res, 401, 'Invalid email or password');
  }
  
  // Check if user registered with Google
  if (user.provider === 'google' && !user.password) {
    return sendError(res, 401, 'This account was registered with Google. Please use Google Sign-In');
  }
  
  // Check password
  if (!(await user.comparePassword(password))) {
    return sendError(res, 401, 'Invalid email or password');
  }
  
  // Check if user is active
  if (!user.isActive) {
    return sendError(res, 401, 'Account is disabled. Please contact support');
  }
  
  // Update last login
  user.lastLogin = new Date();
  await user.save();
  
  // Generate token
  const { token, user: userData } = generateTokensForUser(user);
  
  sendResponse(res, 200, { token, user: userData }, 'Login successful');
});

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  sendResponse(res, 200, { user }, 'User profile retrieved');
});

// @desc    Update current user profile
// @route   PATCH /api/auth/me
// @access  Private
const updateMe = asyncHandler(async (req, res) => {
  const { name, phone } = req.body;
  
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { name, phone },
    { new: true, runValidators: true }
  );
  
  sendResponse(res, 200, { user }, 'Profile updated successfully');
});

module.exports = {
  register,
  login,
  getMe,
  updateMe
};