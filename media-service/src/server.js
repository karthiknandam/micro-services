require("dotenv").config();
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const express = require("express");
const logger = require("./utils/logger");
const { router } = require("./routes/media-route");

const app = express();

mongoose
  .connect(process.env.DATABASE_URL)
  .then(() => {
    logger.info("Database is connected succesfully ✅");
  })
  .catch((err) => {
    logger.warn("Error while connecting database", err);
  });

// Middlewares;

app.use(express.json());
app.use(helmet());
app.use(cors());

// Routing handler;

app.use("/api/media", router);

const startServer = async () => {
  try {
    app.listen(3003, () => {
      logger.info("Media-service is running in port 3000");
    });
  } catch (error) {
    logger.warn("Internal server error", error);
  }
};

startServer();
