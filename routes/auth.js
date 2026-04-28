const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

const AVATAR_COLORS = [
  "#10b981",
  "#3b82f6",
  "#8b5cf6",
  "#f59e0b",
  "#ef4444",
  "#06b6d4",
  "#ec4899",
  "#f97316",
];

router.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username?.trim() || !password?.trim()) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    const exists = await User.findOne({
      username: username.trim().toLowerCase(),
    });

    if (exists) {
      return res.status(400).json({ message: "Username already taken" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const avatarColor =
      AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];

    const user = await User.create({
      username: username.trim().toLowerCase(),
      password: hashed,
      avatarColor,
    });

    const token = jwt.sign(
      {
        userId: user._id.toString(),
        username: user.username,
        avatarColor: user.avatarColor,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      userId: user._id.toString(),
      username: user.username,
      avatarColor: user.avatarColor,
    });
  } catch (err) {
    console.log("REGISTER ERROR:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username?.trim() || !password?.trim()) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    const user = await User.findOne({
      username: username.trim().toLowerCase(),
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        userId: user._id.toString(),
        username: user.username,
        avatarColor: user.avatarColor,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      userId: user._id.toString(),
      username: user.username,
      avatarColor: user.avatarColor,
    });
  } catch (err) {
    console.log("LOGIN ERROR:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;