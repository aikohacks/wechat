require("dotenv").config();
const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const { Server } = require("socket.io");
const path = require("path");
const fs = require("fs");
const cors = require("cors");

const { verifyToken } = require("./middleware/auth");
const authRoutes = require("./routes/auth");
const roomRoutes = require("./routes/rooms");
const uploadRoutes = require("./routes/upload");

const Message = require("./models/Message");
const Room = require("./models/Room");
const ReadReceipt = require("./models/ReadReceipt");

const app = express();
const server = http.createServer(app);

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

// Middleware
app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/upload", uploadRoutes);

// MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.log("❌ MongoDB error:", err.message));

// Socket.IO
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

// Online users map: userId -> socketId
const onlineUsers = new Map();

// Socket auth middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  const decoded = verifyToken(token);
  if (!decoded) return next(new Error("Authentication error"));
  socket.user = decoded;
  next();
});

io.on("connection", (socket) => {
  const { userId, username } = socket.user;

  onlineUsers.set(userId, socket.id);
  io.emit("onlineUsers", Array.from(onlineUsers.keys()));
  console.log(`✅ CONNECTED: ${username} (${socket.id})`);

  // Join all rooms this user belongs to
  socket.on("joinRooms", (roomIds) => {
    if (Array.isArray(roomIds)) {
      roomIds.forEach((id) => socket.join(id));
    }
  });

  // Send a message
  socket.on(
    "sendMessage",
    async ({ roomId, text, type, fileUrl, fileName }) => {
      try {
        const message = await Message.create({
          room: roomId,
          sender: userId,
          senderUsername: username,
          type: type || "text",
          text: text || "",
          fileUrl: fileUrl || "",
          fileName: fileName || "",
          seenBy: [userId],
        });

        await Room.findByIdAndUpdate(roomId, {
          lastMessage:
            type === "text" ? text : `📎 ${fileName || "file"}`,
          lastMessageAt: new Date(),
        });

        // Emit to everyone in the room (including sender)
        io.to(roomId).emit("newMessage", message);
      } catch (err) {
        console.log("❌ MESSAGE ERROR:", err.message);
      }
    }
  );

  // Typing indicators
  socket.on("typing", ({ roomId }) => {
    socket.to(roomId).emit("userTyping", { username, roomId });
  });

  socket.on("stopTyping", ({ roomId }) => {
    socket.to(roomId).emit("userStopTyping", { username, roomId });
  });

  // Mark messages as seen
  socket.on("markSeen", async ({ roomId }) => {
    try {
      await ReadReceipt.findOneAndUpdate(
        { user: userId, room: roomId },
        { lastRead: new Date() },
        { upsert: true, new: true }
      );

      await Message.updateMany(
        { room: roomId, seenBy: { $ne: userId } },
        { $addToSet: { seenBy: userId } }
      );

      socket.to(roomId).emit("messageSeen", { userId, roomId });
    } catch (err) {
      console.log("❌ SEEN ERROR:", err.message);
    }
  });

  socket.on("disconnect", () => {
    onlineUsers.delete(userId);
    io.emit("onlineUsers", Array.from(onlineUsers.keys()));
    console.log(`❌ DISCONNECTED: ${username}`);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));