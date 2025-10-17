// const express = require("express");
// const router = express.Router();
// const categoryController = require("../controllers/categoryController");

// router.get("/", categoryController.getAllCategories);
// router.post("/", categoryController.createCategory);
// router.put("/:id", categoryController.updateCategory);

// module.exports = router;


const express = require("express");
const router = express.Router();
const {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
} = require("../controllers/categoryController");

router.get("/", getCategories);
router.post("/", createCategory);
router.put("/:id", updateCategory);
router.delete("/:id", deleteCategory);

module.exports = router;
