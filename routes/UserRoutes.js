const express = require("express");
const multer = require("multer");
const router = express.Router();
const {
  getUsers,
  getMyProfile,
  updateMyProfile,
  updateProfilePhoto,
  updatePassword,
  getUserById,
  deleteUser,
} = require("../controllers/UserController");
const { protect, restrictTo } = require("../middlewares/auth");

const upload = multer({ dest: "uploads/" });

// Private — user sendiri
router.get("/me", protect, getMyProfile);
router.patch("/me", protect, updateMyProfile);
router.patch("/me/photo", protect, upload.single("photo"), updateProfilePhoto);
router.patch("/me/password", protect, updatePassword);

// Admin only
router.get("/", protect, restrictTo("admin"), getUsers);
router.get("/:id", protect, restrictTo("admin"), getUserById);
router.delete("/:id", protect, restrictTo("admin"), deleteUser);

module.exports = router;
