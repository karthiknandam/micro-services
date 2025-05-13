const { deleteMediaCloudinary } = require("../utils/cloudinary");
const { Media } = require("../models/Media");
const logger = require("../utils/logger");

const handlerMediaDelete = async (event) => {
  const { postId, mediaId } = event;
  try {
    const mediasToDelete = await Media.find({ _id: mediaId }); // Here this might be array or single postID
    for (const media of mediasToDelete) {
      await deleteMediaCloudinary(media.publicId);
      await Media.deleteOne({ _id: media._id });
      logger.info(
        `Deleting media for post id : ${postId} and  media : ${media._id}`
      );
    }
    logger.info("Media deleted succesfull for post : ", postId);
  } catch (error) {
    logger.warn("Error while deleting posts : ", error);
  }
};

module.exports = {
  handlerMediaDelete,
};
