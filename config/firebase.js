
// backend\config\firebase.js
const admin = require("firebase-admin");

// Firebase project configuration (server-side only needs projectId and storageBucket)
const firebaseConfig = {
  projectId: "affirm-2722c",
  storageBucket: "affirm-2722c.appspot.com",
};

// Initialize Firebase Admin with environment variables or file
let serviceAccount;

if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
  // Use environment variable (for Vercel/production)
  try {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
  } catch (error) {
    console.error("Error parsing FIREBASE_SERVICE_ACCOUNT_KEY:", error.message);
    throw new Error("Invalid FIREBASE_SERVICE_ACCOUNT_KEY environment variable");
  }
} else {
  // Fallback to file (for local development)
  try {
    serviceAccount = require("../serviceAccountKey.json");
  } catch (error) {
    console.error("Firebase service account key not found. Please set FIREBASE_SERVICE_ACCOUNT_KEY environment variable or ensure serviceAccountKey.json exists for local development.");
    throw error;
  }
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: firebaseConfig.storageBucket,
  });
}

const db = admin.firestore();
const bucket = admin.storage().bucket();

module.exports = { admin, db, bucket };
