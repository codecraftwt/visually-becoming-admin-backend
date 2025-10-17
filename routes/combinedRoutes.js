const express = require("express");
const router = express.Router();
const { getCombinedData } = require("../controllers/combinedController");

router.get("/categories-with-affirmations", getCombinedData);

module.exports = router;