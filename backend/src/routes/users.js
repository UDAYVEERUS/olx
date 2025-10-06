const express = require('express');
const { protect } = require('../middleware/auth');
const { uploadSingle } = require('../middleware/upload');
const { uploadToCloudinary } = require('../config/cloudinary');
const User = require('../models/User');
const { sendResponse, sendError, asyncHandler } = require('../utils/helpers');

const router = express.Router();

// All routes require authentication
router.use(protect);

// @desc    Upload user avatar
// @route   POST /api/users/upload-avatar
// @access  Private
const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    return sendError(res, 400, 'Please select an image file');
  }
  
  try {
    // Upload to Cloudinary
    const result = await uploadToCloudinary(req.file.buffer, 'avatars');
    
    // Update user avatar
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: result.secure_url },
      { new: true }
    );
    
    sendResponse(res, 200, { user }, 'Avatar uploaded successfully');
  } catch (error) {
    console.error('Avatar upload error:', error);
    return sendError(res, 500, 'Error uploading avatar');
  }
});

router.post('/upload-avatar', uploadSingle('image'), uploadAvatar);

module.exports = router;