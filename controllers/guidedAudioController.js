const firebase = require("../services/firebaseService");
const COLLECTION = "admin_guidedAudio";

exports.getGuidedAudio = async (req, res, next) => {
  try {
    const data = await firebase.getAll(COLLECTION);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

exports.createGuidedAudio = async (req, res, next) => {
  try {
    const newItem = await firebase.create(COLLECTION, req.body);
    res.json(newItem);
  } catch (err) {
    next(err);
  }
};

exports.updateGuidedAudio = async (req, res, next) => {
  try {
    const updated = await firebase.update(COLLECTION, req.params.id, req.body);
    res.json(updated);
  } catch (err) {
    next(err);
  }
};
