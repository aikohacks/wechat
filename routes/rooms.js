const express = require("express");
const Room = require("../models/Room");
const Message = require("../models/Message");
const ReadReceipt = require("../models/ReadReceipt");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

const router = express.Router();

// Inline middleware to avoid require-order issues
function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Unauthorized" });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
}

// GET /api/rooms — all rooms for current user with unread counts
router.get("/", authMiddleware, async (req, res) => {
  try {
    const rooms = await Room.find({ members: req.user.userId })
      .populate("members", "username avatarColor _id")
      .sort({ lastMessageAt: -1 });

    const receipts = await ReadReceipt.find({ user: req.user.userId });
    const receiptMap = {};
    receipts.forEach((r) => {
      receiptMap[r.room.toString()] = r.lastRead;
    });

    const roomsWithUnread = await Promise.all(
      rooms.map(async (room) => {
        const lastRead = receiptMap[room._id.toString()] || new Date(0);
        const unread = await Message.countDocuments({
          room: room._id,
          createdAt: { $gt: lastRead },
          sender: { $ne: req.user.userId },
        });
        return { ...room.toObject(), unreadCount: unread };
      })
    );

    res.json(roomsWithUnread);
  } catch (err) {
    console.log("GET ROOMS ERROR:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/rooms/users/all — all users except current
router.get("/users/all", authMiddleware, async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user.userId } })
      .select("username avatarColor _id")
      .sort({ username: 1 });
    res.json(users);
  } catch (err) {
    console.log("GET USERS ERROR:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/rooms/dm — create or return existing DM room
router.post("/dm", authMiddleware, async (req, res) => {
  try {
    const { targetUserId } = req.body;
    const myId = req.user.userId;

    const existing = await Room.findOne({
      isGroup: false,
      members: { $all: [myId, targetUserId], $size: 2 },
    }).populate("members", "username avatarColor _id");

    if (existing) return res.json(existing);

    const room = await Room.create({
      isGroup: false,
      members: [myId, targetUserId],
      createdBy: myId,
    });

    const populated = await room.populate("members", "username avatarColor _id");
    res.json(populated);
  } catch (err) {
    console.log("CREATE DM ERROR:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/rooms/group — create a group room
router.post("/group", authMiddleware, async (req, res) => {
  try {
    const { name, memberIds } = req.body;
    const myId = req.user.userId;

    if (!name?.trim()) {
      return res.status(400).json({ message: "Group name is required" });
    }

    const allMembers = [...new Set([myId, ...memberIds])];

    const room = await Room.create({
      name: name.trim(),
      isGroup: true,
      members: allMembers,
      createdBy: myId,
    });

    const populated = await room.populate("members", "username avatarColor _id");
    res.json(populated);
  } catch (err) {
    console.log("CREATE GROUP ERROR:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/rooms/:roomId/messages — load messages + mark as read
router.get("/:roomId/messages", authMiddleware, async (req, res) => {
  try {
    const messages = await Message.find({ room: req.params.roomId })
      .sort({ createdAt: 1 })
      .limit(100)
      .lean();

    await ReadReceipt.findOneAndUpdate(
      { user: req.user.userId, room: req.params.roomId },
      { lastRead: new Date() },
      { upsert: true, new: true }
    );

    res.json(messages);
  } catch (err) {
    console.log("GET MESSAGES ERROR:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/rooms/:roomId/read — mark room as read
router.post("/:roomId/read", authMiddleware, async (req, res) => {
  try {
    await ReadReceipt.findOneAndUpdate(
      { user: req.user.userId, room: req.params.roomId },
      { lastRead: new Date() },
      { upsert: true, new: true }
    );
    res.json({ ok: true });
  } catch (err) {
    console.log("MARK READ ERROR:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;