// Generate slug from string
const generateSlug = (text) => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// Pagination helper
const getPagination = (page, limit) => {
  const pageNum = parseInt(page) || 1;
  const limitNum = parseInt(limit) || 10;
  const skip = (pageNum - 1) * limitNum;
  
  return {
    page: pageNum,
    limit: limitNum,
    skip
  };
};

// Response helper
const sendResponse = (res, statusCode, data, message) => {
  return res.status(statusCode).json({
    status: statusCode < 400 ? 'success' : 'error',
    message,
    data
  });
};

// Error response helper
const sendError = (res, statusCode, message, errors = null) => {
  const response = {
    status: 'error',
    message
  };
  
  if (errors) {
    response.errors = errors;
  }
  
  return res.status(statusCode).json(response);
};

// Async handler to catch async errors
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  generateSlug,
  getPagination,
  sendResponse,
  sendError,
  asyncHandler
};