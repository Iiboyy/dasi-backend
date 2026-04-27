const express = require("express");
const router = express.Router();
const authController = require("../controllers/AuthController");

router.post("/register", authController.register);
router.post("/signin", authController.signIn);
router.post("/reset-password", authController.resetPassword);

module.exports = router;
