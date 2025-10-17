const firebase = require("../services/firebaseService");

const COLLECTION = "admin_categories";

exports.getCategories = async (req, res, next) => {
  try {
    const data = await firebase.getAll(COLLECTION);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

exports.createCategory = async (req, res, next) => {
  try {
    const newCat = await firebase.create(COLLECTION, req.body);
    res.json(newCat);
  } catch (err) {
    next(err);
  }
};

exports.updateCategory = async (req, res, next) => {
  try {
    const updated = await firebase.update(COLLECTION, req.params.id, req.body);
    res.json(updated);
  } catch (err) {
    next(err);
  }
};


exports.deleteCategory = async (req, res, next) => {
  try {
    const deleted = await firebase.deleteItem(COLLECTION, req.params.id);
    res.json({ message: "Category deleted successfully", deleted });
  } catch (err) {
    next(err);
  }
};