const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    avatarColor: { type: String, default: "#10b981" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);