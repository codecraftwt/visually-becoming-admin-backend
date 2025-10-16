const express = require("express");
const router = express.Router();
const {
  getGuidedMeditations,
  createGuidedMeditation,
  updateGuidedMeditation,
} = require("../controllers/guidedMeditationController");

// GET all guided meditations
router.get("/", getGuidedMeditations);

// POST a new guided meditation
router.post("/", createGuidedMeditation);

// PUT update guided meditation by ID
router.put("/:id", updateGuidedMeditation);

module.exports = router;
