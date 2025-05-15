require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const logger = require("./utils/logger");
const Redis = require("ioredis");
const { router } = require("./routes/search-route");
const { connectRabbitmq, consumeEvent } = require("./utils/rabbitmq");
const {
  handlePostCreated,
  handlePostDeleted,
} = require("./event-handlers/search-event-handler");

const app = express();
mongoose
  .connect(process.env.DATABASE_URL)
  .then(() => {
    logger.info("Connection succesfull to database");
  })
  .catch((e) => {
    logger.info("Database connection error", e);
  });

app.use(cors());
app.use(helmet());
app.use(express.json());

const redisClient = new Redis(process.env.REDIS_URL);

app.use(
  "/api/search",
  (req, res, next) => {
    req.redisClient = redisClient;
    next();
  },
  router
);

const startServer = async () => {
  try {
    await connectRabbitmq();

    await consumeEvent("post.created", handlePostCreated);
    await consumeEvent("post.deleted", handlePostDeleted);

    app.listen(3004, () => {
      logger.info("search service is running in the port 3004");
    });
  } catch (error) {
    logger.info("Internal server error : ", error);
  }
};

startServer();
