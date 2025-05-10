const express = require("express");
const { authenticationRequest } = require("../middleware/authMiddleware");
const {
  create,
  getAllPost,
  getPost,
  deletePost,
} = require("../controller/post-controller");

const router = express();

router.use(authenticationRequest);

router.post("/create-post", create);
router.get("/all-posts", getAllPost);
router.get("/:id", getPost);
router.delete("/:id", deletePost);

module.exports = { router };
