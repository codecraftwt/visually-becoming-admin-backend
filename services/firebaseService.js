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
  const snapshot = await db.collection(collection).get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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
