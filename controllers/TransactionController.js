const Transaction = require("../models/Transaction");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const midtransClient = require("midtrans-client");

const snap = new midtransClient.Snap({
  isProduction: false,
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY,
});

exports.createTransaction = async (req, res) => {
  try {
    const { payment_method = "midtrans", selected_product_ids } = req.body;

    const cart = await Cart.findOne({ buyer_id: req.user._id }).populate(
      "items.product_id",
      "name price stock",
    );

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const cartItems = selected_product_ids?.length
      ? cart.items.filter((item) =>
          selected_product_ids.includes(item.product_id._id.toString()),
        )
      : cart.items;

    if (cartItems.length === 0) {
      return res.status(400).json({ message: "Tidak ada produk yang dipilih" });
    }

    for (const item of cartItems) {
      const product = item.product_id;
      if (!product)
        return res.status(404).json({ message: "Product not found" });
      if (product.stock < item.quantity) {
        return res.status(400).json({
          message: `Stok ${product.name} tidak cukup`,
        });
      }
    }

    const items = cartItems.map((item) => ({
      product_id: item.product_id._id,
      name: item.product_id.name,
      price: item.product_id.price,
      quantity: item.quantity,
      thumbnail: item.product_id.thumbnail,
    }));

    const total_amount = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    const transaction_id = "TRX-" + Date.now();

    let payment_url = null;
    let midtrans_token = null;

    if (payment_method === "midtrans") {
      const parameter = {
        transaction_details: {
          order_id: transaction_id,
          gross_amount: total_amount,
        },
        customer_details: {
          first_name: req.user.name,
          email: req.user.email,
        },
        item_details: items.map((item) => ({
          id: item.product_id.toString(),
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
      };
      const midtransTransaction = await snap.createTransaction(parameter);
      payment_url = midtransTransaction.redirect_url;
      midtrans_token = midtransTransaction.token;
    }

    await Transaction.create({
      transaction_id,
      buyer_id: req.user._id,
      items,
      total_amount,
      payment_url,
      midtrans_token,
      payment_method,
      status: "pending",
    });

    for (const item of items) {
      await Product.findByIdAndUpdate(item.product_id, {
        $inc: { stock: -item.quantity },
      });
    }

    if (selected_product_ids?.length) {
      cart.items = cart.items.filter(
        (item) =>
          !selected_product_ids.includes(item.product_id._id.toString()),
      );
      await cart.save();
    } else {
      await Cart.findOneAndDelete({ buyer_id: req.user._id });
    }

    res.status(201).json({
      message: "Transaction created",
      transaction_id,
      token: midtrans_token,
      payment_url,
      total_amount,
      payment_method,
    });
  } catch (err) {
    console.error("createTransaction error:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.cancelTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      transaction_id: req.params.id,
      buyer_id: req.user._id,
    });

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }
    if (transaction.status !== "pending") {
      return res
        .status(400)
        .json({ message: "Hanya pesanan pending yang bisa dibatalkan" });
    }

    const elapsed = Date.now() - new Date(transaction.createdAt).getTime();
    if (elapsed > 24 * 60 * 60 * 1000) {
      return res
        .status(400)
        .json({ message: "Melewati batas waktu pembatalan (24 jam)" });
    }

    for (const item of transaction.items) {
      await Product.findByIdAndUpdate(item.product_id, {
        $inc: { stock: item.quantity },
      });
    }

    transaction.status = "failed";
    await transaction.save();

    res.status(200).json({ message: "Pesanan berhasil dibatalkan" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.midtransWebhook = async (req, res) => {
  try {
    const notification = await snap.transaction.notification(req.body);
    const { order_id, transaction_status, fraud_status } = notification;

    let mappedStatus = "pending";
    if (transaction_status === "capture") {
      mappedStatus = fraud_status === "accept" ? "paid" : "failed";
    } else if (transaction_status === "settlement") {
      mappedStatus = "paid";
    } else if (["cancel", "deny", "expire"].includes(transaction_status)) {
      mappedStatus = transaction_status === "expire" ? "expired" : "failed";
    }

    await Transaction.findOneAndUpdate(
      { transaction_id: order_id },
      { status: mappedStatus },
    );

    res.status(200).json({ message: "Webhook received" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

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

exports.getMyTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({
      buyer_id: req.user._id,
    }).sort({ createdAt: -1 });
    res.status(200).json(transactions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getTransactionById = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      transaction_id: req.params.id,
      buyer_id: req.user._id,
    });
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }
    res.status(200).json(transaction);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// (+dari fe) Admin update status
exports.updateTransactionStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatus = ["pending", "paid", "failed", "expired"];
    if (!allowedStatus.includes(status)) {
      return res.status(400).json({ message: "Status tidak valid" });
    }

    const transaction = await Transaction.findOneAndUpdate(
      { transaction_id: req.params.id },
      { status },
      { new: true }
    );

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    res.status(200).json(transaction);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};