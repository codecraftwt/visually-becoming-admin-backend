const express = require("express");
const router = express.Router({ mergeParams: true }); // mergeParams to access :contentType from parent route
const {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getContent,
  getContentByCategory,
  createContent,
  updateContent,
  deleteContent,
  getUploadMiddleware
} = require("../controllers/guidedContentController");
const { validateContentType } = require("../middleware/contentTypeValidator");

// Apply contentType validation to all routes
router.use(validateContentType);

// ==================== CATEGORY ROUTES ====================
router.get("/categories", getCategories);
router.post("/categories", createCategory);
router.put("/categories/:id", updateCategory);
router.delete("/categories/:id", deleteCategory);

// ==================== CONTENT ROUTES ====================
router.get("/", getContent);
router.get("/category/:categoryId", getContentByCategory);

// Create route with dynamic upload middleware
router.post("/", (req, res, next) => {
  const { contentType } = req.params;
  const uploadMiddleware = getUploadMiddleware(contentType);
  uploadMiddleware(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    next();
  });
}, createContent);

// Update route with dynamic upload middleware
router.put("/:id", (req, res, next) => {
  const { contentType } = req.params;
  const uploadMiddleware = getUploadMiddleware(contentType);
  uploadMiddleware(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    next();
  });
}, updateContent);

router.delete("/:id", deleteContent);

module.exports = router;
