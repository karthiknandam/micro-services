// Creating post controller for create

const { Post } = require("../models/Post");
const logger = require("../utils/logger");
const { validateCreatedPost } = require("../utils/validation");
const create = async (req, res) => {
  logger.info("Entered create gateway");

  try {
    const { error } = validateCreatedPost(req.body);

    if (error) {
      logger.warn("Validation error", error.details[0].message);
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }
    // No need to create error login here cause middlware hadles all of it ;

    const { content, mediaIds } = req.body;
    const newlyCreatedPost = await Post.create({
      user: req.user.userId,
      content,
      mediaIds: mediaIds || [],
    });

    await newlyCreatedPost.save();

    // Saved and goes to next sending rqbbit mq
    res.status(200).json({
      success: true,
      message: "Post created succesfully ✅",
    });
  } catch (error) {
    logger.warn("Internal server error");
    res.status(500).json({
      success: false,
      messgae: "Internal server error",
    });
  }
};
const getAllPost = async (req, res) => {
  logger.info("Entered getAllPost gateway");

  try {
  } catch (error) {
    logger.warn("Internal server error");
    res.status(500).json({
      success: false,
      messgae: "Internal server error",
    });
  }
};
const getPost = async (req, res) => {
  logger.info("Entered getPost gateway");

  try {
  } catch (error) {
    logger.warn("Internal server error");
    res.status(500).json({
      success: false,
      messgae: "Internal server error",
    });
  }
};

const deletePost = async (req, res) => {
  logger.info("Entered deletePost gateway");

  try {
  } catch (error) {
    logger.warn("Internal server error");
    res.status(500).json({
      success: false,
      messgae: "Internal server error",
    });
  }
};

module.exports = {
  create,
  getAllPost,
  getPost,
  deletePost,
};
