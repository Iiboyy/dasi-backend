const Product = require("../models/Product");
const cloudinary = require("../config/cloudinary");

// Get semua produk
exports.getProducts = async (req, res) => {
  try {
    const { category, search } = req.query;

    let filter = {};
    if (category) filter.category = category;
    if (search) filter.name = { $regex: search, $options: "i" };

    const products = await Product.find(filter).populate(
      "seller_id",
      "name email",
    );
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get detail produk
exports.getDetailProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "seller_id",
      "name email",
    );
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Tambah produk baru
exports.createProduct = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Thumbnail is required" });
    }

    const result = await cloudinary.uploader.upload(req.file.path);

    const product = await Product.create({
      ...req.body,
      seller_id: req.user._id,
      thumbnail: result.secure_url,
      cloudinaryId: result.public_id,
    });

    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Update produk
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.seller_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    let result;
    if (req.file) {
      await cloudinary.uploader.destroy(product.cloudinaryId);

      result = await cloudinary.uploader.upload(req.file.path);
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        thumbnail: result?.secure_url || product.thumbnail,
        cloudinaryId: result?.public_id || product.cloudinaryId,
      },
      { returnDocument: "after" },
    );

    res.status(200).json(updatedProduct);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Hapus produk
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.seller_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await cloudinary.uploader.destroy(product.cloudinaryId);
    await product.deleteOne();

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMyProducts = async (req, res) => {
  try {
    const products = await Product.find({ seller_id: req.user._id });
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// (+dari fe) Toggle status produk
exports.toggleProductStatus = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    product.active = !product.active;
    await product.save();

    res.status(200).json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};