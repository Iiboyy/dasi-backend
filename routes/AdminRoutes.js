const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  deleteUser,
  getAllProducts,
  deleteProduct,
  getAllTransactions,
  getDashboardSummary,
} = require("../controllers/AdminController");
const { getAllReviews } = require("../controllers/ReviewController");
const { protect, restrictTo } = require("../middlewares/auth");

router.use(protect);
router.use(restrictTo("admin"));

router.get("/dashboard", getDashboardSummary);
router.get("/users", getAllUsers);
router.delete("/users/:id", deleteUser);
router.get("/products", getAllProducts);
router.delete("/products/:id", deleteProduct);
router.get("/transactions", getAllTransactions);
router.get("/reviews", getAllReviews);

module.exports = router;
