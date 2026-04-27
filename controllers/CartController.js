const Cart = require("../models/Cart");
const Product = require("../models/Product");

// Get cart
exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ buyer_id: req.user._id }).populate(
      "items.product_id",
      "name price thumbnail stock",
    );

    if (!cart) {
      return res.status(200).json({ items: [] });
    }

    res.status(200).json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Tambah item ke cart
exports.addToCart = async (req, res) => {
  const { product_id, quantity = 1 } = req.body;

  try {
    const product = await Product.findById(product_id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    if (product.stock < quantity) {
      return res.status(400).json({ message: "Insufficient stock" });
    }

    let cart = await Cart.findOne({ buyer_id: req.user._id });

    if (!cart) {
      cart = await Cart.create({
        buyer_id: req.user._id,
        items: [{ product_id, quantity }],
      });
    } else {
      const itemIndex = cart.items.findIndex(
        (item) => item.product_id.toString() === product_id,
      );

      if (itemIndex > -1) {
        cart.items[itemIndex].quantity += quantity;
      } else {
        cart.items.push({ product_id, quantity });
      }

      await cart.save();
    }

    await cart.populate("items.product_id", "name price thumbnail stock");
    res.status(200).json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update quantity item di cart
exports.updateCartItem = async (req, res) => {
  const { product_id, quantity } = req.body;

  try {
    const cart = await Cart.findOne({ buyer_id: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.product_id.toString() === product_id,
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    if (quantity <= 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity = quantity;
    }

    await cart.save();
    await cart.populate("items.product_id", "name price thumbnail stock");
    res.status(200).json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Hapus item dari cart
exports.removeFromCart = async (req, res) => {
  const { product_id } = req.params;

  try {
    const cart = await Cart.findOne({ buyer_id: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.items = cart.items.filter(
      (item) => item.product_id.toString() !== product_id,
    );

    await cart.save();
    res.status(200).json({ message: "Item removed", cart });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Kosongkan cart
exports.clearCart = async (req, res) => {
  try {
    await Cart.findOneAndDelete({ buyer_id: req.user._id });
    res.status(200).json({ message: "Cart cleared" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
