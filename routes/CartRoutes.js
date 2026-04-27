const express = require("express");
const router = express.Router();
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} = require("../controllers/CartController");
const { protect, restrictTo } = require("../middlewares/auth");

router.use(protect);

router.get("/", getCart);
router.post("/", addToCart);
router.patch("/", updateCartItem);
router.delete("/:product_id", removeFromCart);
router.delete("/", clearCart);

module.exports = router;
