const Review = require("../models/Review");

// Get semua review produk
exports.getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ product_id: req.params.product_id })
      .populate("user_id", "name")
      .sort({ createdAt: -1 });
    res.status(200).json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Tambah review
exports.createReview = async (req, res) => {
  const { product_id, rating, comment } = req.body;
  try {
    const existing = await Review.findOne({
      product_id,
      user_id: req.user._id,
    });

    if (existing) {
      return res
        .status(400)
        .json({ message: "Kamu sudah mereview produk ini" });
    }

    const review = await Review.create({
      product_id,
      user_id: req.user._id,
      rating,
      comment,
    });

    await review.populate("user_id", "name");
    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update review
exports.updateReview = async (req, res) => {
  try {
    const review = await Review.findOne({
      _id: req.params.id,
      user_id: req.user._id,
    });

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    review.rating = req.body.rating || review.rating;
    review.comment = req.body.comment || review.comment;
    await review.save();

    res.status(200).json(review);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Hapus review
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findOne({
      _id: req.params.id,
      user_id: req.user._id,
    });

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    await review.deleteOne();
    res.status(200).json({ message: "Review deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get semua review
exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate("user_id", "name email")
      .populate("product_id", "name")
      .sort({ createdAt: -1 });
    res.status(200).json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
