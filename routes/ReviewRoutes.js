const express = require("express");
const router = express.Router();
const {
  getProductReviews,
  createReview,
  updateReview,
  deleteReview,
} = require("../controllers/ReviewController");
const { protect, restrictTo } = require("../middlewares/auth");

// Public
router.get("/:product_id", getProductReviews);

// Buyer only
router.post("/", protect, restrictTo("buyer"), createReview);
router.patch("/:id", protect, restrictTo("buyer"), updateReview);
router.delete("/:id", protect, restrictTo("buyer"), deleteReview);

module.exports = router;
