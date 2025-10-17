const express = require("express");
const router = express.Router();
const {
  getAffirmations,
  createAffirmation,
  updateAffirmation,
  deleteAffirmation
} = require("../controllers/dailyAffirmationController");

router.get("/", getAffirmations);
router.post("/", createAffirmation);
router.put("/:id", updateAffirmation);
router.delete("/:id", deleteAffirmation);

module.exports = router;
