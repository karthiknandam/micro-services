const logger = require("../utils/logger");
const jwt = require("jsonwebtoken");
const validateToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    logger.warn("Invalid token");
    return res.status(400).json({
      success: false,
      message: "Invalid token / Please login",
      token,
      hell: "hi",
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      logger.warn("Unauthorzed token / Please Login");
      return res.status(400).json({
        success: false,
        token,
        secreat: process.env.JWT_SECRET,
        message: "Unauthorized token / Please Login",
        err,
      });
    }

    req.user = user;
    next();
  });
};
module.exports = { validateToken };
