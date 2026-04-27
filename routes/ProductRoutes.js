const express = require("express");
const multer = require("multer");
const {
  getProducts,
  createProduct,
  getDetailProduct,
  deleteProduct,
  updateProduct,
  getMyProducts,
  toggleProductStatus
} = require("../controllers/ProductController");
const { protect, restrictTo } = require("../middlewares/auth");

const upload = multer({ dest: "uploads/products/" });
const router = express.Router();

// Public
router.get("/", getProducts);
router.get("/:id", getDetailProduct);

router.post(
  "/",
  protect,
  restrictTo("admin"),
  upload.single("thumbnail"),
  createProduct,
);
router.patch(
  "/:id",
  protect,
  restrictTo("admin"),
  upload.single("thumbnail"),
  updateProduct,
);
router.delete("/:id", protect, restrictTo("admin"), deleteProduct);
router.get("/my/products", protect, restrictTo("admin"), getMyProducts);
// (+dari fe)
router.patch("/:id/toggle", protect, restrictTo("admin"), toggleProductStatus);

module.exports = router;
