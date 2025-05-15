const logger = require("../utils/logger");
const express = require("express");
const { authenticationRequest } = require("../middleware/authMiddleware");
const { searchPostController } = require("../controller/search-controller");
const router = express.Router();
router.use(authenticationRequest);
router.get("/posts", searchPostController);
module.exports = { router };
