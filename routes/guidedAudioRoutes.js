const express = require("express");
const router = express.Router();
const {
  getGuidedAudio,
  createGuidedAudio,
  updateGuidedAudio
} = require("../controllers/guidedAudioController");

router.get("/", getGuidedAudio);
router.post("/", createGuidedAudio);
router.put("/:id", updateGuidedAudio);

module.exports = router;
