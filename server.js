const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

mongoose
  .connect("mongodb://127.0.0.1:27017/privatechat")
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB error:", err.message));

const messageSchema = new mongoose.Schema(
  {
    text: String,
    fromUsername: String,
    toUsername: String,
    time: String,
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

let users = {}; // socketId -> username
let userSockets = {}; // username -> socketId

io.on("connection", async (socket) => {
  console.log("CONNECTED:", socket.id);

  try {
    const oldMessages = await Message.find().sort({ createdAt: 1 });
    socket.emit("loadMessages", oldMessages);
    console.log("OLD MESSAGES SENT:", oldMessages.length);
  } catch (err) {
    console.log("LOAD ERROR:", err.message);
  }

  socket.on("join", (username) => {
    const cleanUsername = username?.trim();

    if (!cleanUsername) {
      console.log("JOIN BLOCKED: empty username");
      return;
    }

    users[socket.id] = cleanUsername;
    userSockets[cleanUsername] = socket.id;

    console.log("JOIN:", cleanUsername, socket.id);
    console.log("USERS:", users);

    io.emit("onlineUsers", users);
  });

  socket.on("privateMessage", async (payload) => {
    console.log("PRIVATE MESSAGE RECEIVED:", payload);

    try {
      if (!payload?.text || !payload?.fromUsername || !payload?.toUsername) {
        console.log("MESSAGE BLOCKED: invalid payload");
        return;
      }

      const savedMessage = await Message.create({
        text: payload.text.trim(),
        fromUsername: payload.fromUsername.trim(),
        toUsername: payload.toUsername.trim(),
        time: payload.time || new Date().toLocaleTimeString(),
      });

      const receiverSocketId = userSockets[payload.toUsername];

      console.log("SAVED:", savedMessage);
      console.log("RECEIVER SOCKET:", receiverSocketId);

      socket.emit("receivePrivateMessage", savedMessage);

      if (receiverSocketId) {
        io.to(receiverSocketId).emit("receivePrivateMessage", savedMessage);
      }

      console.log("MESSAGE EMITTED BACK");
    } catch (err) {
      console.log("SAVE ERROR:", err.message);
    }
  });

  socket.on("disconnect", () => {
    const disconnectedUsername = users[socket.id];

    console.log("DISCONNECTED:", socket.id, disconnectedUsername);

    if (disconnectedUsername) {
      delete userSockets[disconnectedUsername];
    }

    delete users[socket.id];
    io.emit("onlineUsers", users);
  });
});

server.listen(5000, () => {
  console.log("Server running on port 5000");
});