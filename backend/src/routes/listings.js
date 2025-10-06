// src/routes/listings.js

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');
const {
  getListings,
  getListingById,
  createListing,
  updateListing,
  deleteListing,
  getMyListings,
  searchListings
} = require('../controllers/listingController');

// Public routes - NO authentication required
router.get('/search', searchListings);
router.get('/:id', getListingById);
router.get('/', getListings);

// Protected routes - authentication required
router.post('/', protect, upload.array('images', 5), createListing);
router.put('/:id', protect, upload.array('images', 5), updateListing);
router.delete('/:id', protect, deleteListing);
router.get('/user/my-listings', protect, getMyListings);

module.exports = router;