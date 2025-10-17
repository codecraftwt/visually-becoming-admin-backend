// const firebase = require("../services/firebaseService");
// const COLLECTION = "admin_notifications";

// exports.getNotifications = async (req, res, next) => {
//   try {
//     const data = await firebase.getAll(COLLECTION);
//     res.json(data);
//   } catch (err) {
//     next(err);
//   }
// };

// exports.createNotification = async (req, res, next) => {
//   try {
//     const newItem = await firebase.create(COLLECTION, req.body);
//     res.json(newItem);
//   } catch (err) {
//     next(err);
//   }
// };
const { admin, db } = require("../config/firebase");


// ✅ GET all notifications (optional, for listing)
exports.getNotifications = async (req, res, next) => {
  try {
    const snapshot = await db.collection("admin_notifications").get();
    const notifications = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    res.json(notifications);
  } catch (error) {
    next(error);
  }
};

// ✅ POST a new notification (send via FCM)
exports.createNotification = async (req, res, next) => {
  try {
    const { userId, title, body } = req.body;

    if (!userId || !title || !body) {
      return res.status(400).json({ error: "userId, title, and body are required" });
    }

    // Get tokens for the user
    const tokensSnapshot = await db
      .collection("device_tokens")
      .where("userId", "==", userId)
      .get();

    if (tokensSnapshot.empty) {
      return res.status(404).json({ error: "No device tokens found for this user" });
    }

    const tokens = tokensSnapshot.docs.map((doc) => doc.data().token);

    const message = {
      notification: {
        title,
        body,
      },
      tokens,
    };

    // Send notifications
    const response = await admin.messaging().sendEachForMulticast(message);

    // Optionally store notification record in Firestore
    await db.collection("admin_notifications").add({
      userId,
      title,
      body,
      sentAt: admin.firestore.FieldValue.serverTimestamp(),
      successCount: response.successCount,
      failureCount: response.failureCount,
    });

    res.json({
      success: true,
      sent: response.successCount,
      failed: response.failureCount,
    });
  } catch (error) {
    console.error("Error sending notification:", error);
    next(error);
  }
};
