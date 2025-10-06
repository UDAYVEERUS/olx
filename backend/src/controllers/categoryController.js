const Category = require('../models/Category');
const { sendResponse, sendError, asyncHandler } = require('../utils/helpers');

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({ isActive: true })
    .populate('listingsCount')
    .sort({ name: 1 });
  
  sendResponse(res, 200, { categories }, 'Categories retrieved successfully');
});

// @desc    Get single category
// @route   GET /api/categories/:id
// @access  Public
const getCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id)
    .populate('listingsCount');
  
  if (!category) {
    return sendError(res, 404, 'Category not found');
  }
  
  sendResponse(res, 200, { category }, 'Category retrieved successfully');
});

// @desc    Get category by slug
// @route   GET /api/categories/slug/:slug
// @access  Public
const getCategoryBySlug = asyncHandler(async (req, res) => {
  const category = await Category.findOne({ slug: req.params.slug, isActive: true })
    .populate('listingsCount');
  
  if (!category) {
    return sendError(res, 404, 'Category not found');
  }
  
  sendResponse(res, 200, { category }, 'Category retrieved successfully');
});

// @desc    Create category
// @route   POST /api/categories
// @access  Private/Admin
const createCategory = asyncHandler(async (req, res) => {
  const { name, description, icon } = req.body;
  
  const category = await Category.create({
    name,
    description,
    icon
  });
  
  sendResponse(res, 201, { category }, 'Category created successfully');
});

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private/Admin
const updateCategory = asyncHandler(async (req, res) => {
  const { name, description, icon, isActive } = req.body;
  
  const category = await Category.findByIdAndUpdate(
    req.params.id,
    { name, description, icon, isActive },
    { new: true, runValidators: true }
  );
  
  if (!category) {
    return sendError(res, 404, 'Category not found');
  }
  
  sendResponse(res, 200, { category }, 'Category updated successfully');
});

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  );
  
  if (!category) {
    return sendError(res, 404, 'Category not found');
  }
  
  sendResponse(res, 200, null, 'Category deleted successfully');
});

module.exports = {
  getCategories,
  getCategory,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory
};