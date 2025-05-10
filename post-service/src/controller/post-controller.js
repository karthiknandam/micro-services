// Creating post controller for create

const { Post } = require("../models/Post");
const logger = require("../utils/logger");
const { validateCreatedPost } = require("../utils/validation");

const invalidateCache = async (req, index = "none") => {
  if (index != "none") {
    const cacheKey = `post:${index}`;
    await req.redisClient.del(cacheKey);
  }
  const keys = await req.redisClient.keys(`posts:*`);
  if (keys.length > 0) {
    await req.redisClient.del(keys);
  }
};

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

    // implementing invalidate Cache before sending it;

    await invalidateCache(req);

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
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;

    const cacheKey = `posts:${page}:${limit}`;
    const cachePosts = await req.redisClient.get(cacheKey);

    if (cachePosts) {
      return res.json(JSON.parse(cachePosts));
    }
    const posts = await Post.find({})
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);

    const totalNumerOfPosts = await Post.countDocuments();

    const result = {
      posts,
      currentPage: page,
      totalPosts: totalNumerOfPosts,
      totalPages: Math.ceil(totalNumerOfPosts / limit),
    };

    await req.redisClient.setex(cacheKey, 300, JSON.stringify(result));

    res.status(200).json(result);
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
    const postId = req.params.id;
    const cacheKey = `post:${postId}`;

    const cachePost = await req.redisClient.get(cacheKey);
    if (cachePost) {
      return res.json(JSON.parse(cachePost));
    }

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(400).json({
        message: "Unable to find post",
        success: false,
      });
    }

    await req.redisClient.setex(cacheKey, 3600, JSON.stringify(post));

    res.status(200).json({
      success: true,
      post,
    });
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
    const post = await Post.findOneAndDelete({
      _id: req.params.id,
      user: req.user.userId,
    });

    if (!post) {
      return res.status(400).json({
        success: false,
        message: "post not found",
      });
    }

    await invalidateCache(req, req.params.id);

    res.status(200).json({
      success: true,
      message: "Post deleted ✅",
    });
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
