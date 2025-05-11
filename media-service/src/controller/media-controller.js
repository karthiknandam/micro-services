const { uploadMediaCloudinary } = require("../utils/cloudinary");
const logger = require("../utils/logger");
const { Media } = require("../models/Media");
const uploadMedia = async (req, res) => {
  logger.info("Enter upload controller");
  try {
    if (!req.file) {
      logger.warn("No file found , Please upload file");
      return res.status(400).json({
        success: false,
        message: "No file found , Please upload ƒile",
      });
    }

    const { originalname, mimetype, buffer } = req.file;
    logger;
    const userId = req.user.userId;

    logger.info("File is uploading ... ", originalname, " mime type", mimetype);

    const cloudinaryUploadResult = await uploadMediaCloudinary(req.file);

    logger.info(
      "Cloudinary file upload was succesfull id 🎯",
      cloudinaryUploadResult.public_id
    );
    const newPost = new Media({
      publicId: cloudinaryUploadResult.public_id,
      originalName: originalname,
      mimeType: mimetype,
      url: cloudinaryUploadResult.secure_url,
      userId,
    });

    await newPost.save();

    res.status(200).json({
      url: newPost.url,
      success: true,
      mediaId: newPost._id,
      message: "Media is uploaded succesfully",
    });
  } catch (error) {
    logger.error("Error creating media", error);
    res.status(500).json({
      success: false,
      message: "Error creating media",
    });
  }
};

module.exports = {
  uploadMedia,
};
