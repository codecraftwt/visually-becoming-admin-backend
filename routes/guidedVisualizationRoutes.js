const express = require("express");
const router = express.Router();
const {
  getGuidedVisualizations,
  createGuidedVisualization,
  updateGuidedVisualization,
} = require("../controllers/guidedVisualizationController");

// GET all guided visualizations
router.get("/", getGuidedVisualizations);

// POST a new guided visualization
router.post("/", createGuidedVisualization);

// PUT update guided visualization by ID
router.put("/:id", updateGuidedVisualization);

module.exports = router;
