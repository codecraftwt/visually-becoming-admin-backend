const firebase = require("../services/firebaseService");
const COLLECTION = "admin_guidedMeditations";

exports.getGuidedMeditations = async (req, res, next) => {
  try {
    const data = await firebase.getAll(COLLECTION);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

exports.createGuidedMeditation = async (req, res, next) => {
  try {
    const newItem = await firebase.create(COLLECTION, req.body);
    res.json(newItem);
  } catch (err) {
    next(err);
  }
};

exports.updateGuidedMeditation = async (req, res, next) => {
  try {
    const updated = await firebase.update(COLLECTION, req.params.id, req.body);
    res.json(updated);
  } catch (err) {
    next(err);
  }
};
