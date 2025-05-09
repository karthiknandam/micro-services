require("dotenv").config();
const express = require("express");
const cors = require("cors");
const logger = require("./utils/logger");
const { RateLimiterRedis } = require("rate-limiter-flexible");
const helemet = require("helmet");
const { identityRoute } = require("./routes/identity-route");
const { Redis } = require("ioredis");
const { RedisStore } = require("rate-limit-redis");
const { rateLimit } = require("express-rate-limit");
const app = express();

// Connnection to DB

const mongoose = require("mongoose");
const errorHandler = require("./middleware/errorHandler");
const User = require("./models/user");
mongoose
  .connect(process.env.DATABASE_URL)
  .then(() => {
    logger.info("Connection succesfull");
  })
  .catch((err) => {
    logger.error(err);
  });

const redisClient = new Redis(process.env.REDIS_URL);

// Middlewares;

app.use(helemet());
app.use(express.json());
app.use(cors());

app.use((req, res, next) => {
  logger.info(`Recieved ${req.method} request to ${req.url}`);
  logger.info(`Request body , ${req.body}`);
  next();
});

// Ratelimiting redis client;

const ratelimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: "middleware",
  points: 10,
  duration: 1,
});

app.use((req, res, next) => {
  ratelimiter
    .consume(req.ip)
    .then(() => next())
    .catch(() => {
      logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
      res.status(429).json({ success: false, message: "Too many requests" });
    });
});

// Ip based DDOS protection ;

const sensitiveEndpointsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`Sensitive endpoint rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({ success: false, message: "Too many requests" });
  },
  store: new RedisStore({
    sendCommand: (...args) => redisClient.call(...args),
  }),
});

app.use("/api/auth/register", sensitiveEndpointsLimiter);

// Routes;

app.get("/", (req, res) => {
  res.json({
    msg: "Hello",
  });
});

app.post("/bla", async (req, res) => {
  const { email, password, username } = req.body;
  const user = await User.create({
    email,
    password,
    username,
  });

  res.json({
    user,
  });
});
app.use("/api/auth", identityRoute);

// app.use(errorHandler);

app.listen(3001, () => {
  console.log("App is listening in the port 3000");
});
