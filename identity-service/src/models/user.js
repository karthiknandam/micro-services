const argon2d = require("argon2");
const mongoose = require("mongoose");
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

userSchema.index({ username: "text" });

userSchema.pre("save", async function () {
  try {
    this.password = await argon2d.hash(this.password);
  } catch (err) {
    console.error(err);
  }
});

// here what i did was mistakenly used arrow function while the mistake is => do not bind this key word in here

userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return argon2d.verify(this.password, candidatePassword);
  } catch (err) {
    console.error(err);
  }
};

const User = mongoose.model("User", userSchema);
module.exports = User;
