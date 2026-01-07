const firebase = require("../services/firebaseService");

const COLLECTION = "admin_audio_categories";
const CONTENT_COLLECTION = "admin_guidedAudio";

exports.getAudioCategories = async (req, res, next) => {
  try {
    const categories = await firebase.getAll(COLLECTION);
    const contentItems = await firebase.getAll(CONTENT_COLLECTION);
    
    // Add item count to each category
    const categoriesWithCounts = categories.map(category => {
      const itemCount = contentItems.filter(item => item.categoryId === category.id).length;
      return {
        ...category,
        itemCount
      };
    });
    
    res.json(categoriesWithCounts);
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