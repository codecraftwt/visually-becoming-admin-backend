const express = require("express");
const router = express.Router();
const {
  getNotifications,
  createNotification,
} = require("../controllers/notificationController");

// GET all notifications
router.get("/", getNotifications);

// POST a new notification
router.post("/", createNotification);

module.exports = router;
