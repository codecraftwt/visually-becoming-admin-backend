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


const { db } = require("../config/firebase");

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
