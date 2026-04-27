"use client";

import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import ChatHeader from "../components/ChatHeader";
import Sidebar from "../components/Sidebar";
import ChatBox from "../components/ChatBox";
import MessageInput from "../components/MessageInput";

const socket = io("http://localhost:5000");

export default function Home() {
  const [socketId, setSocketId] = useState("");
  const [username, setUsername] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [joined, setJoined] = useState(false);
  const [users, setUsers] = useState({});
  const [selectedUser, setSelectedUser] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected:", socket.id);
      setSocketId(socket.id);
    });

    socket.on("onlineUsers", (usersObj) => {
      console.log("onlineUsers:", usersObj);
      setUsers(usersObj);
    });

    socket.on("receivePrivateMessage", (msg) => {
      console.log("receivePrivateMessage:", msg);
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off("connect");
      socket.off("onlineUsers");
      socket.off("receivePrivateMessage");
    };
  }, []);

  useEffect(() => {
    const otherUsers = Object.keys(users).filter((id) => id !== socketId);
    if (otherUsers.length > 0 && !selectedUser) {
      setSelectedUser(otherUsers[0]);
    }
  }, [users, socketId, selectedUser]);

  const handleJoin = () => {
    if (!nameInput.trim()) return;
    setUsername(nameInput.trim());
    setJoined(true);
    socket.emit("join", nameInput.trim());
  };

  const sendMessage = (text) => {
    if (!text.trim() || !selectedUser) return;

    const msg = {
      text: text.trim(),
      sender: socketId,
      receiver: selectedUser,
      username,
      time: new Date().toLocaleTimeString(),
    };

    console.log("sending:", msg);

    setMessages((prev) => [...prev, msg]);
    socket.emit("privateMessage", msg);
  };

  const filteredMessages = messages.filter(
    (msg) =>
      (msg.sender === socketId && msg.receiver === selectedUser) ||
      (msg.sender === selectedUser && msg.receiver === socketId)
  );

  const selectedUserName = users[selectedUser];

  if (!joined) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-200">
        <div className="bg-white p-6 rounded-xl shadow-md w-[350px]">
          <h1 className="text-2xl font-bold mb-4 text-center text-black">
            Enter your name
          </h1>

          <input
            type="text"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            placeholder="Your name"
            className="w-full border p-3 rounded-lg mb-4 text-black"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleJoin();
            }}
          />

          <button
            onClick={handleJoin}
            className="w-full bg-green-500 text-white py-3 rounded-lg"
          >
            Join Chat
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-gray-200">
      <Sidebar
        users={users}
        socketId={socketId}
        setSelectedUser={setSelectedUser}
        selectedUser={selectedUser}
      />

      <div className="flex-1 flex flex-col">
        <ChatHeader selectedUserName={selectedUserName} />
        <ChatBox messages={filteredMessages} socketId={socketId} />
        <MessageInput onSend={sendMessage} />
      </div>
    </div>
  );
}