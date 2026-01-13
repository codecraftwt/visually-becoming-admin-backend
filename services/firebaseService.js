// const db = require("../config/firebase");

// const firebaseService = {
//   getAll: async (collection) => {
//     const snapshot = await db.collection(collection).get();
//     return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
//   },

//   getById: async (collection, id) => {
//     const doc = await db.collection(collection).doc(id).get();
//     return doc.exists ? { id: doc.id, ...doc.data() } : null;
//   },

//   create: async (collection, data) => {
//     const ref = await db.collection(collection).add(data);
//     const doc = await ref.get();
//     return { id: doc.id, ...doc.data() };
//   },

//   update: async (collection, id, data) => {
//     await db.collection(collection).doc(id).update(data);
//     return { id, ...data };
//   },

//   delete: async (collection, id) => {
//     await db.collection(collection).doc(id).delete();
//     return { id, deleted: true };
//   }
// };

// module.exports = firebaseService;


const { db, bucket } = require("../config/firebase");

// Generic Firebase CRUD helpers
exports.getAll = async (collection) => {
  try {
    if (!db) {
      throw new Error('Firebase database not initialized. Check FIREBASE_SERVICE_ACCOUNT_KEY environment variable.');
    }
    if (!collection) {
      throw new Error('Collection name is required');
    }
    const snapshot = await db.collection(collection).get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error(`[firebaseService.getAll] Error fetching from collection ${collection}:`, {
      message: error.message,
      stack: error.stack,
      collection: collection
    });
    throw error;
  }
};

exports.create = async (collection, data) => {
  const docRef = await db.collection(collection).add(data);
  return { id: docRef.id, ...data };
};

exports.update = async (collection, id, data) => {
  await db.collection(collection).doc(id).update(data);
  const updated = await db.collection(collection).doc(id).get();
  return { id: updated.id, ...updated.data() };
};

exports.deleteItem = async (collection, id) => {
  await db.collection(collection).doc(id).delete();
  return { id };
};

exports.uploadAudioFile = async (file, filename) => {
  const fileRef = bucket.file(`guided-audio/${Date.now()}-${filename}`);

  const stream = fileRef.createWriteStream({
    metadata: {
      contentType: file.mimetype,
    },
  });

  return new Promise((resolve, reject) => {
    stream.on('error', (error) => {
      reject(error);
    });

    stream.on('finish', async () => {
      // Make the file publicly accessible
      await fileRef.makePublic();

      // Get the public URL
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileRef.name}`;

      resolve(publicUrl);
    });

    stream.end(file.buffer);
  });
};

exports.deleteAudioFile = async (fileUrl) => {
  if (!fileUrl) return;

  // Extract filename from URL
  const urlParts = fileUrl.split('/');
  const filename = urlParts[urlParts.length - 1];
  if (filename) {
    const fileRef = bucket.file(`guided-audio/${filename}`);
    try {
      await fileRef.delete();
    } catch (error) {
      console.log('File not found or already deleted:', error.message);
    }
  }
};

/**
 * Generic file upload function for guided content
 * @param {Object} file - Multer file object
 * @param {string} filename - Original filename
 * @param {string} contentType - Content type (e.g., 'audio', 'meditation')
 * @returns {Promise<string>} Public URL of uploaded file
 */
exports.uploadContentFile = async (file, filename, contentType) => {
  const { getBucket } = require('../config/guidedContentConfig');
  const bucketName = getBucket(contentType);
  const fileRef = bucket.file(`${bucketName}/${Date.now()}-${filename}`);

  const stream = fileRef.createWriteStream({
    metadata: {
      contentType: file.mimetype,
    },
  });

  return new Promise((resolve, reject) => {
    stream.on('error', (error) => {
      reject(error);
    });

    stream.on('finish', async () => {
      // Make the file publicly accessible
      await fileRef.makePublic();

      // Get the public URL
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileRef.name}`;

      resolve(publicUrl);
    });

    stream.end(file.buffer);
  });
};

/**
 * Generic file delete function for guided content
 * @param {string} fileUrl - URL of file to delete
 * @param {string} contentType - Content type (e.g., 'audio', 'meditation')
 * @returns {Promise<void>}
 */
exports.deleteContentFile = async (fileUrl, contentType) => {
  if (!fileUrl) return;

  const { getBucket } = require('../config/guidedContentConfig');
  const bucketName = getBucket(contentType);

  // Extract filename from URL
  const urlParts = fileUrl.split('/');
  const filename = urlParts[urlParts.length - 1];
  
  if (filename) {
    const fileRef = bucket.file(`${bucketName}/${filename}`);
    try {
      await fileRef.delete();
    } catch (error) {
      console.log('File not found or already deleted:', error.message);
    }
  }
};

/**
 * Extract YouTube video ID from URL
 * @param {string} url - YouTube URL
 * @returns {string|null} Video ID or null if invalid
 */
exports.extractYouTubeId = (url) => {
  if (!url) return null;
  
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return null;
};

/**
 * Get YouTube thumbnail URL
 * @param {string} videoId - YouTube video ID
 * @returns {string} Thumbnail URL
 */
exports.getYouTubeThumbnail = (videoId) => {
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
};
