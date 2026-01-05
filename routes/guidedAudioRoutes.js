const express = require("express");
const router = express.Router();
const {
  getGuidedAudio,
  getGuidedAudioByCategory,
  createGuidedAudio,
  updateGuidedAudio,
  updateGuidedAudioWithFile,
  deleteGuidedAudio,
  uploadAudio
} = require("../controllers/guidedAudioController");

// Configure multer for multiple files
const multer = require("multer");
const storage = multer.memoryStorage();
const uploadMultiple = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit per file
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed!'), false);
    }
  }
}).array('audioFiles', 10); // Allow up to 10 audio files

router.get("/", getGuidedAudio);
router.get("/category/:categoryId", getGuidedAudioByCategory);
router.post("/", uploadMultiple, createGuidedAudio);
router.put("/:id", uploadMultiple, updateGuidedAudioWithFile);
router.delete("/:id", deleteGuidedAudio);

module.exports = router;
