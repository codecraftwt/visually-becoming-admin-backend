const express = require("express");
const router = express.Router();
const {
  getAffirmations,
  createAffirmation,
  updateAffirmation
} = require("../controllers/dailyAffirmationController");

router.get("/", getAffirmations);
router.post("/", createAffirmation);
router.put("/:id", updateAffirmation);

module.exports = router;
