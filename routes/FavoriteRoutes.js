const express = require("express");
const router = express.Router();
const {
  getFavorites,
  toggleFavorite,
  checkFavorite,
} = require("../controllers/FavoriteController");
const { protect, restrictTo } = require("../middlewares/auth");

router.use(protect);
router.use(restrictTo("buyer"));

router.get("/", getFavorites);
router.post("/", toggleFavorite);
router.get("/check/:product_id", checkFavorite);

module.exports = router;
