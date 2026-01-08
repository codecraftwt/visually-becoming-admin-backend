const firebase = require("../services/firebaseService");
const multer = require("multer");
const { getConfig } = require("../config/guidedContentConfig");

// Unified collection name for all guided content
const CONTENT_COLLECTION = "admin_guidedContent";
const CATEGORY_COLLECTION = "admin_guidedContentCategories";

/**
 * Create multer upload middleware for a specific content type
 */
const createUploadMiddleware = (contentType) => {
  const config = getConfig(contentType);
  const storage = multer.memoryStorage();
  
  return multer({
    storage: storage,
    limits: { 
      fileSize: config.maxFileSize,
      files: config.maxFiles 
    },
    fileFilter: (req, file, cb) => {
      // Check if file type matches allowed MIME types
      const isAllowed = config.allowedMimeTypes.some(mimeType => {
        if (mimeType.endsWith('/*')) {
          return file.mimetype.startsWith(mimeType.slice(0, -2));
        }
        return file.mimetype === mimeType;
      });
      
      if (isAllowed) {
        cb(null, true);
      } else {
        cb(new Error(`File type not allowed. Allowed types: ${config.allowedMimeTypes.join(', ')}`), false);
      }
    }
  }).array('mediaFiles', config.maxFiles);
};

// ==================== CATEGORY OPERATIONS ====================

/**
 * Get all categories for a content type with item counts
 */
exports.getCategories = async (req, res, next) => {
  try {
    const { contentType } = req.params;
    const categories = await firebase.getAll(CATEGORY_COLLECTION);
    const contentItems = await firebase.getAll(CONTENT_COLLECTION);
    
    // Filter categories by contentType
    const filteredCategories = categories.filter(cat => cat.contentType === contentType);
    
    // Filter content items by contentType
    const filteredContentItems = contentItems.filter(item => item.contentType === contentType);
    
    // Add item count to each category
    const categoriesWithCounts = filteredCategories.map(category => {
      const itemCount = filteredContentItems.filter(item => item.categoryId === category.id).length;
      return {
        ...category,
        itemCount
      };
    });
    
    res.json(categoriesWithCounts);
  } catch (err) {
    next(err);
  }
};

/**
 * Create a new category for a content type
 */
exports.createCategory = async (req, res, next) => {
  try {
    const { contentType } = req.params;
    const categoryData = {
      ...req.body,
      contentType // Ensure contentType is set
    };
    const newCategory = await firebase.create(CATEGORY_COLLECTION, categoryData);
    res.json(newCategory);
  } catch (err) {
    next(err);
  }
};

/**
 * Update a category
 */
exports.updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updated = await firebase.update(CATEGORY_COLLECTION, id, req.body);
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

/**
 * Delete a category
 */
exports.deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    await firebase.deleteItem(CATEGORY_COLLECTION, id);
    res.json({ message: "Category deleted successfully", id });
  } catch (err) {
    next(err);
  }
};

// ==================== CONTENT OPERATIONS ====================

/**
 * Get all content items for a content type
 */
exports.getContent = async (req, res, next) => {
  try {
    const { contentType } = req.params;
    const data = await firebase.getAll(CONTENT_COLLECTION);
    // Filter by contentType
    const filteredData = data.filter(item => item.contentType === contentType);
    res.json(filteredData);
  } catch (err) {
    next(err);
  }
};

/**
 * Get content items by category
 */
exports.getContentByCategory = async (req, res, next) => {
  try {
    const { contentType, categoryId } = req.params;
    const data = await firebase.getAll(CONTENT_COLLECTION);
    const filteredData = data.filter(
      item => item.contentType === contentType && item.categoryId === categoryId
    );
    res.json(filteredData);
  } catch (err) {
    next(err);
  }
};

/**
 * Create a new content item
 * 
 * Supports two modes:
 * 1. Direct client uploads: Files are pre-uploaded to Firebase Storage, 
 *    and this endpoint receives metadata with file URLs (JSON body)
 * 2. Backend uploads: Files are sent via FormData and uploaded by backend (legacy)
 */
exports.createContent = async (req, res, next) => {
  try {
    const { contentType } = req.params;
    const config = getConfig(contentType);
    let contentData = { ...req.body };
    
    // Ensure contentType is set
    contentData.contentType = contentType;

    // Convert string booleans to actual booleans
    if (contentData.isPublished === "true") contentData.isPublished = true;
    if (contentData.isPublished === "false") contentData.isPublished = false;
    if (contentData.isPremium === "true") contentData.isPremium = true;
    if (contentData.isPremium === "false") contentData.isPremium = false;

    // Handle media files
    const media = [];
    
    // MODE 1: Direct client uploads - files already uploaded, media array provided
    if (req.body.media && Array.isArray(req.body.media)) {
      // Files are already uploaded to Firebase Storage by the client
      // Just use the media array as-is
      media.push(...req.body.media);
    }
    // MODE 2: Backend uploads - files sent via FormData (legacy support)
    else if (req.files && req.files.length > 0) {
      // Handle uploaded files (audio files) - legacy mode
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        const fileUrl = await firebase.uploadContentFile(file, file.originalname, contentType);
        const gender = req.body.genders && req.body.genders[i] 
          ? (req.body.genders[i] === 'male' ? 'm' : 'f')
          : (config.supportsGender ? 'm' : undefined);
        
        media.push({
          type: 'audio',
          url: fileUrl,
          ...(gender && { gender })
        });
      }
    }

    // Handle YouTube URLs (for FormData requests - legacy)
    if (req.body.youtubeUrls && !req.body.media) {
      const youtubeUrls = Array.isArray(req.body.youtubeUrls) 
        ? req.body.youtubeUrls 
        : [req.body.youtubeUrls];
      
      for (const youtubeUrl of youtubeUrls) {
        if (youtubeUrl) {
          const videoId = firebase.extractYouTubeId(youtubeUrl);
          if (videoId) {
            media.push({
              type: 'youtube',
              url: youtubeUrl,
              videoId: videoId,
              thumbnailUrl: firebase.getYouTubeThumbnail(videoId)
            });
          }
        }
      }
    }

    contentData.media = media;
    contentData.createdAt = new Date().toISOString();
    contentData.updatedAt = new Date().toISOString();

    const newItem = await firebase.create(CONTENT_COLLECTION, contentData);
    res.json(newItem);
  } catch (err) {
    next(err);
  }
};

/**
 * Update a content item
 * 
 * Supports two modes:
 * 1. Direct client uploads: Files are pre-uploaded to Firebase Storage, 
 *    and this endpoint receives metadata with file URLs (JSON body)
 * 2. Backend uploads: Files are sent via FormData and uploaded by backend (legacy)
 */
exports.updateContent = async (req, res, next) => {
  try {
    const { contentType, id } = req.params;
    const config = getConfig(contentType);
    let updateData = { ...req.body };

    // Convert string booleans to actual booleans
    if (updateData.isPublished === "true") updateData.isPublished = true;
    if (updateData.isPublished === "false") updateData.isPublished = false;
    if (updateData.isPremium === "true") updateData.isPremium = true;
    if (updateData.isPremium === "false") updateData.isPremium = false;

    // MODE 1: Direct client uploads - media array provided with pre-uploaded URLs
    if (req.body.media && Array.isArray(req.body.media)) {
      // Files are already uploaded to Firebase Storage by the client
      // Handle deleted media indices if provided
      if (req.body.deletedMediaIndices && Array.isArray(req.body.deletedMediaIndices)) {
        // Get current content to find URLs of deleted media
        const contentItems = await firebase.getAll(CONTENT_COLLECTION);
        const currentItem = contentItems.find(item => item.id === id);
        
        if (currentItem && currentItem.media) {
          // Delete files from storage for deleted media
          for (const index of req.body.deletedMediaIndices) {
            if (currentItem.media[index] && currentItem.media[index].type === 'audio') {
              await firebase.deleteContentFile(currentItem.media[index].url, contentType);
            }
          }
        }
      }
      
      // Use the provided media array directly
      updateData.media = req.body.media;
    }
    // MODE 2: Backend uploads - files sent via FormData (legacy support)
    else {
      // Parse existing media data
      let existingMedia = [];
      if (req.body.existingMedia) {
        const existingMediaData = Array.isArray(req.body.existingMedia)
          ? req.body.existingMedia
          : [req.body.existingMedia];

        existingMedia = existingMediaData.map(item => {
          try {
            return typeof item === 'string' ? JSON.parse(item) : item;
          } catch (e) {
            return item;
          }
        });
      }

      // Handle new file uploads
      const newMedia = [];
      if (req.files && req.files.length > 0) {
        const existingMediaCount = existingMedia.length;
        for (let i = 0; i < req.files.length; i++) {
          const file = req.files[i];
          const fileUrl = await firebase.uploadContentFile(file, file.originalname, contentType);
          const genderIndex = existingMediaCount + i;
          const gender = req.body.genders && req.body.genders[genderIndex]
            ? (req.body.genders[genderIndex] === 'male' ? 'm' : 'f')
            : (config.supportsGender ? 'm' : undefined);
          
          newMedia.push({
            type: 'audio',
            url: fileUrl,
            ...(gender && { gender })
          });
        }
      }

      // Handle YouTube URLs
      if (req.body.youtubeUrls) {
        const youtubeUrls = Array.isArray(req.body.youtubeUrls) 
          ? req.body.youtubeUrls 
          : [req.body.youtubeUrls];
        
        for (const youtubeUrl of youtubeUrls) {
          if (youtubeUrl) {
            const videoId = firebase.extractYouTubeId(youtubeUrl);
            if (videoId) {
              newMedia.push({
                type: 'youtube',
                url: youtubeUrl,
                videoId: videoId,
                thumbnailUrl: firebase.getYouTubeThumbnail(videoId)
              });
            }
          }
        }
      }

      // Handle deleted media indices
      if (req.body.deletedMediaIndices) {
        const deletedIndices = typeof req.body.deletedMediaIndices === 'string'
          ? JSON.parse(req.body.deletedMediaIndices)
          : req.body.deletedMediaIndices;
        
        // Delete files from storage for deleted media
        for (const index of deletedIndices) {
          if (existingMedia[index] && existingMedia[index].type === 'audio') {
            await firebase.deleteContentFile(existingMedia[index].url, contentType);
          }
        }
        
        // Remove deleted items from array
        existingMedia = existingMedia.filter((_, index) => !deletedIndices.includes(index));
      }

      // Combine existing and new media
      updateData.media = [...existingMedia, ...newMedia];
    }

    updateData.updatedAt = new Date().toISOString();

    const updated = await firebase.update(CONTENT_COLLECTION, id, updateData);
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

/**
 * Delete a content item
 */
exports.deleteContent = async (req, res, next) => {
  try {
    const { contentType, id } = req.params;

    // Get the content item first to delete associated media files
    const contentItems = await firebase.getAll(CONTENT_COLLECTION);
    const contentItem = contentItems.find(item => item.id === id);

    if (contentItem && contentItem.media && Array.isArray(contentItem.media)) {
      // Delete all associated media files from Firebase Storage
      for (const mediaItem of contentItem.media) {
        if (mediaItem.type === 'audio' && mediaItem.url) {
          await firebase.deleteContentFile(mediaItem.url, contentType);
        }
      }
    }

    // Delete the document from Firestore
    await firebase.deleteItem(CONTENT_COLLECTION, id);
    res.json({ message: "Content item deleted successfully", id });
  } catch (err) {
    next(err);
  }
};

/**
 * Get upload middleware for a content type
 */
exports.getUploadMiddleware = (contentType) => {
  return createUploadMiddleware(contentType);
};
