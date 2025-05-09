const express = require("express");
const {
  registerUser,
  loginUser,
  refreshTokenUser,
  logout,
} = require("../controllers/identity-controller");
const identityRoute = express.Router();
identityRoute.post("/register", registerUser);
identityRoute.post("/login", loginUser);
identityRoute.post("/refresh-token", refreshTokenUser);
identityRoute.post("/logout", logout);
module.exports = { identityRoute };
