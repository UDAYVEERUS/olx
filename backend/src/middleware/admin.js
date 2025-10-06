const { sendError } = require('../utils/helpers');

// Check if user is admin
const adminOnly = (req, res, next) => {
  if (!req.user) {
    return sendError(res, 401, 'Authentication required');
  }
  
  if (!req.user.isAdmin) {
    return sendError(res, 403, 'Access denied. Admin privileges required');
  }
  
  next();
};

// Check if user is admin or owns the resource
const adminOrOwner = (userField = 'seller') => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 401, 'Authentication required');
    }
    
    // Admin can access everything
    if (req.user.isAdmin) {
      return next();
    }
    
    // Check if user owns the resource
    const resourceOwnerId = req.resource?.[userField]?.toString() || req.params.userId;
    if (resourceOwnerId === req.user._id.toString()) {
      return next();
    }
    
    return sendError(res, 403, 'Access denied. Insufficient privileges');
  };
};

module.exports = {
  adminOnly,
  adminOrOwner
};