const express = require("express");
const multer = require("multer");
const { authenticationRequest } = require("../middleware/authMiddleware");
const { uploadMedia } = require("../controller/media-controller");
const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
}).single("file");

router.post(
  "/upload",
  authenticationRequest,
  (req, res, next) => {
    upload(req, res, function (error) {
      if (error instanceof multer.MulterError) {
        logger.warn("Multer error whilte uploading to cloud :  ", error);
        return res.status(400).json({
          message: "Multer error while uploading",
          err: error.message,
          stack: error.stack,
        });
      } else if (error) {
        logger.warn("Uncaught error while uploading to Multer");
        res.status(500).json({
          message: "Uncaught error while uploading to Multer",
          err: error.message,
          stack: error.stack,
        });
      }

      if (!req.file) {
        return res.status(400).json({
          message: "File not found",
        });
      }
      next();
    });
  },
  uploadMedia
);

module.exports = {
  router,
};
