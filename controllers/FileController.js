const cloudinary = require("../config/cloudinary");
const File = require("../models/File");
const streamifier = require("streamifier");

exports.uploadFile = async (req, res) => {
  try {
    const uploadFromBuffer = () => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "dasi" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });
    };

    const result = await uploadFromBuffer();

    const file = new File({
      name: req.file.originalname,
      url: result.secure_url,
      cloudinaryId: result.public_id,
    });

    await file.save();
    res.status(201).json(file);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "File upload failed" });
  }
};