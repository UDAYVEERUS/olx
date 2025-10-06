const User = require('../models/User');
const Listing = require('../models/Listing');
const Category = require('../models/Category');
const Chat = require('../models/Chat');
const { sendResponse, sendError, asyncHandler, getPagination } = require('../utils/helpers');

// @desc    Get admin dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private/Admin
const getDashboardStats = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    totalListings,
    activeListings,
    pendingListings,
    totalCategories,
    totalChats
  ] = await Promise.all([
    User.countDocuments({ isActive: true }),
    Listing.countDocuments(),
    Listing.countDocuments({ status: 'active' }),
    Listing.countDocuments({ status: 'pending' }),
    Category.countDocuments({ isActive: true }),
    Chat.countDocuments({ isActive: true })
  ]);
  
  const stats = {
    totalUsers,
    totalListings,
    activeListings,
    pendingListings,
    totalCategories,
    totalChats,
    totalRevenue: 0 // Placeholder for payment integration
  };
  
  sendResponse(res, 200, stats, 'Dashboard stats retrieved successfully');
});

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query.page, req.query.limit);
  const { search, isActive } = req.query;
  
  let filter = {};
  
  // Search filter
  if (search) {
    filter.$or = [
      { name: new RegExp(search, 'i') },
      { email: new RegExp(search, 'i') }
    ];
  }
  
  // Active status filter
  if (isActive !== undefined) {
    filter.isActive = isActive === 'true';
  }
  
  const [users, total] = await Promise.all([
    User.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    User.countDocuments(filter)
  ]);
  
  const pagination = {
    page,
    limit,
    total,
    pages: Math.ceil(total / limit)
  };
  
  sendResponse(res, 200, { users, pagination }, 'Users retrieved successfully');
});

// @desc    Get single user details
// @route   GET /api/admin/users/:id
// @access  Private/Admin
const getUserDetails = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
    .populate('listings');
  
  if (!user) {
    return sendError(res, 404, 'User not found');
  }
  
  // Get user's listing stats
  const listingStats = await Listing.aggregate([
    { $match: { seller: user._id } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
  
  const stats = {
    active: 0,
    sold: 0,
    deleted: 0,
    pending: 0
  };
  
  listingStats.forEach(stat => {
    stats[stat._id] = stat.count;
  });
  
  sendResponse(res, 200, { user, stats }, 'User details retrieved successfully');
});

// @desc    Ban/Unban user
// @route   PATCH /api/admin/users/:id/ban
// @access  Private/Admin
const toggleUserStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  
  if (!user) {
    return sendError(res, 404, 'User not found');
  }
  
  // Prevent admin from banning themselves
  if (user._id.toString() === req.user._id.toString()) {
    return sendError(res, 400, 'You cannot ban yourself');
  }
  
  // Toggle user status
  user.isActive = !user.isActive;
  await user.save();
  
  const action = user.isActive ? 'unbanned' : 'banned';
  sendResponse(res, 200, { user }, `User ${action} successfully`);
});

// @desc    Get all listings for admin
// @route   GET /api/admin/listings
// @access  Private/Admin
const getListingsForAdmin = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query.page, req.query.limit);
  const { status, category } = req.query;
  
  let filter = {};
  
  if (status) filter.status = status;
  if (category) filter.category = category;
  
  const [listings, total] = await Promise.all([
    Listing.find(filter)
      .populate('seller', 'name email avatar')
      .populate('category', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Listing.countDocuments(filter)
  ]);
  
  const pagination = {
    page,
    limit,
    total,
    pages: Math.ceil(total / limit)
  };
  
  sendResponse(res, 200, { listings, pagination }, 'Listings retrieved successfully');
});

// @desc    Approve/Reject listing
// @route   PATCH /api/admin/listings/:id/status
// @access  Private/Admin
const updateListingStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  
  if (!['active', 'pending', 'deleted'].includes(status)) {
    return sendError(res, 400, 'Invalid status value');
  }
  
  const listing = await Listing.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true }
  ).populate('seller', 'name email')
   .populate('category', 'name');
  
  if (!listing) {
    return sendError(res, 404, 'Listing not found');
  }
  
  sendResponse(res, 200, { listing }, `Listing status updated to ${status}`);
});

// @desc    Delete listing permanently
// @route   DELETE /api/admin/listings/:id
// @access  Private/Admin
const deleteListing = asyncHandler(async (req, res) => {
  const listing = await Listing.findByIdAndDelete(req.params.id);
  
  if (!listing) {
    return sendError(res, 404, 'Listing not found');
  }
  
  sendResponse(res, 200, null, 'Listing deleted permanently');
});

// @desc    Get recent activities
// @route   GET /api/admin/activities
// @access  Private/Admin
const getRecentActivities = asyncHandler(async (req, res) => {
  const [recentUsers, recentListings] = await Promise.all([
    User.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email createdAt'),
    Listing.find({ status: { $ne: 'deleted' } })
      .populate('seller', 'name')
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title seller createdAt status')
  ]);
  
  const activities = {
    recentUsers,
    recentListings
  };
  
  sendResponse(res, 200, activities, 'Recent activities retrieved successfully');
});

module.exports = {
  getDashboardStats,
  getUsers,
  getUserDetails,
  toggleUserStatus,
  getListingsForAdmin,
  updateListingStatus,
  deleteListing,
  getRecentActivities
};