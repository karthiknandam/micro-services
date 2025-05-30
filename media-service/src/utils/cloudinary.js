const { v2: cloudinary } = require("cloudinary");
const logger = require("./logger");
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

const uploadMediaCloudinary = async (file) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "auto",
      },
      (error, result) => {
        if (error) {
          logger.error("Error while uploading media", error);
          reject(error);
        } else {
          resolve(result);
        }
      }
    );
    uploadStream.end(file.buffer);
  });
};

const deleteMediaCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    logger.info("Post Deleted ✅");
    return result;
  } catch (error) {
    logger.warn("Internal server error : ", error);
  }
};

module.exports = {
  uploadMediaCloudinary,
  deleteMediaCloudinary,
};
