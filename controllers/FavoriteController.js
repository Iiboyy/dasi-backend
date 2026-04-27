const Favorite = require("../models/Favorite");

exports.getFavorites = async (req, res) => {
  try {
    const favorites = await Favorite.find({ user_id: req.user._id }).populate(
      "product_id",
      "name price thumbnail stock category",
    );
    res.status(200).json(favorites);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.toggleFavorite = async (req, res) => {
  const { product_id } = req.body;
  if (!product_id) {
    return res.status(400).json({ message: "product_id is required" });
  }
  try {
    const existing = await Favorite.findOne({
      user_id: req.user._id,
      product_id,
    });

    if (existing) {
      await existing.deleteOne();
      return res
        .status(200)
        .json({ message: "Removed from favorites", isFavorite: false });
    }

    await Favorite.create({ user_id: req.user._id, product_id });
    res.status(201).json({ message: "Added to favorites", isFavorite: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.checkFavorite = async (req, res) => {
  try {
    const favorite = await Favorite.findOne({
      user_id: req.user._id,
      product_id: req.params.product_id,
    });
    res.status(200).json({ isFavorite: !!favorite });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
