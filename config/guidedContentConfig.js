/**
 * Guided Content Type Configuration
 * 
 * This configuration drives the behavior of the generic guided content system.
 * To add a new content type, simply add an entry here - no code changes needed!
 */

const GUIDED_CONTENT_CONFIG = {
  audio: {
    bucket: 'guided-audio',
    mediaTypes: ['audio'],
    supportsGender: true,
    maxFileSize: 50 * 1024 * 1024, // 50MB
    maxFiles: 10,
    allowedMimeTypes: ['audio/*']
  },
  meditation: {
    bucket: 'guided-meditation',
    mediaTypes: ['audio'],
    supportsGender: true,
    maxFileSize: 50 * 1024 * 1024, // 50MB
    maxFiles: 10,
    allowedMimeTypes: ['audio/*']
  },
  visualization: {
    bucket: 'guided-visualization',
    mediaTypes: ['audio', 'youtube'],
    supportsGender: true,
    maxFileSize: 50 * 1024 * 1024, // 50MB
    maxFiles: 10,
    allowedMimeTypes: ['audio/*']
  }
};

/**
 * Get configuration for a content type
 * @param {string} contentType - The content type (e.g., 'audio', 'meditation')
 * @returns {object} Configuration object
 */
exports.getConfig = (contentType) => {
  const config = GUIDED_CONTENT_CONFIG[contentType];
  if (!config) {
    throw new Error(`Invalid content type: ${contentType}. Valid types: ${Object.keys(GUIDED_CONTENT_CONFIG).join(', ')}`);
  }
  return config;
};

/**
 * Check if content type is valid
 * @param {string} contentType - The content type to validate
 * @returns {boolean}
 */
exports.isValidContentType = (contentType) => {
  return contentType in GUIDED_CONTENT_CONFIG;
};

/**
 * Get all valid content types
 * @returns {string[]}
 */
exports.getValidContentTypes = () => {
  return Object.keys(GUIDED_CONTENT_CONFIG);
};

/**
 * Get storage bucket for content type
 * @param {string} contentType - The content type
 * @returns {string} Bucket name
 */
exports.getBucket = (contentType) => {
  return exports.getConfig(contentType).bucket;
};

/**
 * Get media types supported by content type
 * @param {string} contentType - The content type
 * @returns {string[]} Array of media types
 */
exports.getMediaTypes = (contentType) => {
  return exports.getConfig(contentType).mediaTypes;
};

/**
 * Check if content type supports gender selection
 * @param {string} contentType - The content type
 * @returns {boolean}
 */
exports.supportsGender = (contentType) => {
  return exports.getConfig(contentType).supportsGender;
};

module.exports = GUIDED_CONTENT_CONFIG;
module.exports.getConfig = exports.getConfig;
module.exports.isValidContentType = exports.isValidContentType;
module.exports.getValidContentTypes = exports.getValidContentTypes;
module.exports.getBucket = exports.getBucket;
module.exports.getMediaTypes = exports.getMediaTypes;
module.exports.supportsGender = exports.supportsGender;
