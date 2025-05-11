require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const mongoose = require("mongoose");
const logger = require("./utils/logger");
const { router } = require("./routes/post-route");
const Redis = require("ioredis");
const { connectRabbitmq } = require("./utils/rabbimq");
mongoose
  .connect(process.env.DATABASE_URL)
  .then(() => {
    logger.info("Connection succesfully in the post service ✅");
  })
  .catch((err) => {
    logger.error("Failed to connect to database", err);
  });

const app = express();

const redisClient = new Redis(process.env.REDIS_URL);

app.use(express.json());
app.use(helmet());
app.use(cors());

app.use(
  "/api/posts",
  (req, res, next) => {
    req.redisClient = redisClient;
    next();
  },
  router
);

const startServer = async () => {
  try {
    // Rabbotmq logic
    await connectRabbitmq();
    app.listen(process.env.PORT | 3002, () => {
      logger.info("POST service is listening in the port 3002");
    });
  } catch (error) {
    logger.error("Failed to connect ", error);
  }
};

startServer();
