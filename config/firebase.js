
// backend\config\firebase.js
const admin = require("firebase-admin");
const serviceAccount = require("../serviceAccountKey.json");

// Firebase project configuration (server-side only needs projectId and storageBucket)
const firebaseConfig = {
  projectId: "affirm-2722c",
  storageBucket: "affirm-2722c.appspot.com",
};

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: firebaseConfig.storageBucket,
  });
}

const db = admin.firestore();
const bucket = admin.storage().bucket();

module.exports = { admin, db, bucket };
