const firebase = require("../services/firebaseService");

const COLLECTION = "admin_audio_categories";

exports.getAudioCategories = async (req, res, next) => {
  try {
    const data = await firebase.getAll(COLLECTION);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

exports.createAudioCategory = async (req, res, next) => {
  try {
    const newCat = await firebase.create(COLLECTION, req.body);
    res.json(newCat);
  } catch (err) {
    next(err);
  }
};

exports.updateAudioCategory = async (req, res, next) => {
  try {
    const updated = await firebase.update(COLLECTION, req.params.id, req.body);
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

exports.deleteAudioCategory = async (req, res, next) => {
  try {
    const deleted = await firebase.deleteItem(COLLECTION, req.params.id);
    res.json({ message: "Audio category deleted successfully", deleted });
  } catch (err) {
    next(err);
  }
};