const express = require("express");
const multer = require("multer");
const { uploadFile } = require("../controllers/FileController");

const upload = multer({ storage: multer.memoryStorage() }); // ganti ke memory
const router = express.Router();

router.post("/upload", upload.single("file"), uploadFile);

module.exports = router;