const express = require('express');
const { protect, optionalAuth } = require('../middleware/auth');
const { uploadMultiple } = require('../middleware/upload');
const { 
  validateListing, 
  validateObjectId, 
  validatePagination 
} = require('../middleware/validation');
const {
  getListings,
  getListing,
  createListing,
  updateListing,
  deleteListing,
  getMyListings,
  searchListings
} = require('../controllers/listingController');

const router = express.Router();

// Public routes
router.get('/', validatePagination, optionalAuth, getListings);
router.get('/search', validatePagination, searchListings);

// Protected routes - MUST come before /:id route
router.post('/', protect, uploadMultiple('images'), validateListing, createListing);
router.get('/user/my-listings', protect, validatePagination, getMyListings); // Move this before /:id

// Dynamic routes LAST
router.get('/:id', validateObjectId(), getListing);
router.put('/:id', protect, validateObjectId(), uploadMultiple('images'), updateListing);
router.delete('/:id', protect, validateObjectId(), deleteListing);

module.exports = router;