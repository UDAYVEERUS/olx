const Listing = require('../models/Listing');
const { uploadToCloudinary } = require('../config/cloudinary');
const { sendResponse, sendError, asyncHandler, getPagination } = require('../utils/helpers');

// @desc    Get all listings
// @route   GET /api/listings
// @access  Public
const getListings = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query.page, req.query.limit);
  const { category, minPrice, maxPrice, condition, location, search } = req.query;

  // Build filter object
  let filter = { status: 'active' };

  // Category filter - ensure proper comparison
  if (category) {
    filter.category = category; // This should match the stored category ID
  }
  
  if (condition) filter.condition = condition;
  if (location) filter.location = new RegExp(location, 'i');

  // Price range filter
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = parseFloat(minPrice);
    if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
  }

  // Search filter
  if (search) {
    filter.$text = { $search: search };
  }

  console.log('Filter object:', filter); // DEBUG - Check this in backend logs

  // Get listings with pagination
  const [listings, total] = await Promise.all([
    Listing.find(filter)
      .populate('category', 'name slug')
      .populate('seller', 'name avatar phone')
      .sort({ isPremium: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Listing.countDocuments(filter)
  ]);

  console.log(`Found ${listings.length} listings for category ${category}`); // DEBUG

  const pagination = {
    page,
    limit,
    total,
    pages: Math.ceil(total / limit)
  };

  sendResponse(res, 200, { listings, pagination }, 'Listings retrieved successfully');
});

// @desc    Get single listing
// @route   GET /api/listings/:id
// @access  Public
const getListing = asyncHandler(async (req, res) => {
  const listing = await Listing.findById(req.params.id)
    .populate('category', 'name slug')
    .populate('seller', 'name avatar phone email');

  if (!listing || listing.status === 'deleted') {
    return sendError(res, 404, 'Listing not found');
  }

  // Increment view count (don't wait for it)
  Listing.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }).exec();

  sendResponse(res, 200, { listing }, 'Listing retrieved successfully');
});

// @desc    Create new listing
// @route   POST /api/listings
// @access  Private
const createListing = asyncHandler(async (req, res) => {
  const { title, description, price, category, location, condition, isNegotiable } = req.body;

  // Handle image uploads
  let imageUrls = [];
  if (req.files && req.files.length > 0) {
    const uploadPromises = req.files.map(file =>
      uploadToCloudinary(file.buffer, 'listings') // works now with memoryStorage
    );
    console.log("REQ FILES:", req.files?.map(f => ({ field: f.fieldname, size: f.size, mimetype: f.mimetype })));
    try {
      const uploadResults = await Promise.all(
        req.files.map(file => uploadToCloudinary(file.buffer, 'listings'))
      );
      console.log("Upload results:", uploadResults);
      imageUrls = uploadResults.map(r => r.secure_url);
    } catch (err) {
      console.error("Cloudinary error:", err);
      return sendError(res, 500, 'Error uploading images');
    }
  }

  // Create listing
  const listing = await Listing.create({
    title,
    description,
    price,
    category,
    location,
    condition,
    isNegotiable,
    images: imageUrls,
    seller: req.user._id
  });

  // Populate the created listing
  const populatedListing = await Listing.findById(listing._id)
    .populate('category', 'name slug')
    .populate('seller', 'name avatar');

  sendResponse(res, 201, { listing: populatedListing }, 'Listing created successfully');
});

// @desc    Update listing
// @route   PUT /api/listings/:id
// @access  Private
const updateListing = asyncHandler(async (req, res) => {
  let listing = await Listing.findById(req.params.id);

  if (!listing) {
    return sendError(res, 404, 'Listing not found');
  }

  // Check ownership (admin can edit any listing)
  if (listing.seller.toString() !== req.user._id.toString() && !req.user.isAdmin) {
    return sendError(res, 403, 'Not authorized to update this listing');
  }

  const { title, description, price, category, location, condition, isNegotiable, status } = req.body;

  // Handle new image uploads
  let imageUrls = listing.images;
  if (req.files && req.files.length > 0) {
    const uploadPromises = req.files.map(file =>
      uploadToCloudinary(file.buffer, 'listings')
    );

    try {
      const uploadResults = await Promise.all(
        req.files.map(file => uploadToCloudinary(file.buffer, 'listings'))
      );
      console.log("Upload results:", uploadResults);
      imageUrls = uploadResults.map(r => r.secure_url);
    } catch (err) {
      console.error("Cloudinary error:", err);
      return sendError(res, 500, 'Error uploading images');
    }
  }

  // Update listing
  listing = await Listing.findByIdAndUpdate(
    req.params.id,
    {
      title,
      description,
      price,
      category,
      location,
      condition,
      isNegotiable,
      status,
      images: imageUrls
    },
    { new: true, runValidators: true }
  ).populate('category', 'name slug').populate('seller', 'name avatar');

  sendResponse(res, 200, { listing }, 'Listing updated successfully');
});

// @desc    Delete listing
// @route   DELETE /api/listings/:id
// @access  Private
const deleteListing = asyncHandler(async (req, res) => {
  const listing = await Listing.findById(req.params.id);

  if (!listing) {
    return sendError(res, 404, 'Listing not found');
  }

  // Check ownership (admin can delete any listing)
  if (listing.seller.toString() !== req.user._id.toString() && !req.user.isAdmin) {
    return sendError(res, 403, 'Not authorized to delete this listing');
  }

  // Soft delete by updating status
  await Listing.findByIdAndUpdate(req.params.id, { status: 'deleted' });

  sendResponse(res, 200, null, 'Listing deleted successfully');
});

// @desc    Get user's listings
// @route   GET /api/listings/my-listings
// @access  Private
const getMyListings = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query.page, req.query.limit);

  const [listings, total] = await Promise.all([
    Listing.find({ seller: req.user._id, status: { $ne: 'deleted' } })
      .populate('category', 'name slug')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Listing.countDocuments({ seller: req.user._id, status: { $ne: 'deleted' } })
  ]);

  const pagination = {
    page,
    limit,
    total,
    pages: Math.ceil(total / limit)
  };

  sendResponse(res, 200, { listings, pagination }, 'Your listings retrieved successfully');
});

// @desc    Search listings
// @route   GET /api/listings/search
// @access  Public
const searchListings = asyncHandler(async (req, res) => {
  const { q, page, limit, skip } = { ...req.query, ...getPagination(req.query.page, req.query.limit) };

  if (!q || q.trim().length === 0) {
    return sendError(res, 400, 'Search query is required');
  }

  const searchQuery = {
    status: 'active',
    $text: { $search: q }
  };

  const [listings, total] = await Promise.all([
    Listing.find(searchQuery)
      .populate('category', 'name slug')
      .populate('seller', 'name avatar')
      .sort({ score: { $meta: 'textScore' } })
      .skip(skip)
      .limit(limit),
    Listing.countDocuments(searchQuery)
  ]);

  const pagination = {
    page,
    limit,
    total,
    pages: Math.ceil(total / limit)
  };

  sendResponse(res, 200, { listings, pagination, query: q }, 'Search results retrieved successfully');
});

module.exports = {
  getListings,
  getListing,
  createListing,
  updateListing,
  deleteListing,
  getMyListings,
  searchListings
};