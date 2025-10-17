// visually-becoming-admin-backend\index.js
const functions = require("firebase-functions");
const app = require("./server");

exports.api = functions.https.onRequest(app);
