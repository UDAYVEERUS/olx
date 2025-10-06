const express = require('express');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');
const { validateObjectId } = require('../middleware/validation');
const {
  getCategories,
  getCategory,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/categoryController');

const router = express.Router();

// Public routes
router.get('/', getCategories);
router.get('/slug/:slug', getCategoryBySlug);
router.get('/:id', validateObjectId(), getCategory);

// Admin only routes
router.use(protect, adminOnly);

router.post('/', [
  require('express-validator').body('name').notEmpty().trim().withMessage('Category name is required'),
  require('express-validator').body('description').optional().isLength({ max: 200 }).withMessage('Description too long'),
  require('express-validator').body('icon').optional().notEmpty().withMessage('Icon cannot be empty'),
  require('../middleware/validation').handleValidationErrors
], createCategory);

router.put('/:id', validateObjectId(), updateCategory);
router.delete('/:id', validateObjectId(), deleteCategory);

module.exports = router;