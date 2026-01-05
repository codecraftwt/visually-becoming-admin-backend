const express = require("express");
const router = express.Router();
const {
  getAudioCategories,
  createAudioCategory,
  updateAudioCategory,
  deleteAudioCategory
} = require("../controllers/audioCategoryController");

router.get("/", getAudioCategories);
router.post("/", createAudioCategory);
router.put("/:id", updateAudioCategory);
router.delete("/:id", deleteAudioCategory);

module.exports = router;