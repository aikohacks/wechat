import { io } from "socket.io-client";

let socket = null;

export function initSocket(token) {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
  socket = io("http://localhost:5000", {
    auth: { token },
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });
  return socket;
}

export function getSocket() {
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}