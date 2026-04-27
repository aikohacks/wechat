const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

let users = {};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join", (username) => {
    for (let id in users) {
      if (users[id] === username) {
        delete users[id];
      }
    }

    users[socket.id] = username;
    io.emit("onlineUsers", users);
    console.log("Online users:", users);
  });

  socket.on("privateMessage", (msg) => {
    console.log("privateMessage:", msg);

    io.to(msg.receiver).emit("receivePrivateMessage", msg);
    socket.emit("receivePrivateMessage", msg);
  });

  socket.on("disconnect", () => {
    delete users[socket.id];
    io.emit("onlineUsers", users);
    console.log("User disconnected:", socket.id);
  });
});

server.listen(5000, () => {
  console.log("Server running on port 5000");
});