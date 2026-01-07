const { isValidContentType } = require('../config/guidedContentConfig');

/**
 * Middleware to validate contentType parameter in route
 */
exports.validateContentType = (req, res, next) => {
  const { contentType } = req.params;
  
  if (!contentType) {
    return res.status(400).json({ 
      error: 'Content type parameter is required' 
    });
  }
  
  if (!isValidContentType(contentType)) {
    return res.status(400).json({ 
      error: `Invalid content type: ${contentType}. Valid types: ${require('../config/guidedContentConfig').getValidContentTypes().join(', ')}` 
    });
  }
  
  // Attach config to request for use in controllers
  req.contentTypeConfig = require('../config/guidedContentConfig').getConfig(contentType);
  next();
};
