const firebase = require("../services/firebaseService");
const COLLECTION = "admin_guidedVisualizations";

exports.getGuidedVisualizations = async (req, res, next) => {
  try {
    const data = await firebase.getAll(COLLECTION);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

exports.createGuidedVisualization = async (req, res, next) => {
  try {
    const newItem = await firebase.create(COLLECTION, req.body);
    res.json(newItem);
  } catch (err) {
    next(err);
  }
};

exports.updateGuidedVisualization = async (req, res, next) => {
  try {
    const updated = await firebase.update(COLLECTION, req.params.id, req.body);
    res.json(updated);
  } catch (err) {
    next(err);
  }
};
