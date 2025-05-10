const logger = require("../utils/logger");

const authenticationRequest = async (req, res, next) => {
  const userId = req.headers["x-user-id"];

  if (!userId) {
    logger.warn("Invalid credentials / Please Login");
    return res.status(400).json({
      success: false,
      message: "Invalid credentials / Please Login",
    });
  }

  req.user = { userId };
  next();
};

module.exports = {
  authenticationRequest,
};
