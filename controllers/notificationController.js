const firebase = require("../services/firebaseService");
const COLLECTION = "admin_notifications";

exports.getNotifications = async (req, res, next) => {
  try {
    const data = await firebase.getAll(COLLECTION);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

exports.createNotification = async (req, res, next) => {
  try {
    const newItem = await firebase.create(COLLECTION, req.body);
    res.json(newItem);
  } catch (err) {
    next(err);
  }
};
