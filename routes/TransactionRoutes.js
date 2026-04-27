const express = require("express");
const router = express.Router();
const {
  createTransaction,
  getAllTransactions,
  getMyTransactions,
  getTransactionById,
} = require("../controllers/TransactionController");
const { protect, restrictTo } = require("../middlewares/auth");
const { cancelTransaction } = require("../controllers/TransactionController");

router.patch("/my/:id/cancel", protect, restrictTo("buyer"), cancelTransaction);

// Buyer
router.post("/", protect, restrictTo("buyer"), createTransaction);
router.get("/my", protect, restrictTo("buyer"), getMyTransactions);
router.get("/my/:id", protect, restrictTo("buyer"), getTransactionById);

// Admin
router.get("/", protect, restrictTo("admin"), getAllTransactions);

// // (+dari fe) Admin update status
const { updateTransactionStatus } = require("../controllers/TransactionController");
router.patch( "/:id/status", protect, restrictTo("admin"), updateTransactionStatus);

module.exports = router;
