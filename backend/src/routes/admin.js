const express = require('express');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');
const { validateObjectId, validatePagination } = require('../middleware/validation');
const {
  getDashboardStats,
  getUsers,
  getUserDetails,
  toggleUserStatus,
  getListingsForAdmin,
  updateListingStatus,
  deleteListing,
  getRecentActivities
} = require('../controllers/adminController');

const router = express.Router();

// All routes require admin authentication
router.use(protect, adminOnly);

// Dashboard routes
router.get('/dashboard', getDashboardStats);
router.get('/activities', getRecentActivities);

// User management routes
router.get('/users', validatePagination, getUsers);
router.get('/users/:id', validateObjectId(), getUserDetails);
router.patch('/users/:id/toggle-status', validateObjectId(), toggleUserStatus);

// Listing management routes
router.get('/listings', validatePagination, getListingsForAdmin);
router.patch('/listings/:id/status', validateObjectId(), [
  require('express-validator').body('status').isIn(['active', 'pending', 'deleted']).withMessage('Invalid status'),
  require('../middleware/validation').handleValidationErrors
], updateListingStatus);
router.delete('/listings/:id', validateObjectId(), deleteListing);

module.exports = router;