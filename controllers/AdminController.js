const User = require("../models/User");
const Product = require("../models/Product");
const Transaction = require("../models/Transaction");

// Get semua users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get semua produk
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate("seller_id", "name email")
      .sort({ createdAt: -1 });
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete produk 
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    await product.deleteOne();
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get semua transaksi
exports.getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .populate("buyer_id", "name email")
      .sort({ createdAt: -1 });
    res.status(200).json(transactions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Dashboard summary
exports.getDashboardSummary = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: { $ne: "admin" } });
    const totalProducts = await Product.countDocuments();

    const transactions = await Transaction.find()
      .sort({ createdAt: -1 })
      .limit(5);

    const recent_orders = transactions.map((t) => ({
      id: t.transaction_id,
      customer: t.buyer_id,
      total: t.total_amount,
      status: t.status,
    }));

    const stats = {
      revenue: await Transaction.aggregate([
        { $match: { status: "paid" } },
        { $group: { _id: null, total: { $sum: "$total_amount" } } },
      ]).then((r) => r[0]?.total || 0),
      orders: await Transaction.countDocuments(),
      users: totalUsers,
      products: totalProducts,
    };

    const order_status = {
      diproses: await Transaction.countDocuments({ status: "pending" }),
      dikirim: 0,
      selesai: await Transaction.countDocuments({ status: "paid" }),
      dibatalkan: await Transaction.countDocuments({ status: "failed" }),
    };

    const top_products = await Transaction.aggregate([
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.product_id",
          name: { $first: "$items.name" },
          sold: { $sum: "$items.quantity" },
        },
      },
      { $sort: { sold: -1 } },
      { $limit: 5 },
    ]);

    res.json({
      stats,
      recent_orders,
      order_status,
      top_products,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};