
// backend\config\firebase.js
const admin = require("firebase-admin");

// Firebase project configuration (server-side only needs projectId and storageBucket)
const firebaseConfig = {
  projectId: process.env.FIREBASE_PROJECT_ID || "affirm-2722c",
  storageBucket:
    process.env.FIREBASE_STORAGE_BUCKET || "affirm-2722c.appspot.com",
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
} else if (
  process.env.FIREBASE_PROJECT_ID &&
  process.env.FIREBASE_CLIENT_EMAIL &&
  process.env.FIREBASE_PRIVATE_KEY
) {
  // Use individual env vars (common in .env files)
  // NOTE: private keys are often stored with literal "\n" sequences; convert them.
  const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n");

  serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey,
  };
} else {
  // Fallback to file (for local development)
  try {
    serviceAccount = require("../serviceAccountKey.json");
  } catch (error) {
    console.error(
      "Firebase service account key not found. Please set FIREBASE_SERVICE_ACCOUNT_KEY, or set FIREBASE_PROJECT_ID/FIREBASE_CLIENT_EMAIL/FIREBASE_PRIVATE_KEY, or ensure serviceAccountKey.json exists for local development."
    );
    throw error;
  }
}

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: firebaseConfig.storageBucket,
    });
    console.log('[Firebase] Successfully initialized Firebase Admin');
  } catch (error) {
    console.error('[Firebase] Error initializing Firebase Admin:', error.message);
    throw new Error(`Firebase initialization failed: ${error.message}`);
  }
}

let db, bucket;
try {
  db = admin.firestore();
  bucket = admin.storage().bucket();
  console.log('[Firebase] Firestore and Storage initialized');
} catch (error) {
  console.error('[Firebase] Error initializing Firestore/Storage:', error.message);
  throw new Error(`Firebase services initialization failed: ${error.message}`);
}

module.exports = { admin, db, bucket };
