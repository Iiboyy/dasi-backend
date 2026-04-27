const Category = require("../models/Category");

// GET ALL
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find().populate("products");

    const result = categories.map((cat) => ({
      _id: cat._id,
      name: cat.name,
      icon: cat.icon,
      active: cat.active,
      products: cat.products,
      productCount: cat.products.length,
      createdAt: cat.createdAt,
      updatedAt: cat.updatedAt,
    }));

    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET BY ID
exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id).populate("products");

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json(category);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// CREATE
exports.createCategory = async (req, res) => {
  try {
    const { name, icon, active, products } = req.body;

    const category = await Category.create({
      name,
      icon,
      active,
      products,
    });

    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UPDATE
exports.updateCategory = async (req, res) => {
  try {
    const { name, icon, active, products } = req.body;

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { name, icon, active, products },
      { new: true }
    ).populate("products");

    res.status(200).json(category);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE
exports.deleteCategory = async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Category deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};