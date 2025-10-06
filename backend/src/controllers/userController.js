const User = require('../models/User');
const Listing = require('../models/Listing');
const { uploadToCloudinary } = require('../config/cloudinary');
const { sendResponse, sendError, asyncHandler, getPagination } = require('../utils/helpers');

// @desc    Get user profile by ID
// @route   GET /api/users/:id
// @access  Public
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
    .select('-password')
    .populate('listings');
  
  if (!user) {
    return sendError(res, 404, 'User not found');
  }
  
  if (!user.isActive) {
    return sendError(res, 404, 'User account is disabled');
  }
  
  // Get user's active listings count
  const activeListingsCount = await Listing.countDocuments({
    seller: user._id,
    status: 'active'
  });
  
  // Get user's total listings count
  const totalListingsCount = await Listing.countDocuments({
    seller: user._id,
    status: { $ne: 'deleted' }
  });
  
  const userProfile = {
    ...user.toJSON(),
    stats: {
      activeListings: activeListingsCount,
      totalListings: totalListingsCount,
      memberSince: user.createdAt
    }
  };
  
  sendResponse(res, 200, { user: userProfile }, 'User profile retrieved successfully');
});

// @desc    Get user's public listings
// @route   GET /api/users/:id/listings
// @access  Public
const getUserListings = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query.page, req.query.limit);
  const userId = req.params.id;
  
  // Check if user exists
  const user = await User.findById(userId).select('name isActive');
  if (!user || !user.isActive) {
    return sendError(res, 404, 'User not found');
  }
  
  const [listings, total] = await Promise.all([
    Listing.find({ 
      seller: userId, 
      status: 'active' 
    })
      .populate('category', 'name slug')
      .populate('seller', 'name avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Listing.countDocuments({ 
      seller: userId, 
      status: 'active' 
    })
  ]);
  
  const pagination = {
    page,
    limit,
    total,
    pages: Math.ceil(total / limit)
  };
  
  sendResponse(res, 200, { 
    listings, 
    pagination, 
    seller: user 
  }, 'User listings retrieved successfully');
});

// @desc    Update current user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone } = req.body;
  
  // Validate input
  if (name && name.trim().length < 2) {
    return sendError(res, 400, 'Name must be at least 2 characters long');
  }
  
  if (phone && !/^[\+]?[1-9][\d]{0,15}$/.test(phone)) {
    return sendError(res, 400, 'Please provide a valid phone number');
  }
  
  const updateData = {};
  if (name) updateData.name = name.trim();
  if (phone !== undefined) updateData.phone = phone; // Allow empty string to clear phone
  
  const user = await User.findByIdAndUpdate(
    req.user._id,
    updateData,
    { new: true, runValidators: true }
  );
  
  sendResponse(res, 200, { user }, 'Profile updated successfully');
});

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
    
    sendResponse(res, 200, { 
      user, 
      avatarUrl: result.secure_url 
    }, 'Avatar uploaded successfully');
  } catch (error) {
    console.error('Avatar upload error:', error);
    return sendError(res, 500, 'Error uploading avatar');
  }
});

// @desc    Delete user avatar
// @route   DELETE /api/users/avatar
// @access  Private
const deleteAvatar = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $unset: { avatar: 1 } }, // Remove avatar field
    { new: true }
  );
  
  sendResponse(res, 200, { user }, 'Avatar removed successfully');
});

// @desc    Get user's dashboard data
// @route   GET /api/users/dashboard
// @access  Private
const getDashboard = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  
  // Get user's listing statistics
  const listingStats = await Listing.aggregate([
    {
      $match: { 
        seller: userId,
        status: { $ne: 'deleted' }
      }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
  
  // Format stats
  const stats = {
    active: 0,
    sold: 0,
    pending: 0,
    total: 0
  };
  
  listingStats.forEach(stat => {
    stats[stat._id] = stat.count;
    stats.total += stat.count;
  });
  
  // Get recent listings
  const recentListings = await Listing.find({
    seller: userId,
    status: { $ne: 'deleted' }
  })
    .populate('category', 'name')
    .sort({ createdAt: -1 })
    .limit(5)
    .select('title price status createdAt category images');
  
  // Get total views for user's listings
  const viewsResult = await Listing.aggregate([
    {
      $match: { 
        seller: userId,
        status: { $ne: 'deleted' }
      }
    },
    {
      $group: {
        _id: null,
        totalViews: { $sum: '$views' }
      }
    }
  ]);
  
  const totalViews = viewsResult.length > 0 ? viewsResult[0].totalViews : 0;
  
  const dashboardData = {
    stats: {
      ...stats,
      totalViews
    },
    recentListings
  };
  
  sendResponse(res, 200, dashboardData, 'Dashboard data retrieved successfully');
});

// @desc    Get user's detailed statistics
// @route   GET /api/users/stats
// @access  Private
const getUserStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  
  // Get detailed statistics
  const [listingStats, monthlyStats] = await Promise.all([
    // Overall listing stats
    Listing.aggregate([
      {
        $match: { 
          seller: userId,
          status: { $ne: 'deleted' }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalViews: { $sum: '$views' },
          avgPrice: { $avg: '$price' }
        }
      }
    ]),
    
    // Monthly listing creation stats (last 12 months)
    Listing.aggregate([
      {
        $match: { 
          seller: userId,
          createdAt: {
            $gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) // Last year
          }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ])
  ]);
  
  const stats = {
    listings: listingStats,
    monthly: monthlyStats,
    accountAge: Math.floor((Date.now() - req.user.createdAt) / (1000 * 60 * 60 * 24)) // Days since account creation
  };
  
  sendResponse(res, 200, { stats }, 'User statistics retrieved successfully');
});

// @desc    Search users
// @route   GET /api/users/search
// @access  Public
const searchUsers = asyncHandler(async (req, res) => {
  const { q, page, limit, skip } = { 
    ...req.query, 
    ...getPagination(req.query.page, req.query.limit) 
  };
  
  if (!q || q.trim().length < 2) {
    return sendError(res, 400, 'Search query must be at least 2 characters');
  }
  
  const searchQuery = {
    isActive: true,
    $or: [
      { name: new RegExp(q, 'i') },
      { email: new RegExp(q, 'i') }
    ]
  };
  
  const [users, total] = await Promise.all([
    User.find(searchQuery)
      .select('name avatar createdAt')
      .sort({ name: 1 })
      .skip(skip)
      .limit(limit),
    User.countDocuments(searchQuery)
  ]);
  
  const pagination = {
    page,
    limit,
    total,
    pages: Math.ceil(total / limit)
  };
  
  sendResponse(res, 200, { 
    users, 
    pagination, 
    query: q 
  }, 'User search results retrieved');
});

// @desc    Get user's favorite listings (placeholder)
// @route   GET /api/users/favorites
// @access  Private
const getFavorites = asyncHandler(async (req, res) => {
  // This would require a favorites/wishlist schema
  // For now, return empty array as placeholder
  const { page, limit, skip } = getPagination(req.query.page, req.query.limit);
  
  // Placeholder implementation
  const favorites = [];
  const total = 0;
  
  const pagination = {
    page,
    limit,
    total,
    pages: Math.ceil(total / limit)
  };
  
  sendResponse(res, 200, { 
    favorites, 
    pagination 
  }, 'Favorites feature coming soon');
});

// @desc    Add listing to favorites
// @route   POST /api/users/favorites/:listingId
// @access  Private
const addToFavorites = asyncHandler(async (req, res) => {
  const listingId = req.params.listingId;
  
  // Check if listing exists
  const listing = await Listing.findById(listingId);
  if (!listing || listing.status !== 'active') {
    return sendError(res, 404, 'Listing not found');
  }
  
  // Placeholder implementation
  sendResponse(res, 200, null, 'Favorites feature coming soon');
});

// @desc    Remove listing from favorites
// @route   DELETE /api/users/favorites/:listingId
// @access  Private
const removeFromFavorites = asyncHandler(async (req, res) => {
  // Placeholder implementation
  sendResponse(res, 200, null, 'Listing removed from favorites (feature coming soon)');
});

// @desc    Deactivate user account
// @route   POST /api/users/deactivate
// @access  Private
const deactivateAccount = asyncHandler(async (req, res) => {
  const { password, reason } = req.body;
  
  if (!password) {
    return sendError(res, 400, 'Password confirmation required');
  }
  
  // Get user with password for verification
  const user = await User.findById(req.user._id).select('+password');
  
  // Verify password
  if (!(await user.comparePassword(password))) {
    return sendError(res, 400, 'Incorrect password');
  }
  
  // Deactivate account
  user.isActive = false;
  await user.save();
  
  // Also deactivate all user's listings
  await Listing.updateMany(
    { seller: user._id, status: 'active' },
    { status: 'deleted' }
  );
  
  // Log the deactivation reason
  console.log(`User ${user.email} deactivated account. Reason: ${reason || 'Not provided'}`);
  
  sendResponse(res, 200, null, 'Account deactivated successfully');
});

// @desc    Get user's notifications (placeholder)
// @route   GET /api/users/notifications
// @access  Private
const getNotifications = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query.page, req.query.limit);
  
  // Placeholder implementation
  const notifications = [];
  const total = 0;
  const unreadCount = 0;
  
  const pagination = {
    page,
    limit,
    total,
    pages: Math.ceil(total / limit)
  };
  
  sendResponse(res, 200, { 
    notifications, 
    pagination, 
    unreadCount 
  }, 'Notifications feature coming soon');
});

// @desc    Mark notification as read
// @route   PATCH /api/users/notifications/:id/read
// @access  Private
const markNotificationRead = asyncHandler(async (req, res) => {
  // Placeholder implementation
  sendResponse(res, 200, null, 'Notification marked as read (feature coming soon)');
});

// @desc    Get user's activity history
// @route   GET /api/users/activity
// @access  Private
const getActivity = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query.page, req.query.limit);
  const userId = req.user._id;
  
  // Get recent activities from listings
  const activities = await Listing.find({
    seller: userId,
    status: { $ne: 'deleted' }
  })
    .populate('category', 'name')
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(limit)
    .select('title status createdAt updatedAt category')
    .lean();
  
  // Transform to activity format
  const formattedActivities = activities.map(listing => ({
    type: 'listing',
    action: listing.createdAt.getTime() === listing.updatedAt.getTime() ? 'created' : 'updated',
    title: listing.title,
    category: listing.category.name,
    status: listing.status,
    date: listing.updatedAt
  }));
  
  const total = await Listing.countDocuments({
    seller: userId,
    status: { $ne: 'deleted' }
  });
  
  const pagination = {
    page,
    limit,
    total,
    pages: Math.ceil(total / limit)
  };
  
  sendResponse(res, 200, { 
    activities: formattedActivities, 
    pagination 
  }, 'Activity history retrieved successfully');
});

module.exports = {
  getUserProfile,
  getUserListings,
  updateProfile,
  uploadAvatar,
  deleteAvatar,
  getDashboard,
  getUserStats,
  searchUsers,
  getFavorites,
  addToFavorites,
  removeFromFavorites,
  deactivateAccount,
  getNotifications,
  markNotificationRead,
  getActivity
};