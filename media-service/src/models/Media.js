const mongoose = require("mongoose");
const mediaSchema = new mongoose.Schema({
  publicId: {
    type: String,
    require: true,
  },
  originalName: {
    type: String,
    require: true,
  },
  mimeType: {
    type: String,
    require: true,
  },
  url: {
    type: String,
    require: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    require: true,
    ref: "User",
  },
});

const Media = mongoose.model("Media", mediaSchema);
module.exports = { Media };
