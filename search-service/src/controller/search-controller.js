const { Search } = require("../models/Search");
const logger = require("../utils/logger");

const searchPostController = async (req, res) => {
  logger.info("Search endpoint hit!");
  try {
    const { query } = req.query;
    const cacheKey = `search:post:${query}`;
    const cacheResult = await req.redisClient.get(cacheKey);

    if (cacheResult) {
      logger.info("Cache endpoint hit result found for : ", cacheKey);
      return res.status(200).json(JSON.parse(cacheResult));
    }

    const results = await Search.find(
      {
        $text: { $search: query },
      },
      {
        score: { $meta: "textScore" },
      }
    )
      .sort({ score: { $meta: "textScore" } })
      .limit(10);

    //implementing cache for 300 seconds;
    if (!results.length) {
      return res.status(400).json({
        success: false,
        message: "No post exists",
      });
    }

    await req.redisClient.setex(cacheKey, 300, JSON.stringify(results));

    // Need a better approach after deleting search we need a cache removing option

    res.status(200).json(results);
  } catch (error) {
    logger.error("Error while searching post", error);
    res.status(500).json({
      success: false,
      message: "Error while searching post",
    });
  }
};

module.exports = { searchPostController };
