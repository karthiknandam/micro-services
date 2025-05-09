// Register user

const { ref } = require("joi");
const RefreshToken = require("../models/refreshToken");
const User = require("../models/user");
const generateTokens = require("../utils/generateToken");
const logger = require("../utils/logger");
const { validateRegistration, validateLogin } = require("../utils/validation");

const registerUser = async (req, res) => {
  logger.info("User entered Registration");
  //   validation cheeck if user entered correct schema or not
  try {
    const { error } = validateRegistration(req.body);
    if (error) {
      logger.error("Missmatched details");
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const { username, email, password } = req.body;

    let user = await User.findOne({ $or: [{ email }, { username }] });
    if (user) {
      logger.warn("User already exists - please try another email/username");
      return res.status(200).json({
        success: false,
        message: "User details found please use another email / username",
      });
    }

    user = new User({
      email,
      username,
      password,
    });
    logger.info({ user });
    await user.save();

    //   generate token and refresh token for the user to access
    const { accessToken, refreshToken } = await generateTokens(user);

    logger.info("User succesfully registered");

    res.status(200).json({
      success: true,
      message: "Succesfully registered ✅",
      accessToken,
      refreshToken,
    });
  } catch (err) {
    logger.error("Unable to process request");
    res.status(500).json({
      success: false,
      message: "Internal server Error",
    });
  }
};

const loginUser = async (req, res) => {
  logger.info("Login Endpoint is hit");
  try {
    const { error } = validateLogin(req.body);
    if (error) {
      logger.warn("Invalid details entered");
      return res.status(400).json({
        success: false,
        message: error.details[0].context,
      });
    }
    const { email, password } = req.body;

    // check if user if exists in the database;
    const user = await User.findOne({ email });
    if (!user) {
      logger.warn("Wrong credentials");
      return res.status(403).json({
        success: false,
        message: "Wrong credential / Please signup",
      });
    }
    // check password for the user; -> returns boolen
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      logger.warn("Invalid password");
      return res.status(400).json({
        success: false,
        message: "Invalid password",
      });
    }

    // Creating token for the user;

    const { accessToken, refreshToken } = await generateTokens(user);

    res.status(200).json({
      accessToken,
      refreshToken,
      userId: user._id,
    });
  } catch (err) {
    logger.warn("Internal server error");
    res.status(500).json({
      success: false,
      message: "Internal server error",
      err,
    });
  }
  // generate tokens for user;
};

const refreshTokenUser = async (req, res) => {
  logger.info("Refresh token enpoint id hitt");

  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      logger.warn("Unable to find refreshToken");
      return res.status(400).json({
        success: false,
        message: "Unable to find refreshToken",
      });
    }

    // check it is valid

    const storedToken = await RefreshToken.findOne({ token: refreshToken });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      logger.warn("Invalid token or token expired");

      return res.status(403).json({
        success: false,
        message: "Invalid token or token expired",
      });
    }

    // find user details ;

    const user = await User.findById(storedToken.user);

    if (!user) {
      logger.warn("Unable to find user credentials");
      return res.status(400).json({
        success: false,
        message: "Unable to find user credentials",
      });
    }

    const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
      await generateTokens(user);

    // Deleting previous token form RefreshToken DB;

    await RefreshToken.deleteOne({ _id: storedToken._id });

    res.status(200).json({
      success: true,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    logger.warn("Internal server error");
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const logout = async (req, res) => {
  logger.info("Logout endpoint is hit");
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      logger.warn("Unable to find refreshToken");
      return res.status(400).json({
        success: false,
        message: "Unable to find token",
      });
    }

    const storedToken = await RefreshToken.findOne({ token: refreshToken });
    if (!storedToken) {
      logger.warn("Invalid token");

      return res.status(403).json({
        success: false,
        message: "Invalid token",
      });
    }

    await RefreshToken.deleteOne({ _id: storedToken._id });

    res.status(200).json({
      success: true,
      message: "Successfully logout",
    });
  } catch (error) {
    logger.warn("Error while logout");
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  refreshTokenUser,
  logout,
};
