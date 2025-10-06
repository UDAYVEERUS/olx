const multer = require('multer');
const { sendError } = require('../utils/helpers');

// Configure multer for memory storage (so we get file.buffer)
const storage = multer.memoryStorage();

// File filter function
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

// Create multer instance
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per file
    files: 5 // max 5 files
  }
});

// Middleware to handle multer errors
const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return sendError(res, 400, 'File size too large. Maximum 5MB allowed');
    } else if (error.code === 'LIMIT_FILE_COUNT') {
      return sendError(res, 400, 'Too many files. Maximum 5 files allowed');
    } else if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return sendError(res, 400, 'Unexpected file field');
    }
  } else if (error.message === 'Only image files are allowed') {
    return sendError(res, 400, 'Only image files are allowed');
  }

  next(error);
};

// Upload single file
const uploadSingle = (fieldName) => [
  upload.single(fieldName),
  handleUploadError
];

// Upload multiple files
const uploadMultiple = (fieldName, maxCount = 5) => [
  upload.array(fieldName, maxCount),
  handleUploadError
];

module.exports = {
  uploadSingle,
  uploadMultiple,
  handleUploadError
};
