"use client";

import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

export default function Home() {
  const [socketId, setSocketId] = useState("");
  const [joined, setJoined] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [username, setUsername] = useState("");
  const [users, setUsers] = useState({});
  const [selectedUserId, setSelectedUserId] = useState("");
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  useEffect(() => {
    const handleConnect = () => {
      console.log("CLIENT CONNECTED:", socket.id);
      setSocketId(socket.id);
    };

    const handleOnlineUsers = (usersObj) => {
      console.log("ONLINE USERS:", usersObj);
      setUsers(usersObj);
    };

    const handleLoadMessages = (msgs) => {
      console.log("LOADED MESSAGES:", msgs);
      setMessages(msgs);
    };

    const handleReceivePrivateMessage = (msg) => {
      console.log("MESSAGE RECEIVED ON CLIENT:", msg);
      setMessages((prev) => [...prev, msg]);
    };

    socket.on("connect", handleConnect);
    socket.on("onlineUsers", handleOnlineUsers);
    socket.on("loadMessages", handleLoadMessages);
    socket.on("receivePrivateMessage", handleReceivePrivateMessage);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("onlineUsers", handleOnlineUsers);
      socket.off("loadMessages", handleLoadMessages);
      socket.off("receivePrivateMessage", handleReceivePrivateMessage);
    };
  }, []);

  useEffect(() => {
    const otherUsers = Object.keys(users).filter((id) => id !== socketId);

    if (otherUsers.length > 0 && !selectedUserId) {
      setSelectedUserId(otherUsers[0]);
    }

    if (selectedUserId && !users[selectedUserId]) {
      setSelectedUserId("");
    }
  }, [users, socketId, selectedUserId]);

  const handleJoin = () => {
    const cleanName = nameInput.trim();

    if (!cleanName) {
      console.log("JOIN BLOCKED: empty name");
      return;
    }

    setUsername(cleanName);
    setJoined(true);
    socket.emit("join", cleanName);
    console.log("JOIN EMITTED:", cleanName);
  };

  const selectedUserName = users[selectedUserId] || "";

  const sendMessage = () => {
    const cleanText = text.trim();

    console.log("TRY SEND TEXT =", cleanText);
    console.log("TRY SEND USERNAME =", username);
    console.log("TRY SEND selectedUserId =", selectedUserId);
    console.log("TRY SEND selectedUserName =", selectedUserName);
    console.log("TRY SEND users =", users);

    if (!cleanText) {
      console.log("BLOCKED: empty text");
      return;
    }

    if (!username) {
      console.log("BLOCKED: username missing");
      return;
    }

    if (!selectedUserId) {
      console.log("BLOCKED: no selected user id");
      return;
    }

    if (!selectedUserName) {
      console.log("BLOCKED: no selected user name");
      return;
    }

    const payload = {
      text: cleanText,
      fromUsername: username,
      toUsername: selectedUserName,
      time: new Date().toLocaleTimeString(),
    };

    console.log("EMITTING PAYLOAD =", payload);
    socket.emit("privateMessage", payload);
    setText("");
  };

  const filteredMessages = messages.filter((msg) => {
    return (
      (msg.fromUsername === username && msg.toUsername === selectedUserName) ||
      (msg.fromUsername === selectedUserName && msg.toUsername === username)
    );
  });

  console.log("FILTERED MESSAGES =", filteredMessages);

  if (!joined) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-200">
        <div className="bg-white p-6 rounded-xl shadow-md w-[350px]">
          <h1 className="text-2xl font-bold mb-4 text-center text-black">
            Enter your name
          </h1>

          <input
            name="username"
            id="username"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            className="w-full border p-3 rounded-lg mb-4 text-black"
            placeholder="Your name"
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
      <div className="w-1/3 bg-white border-r p-4">
        <h2 className="font-bold text-xl text-black mb-2">Users</h2>
        <p className="text-black mb-1">Your name: {username}</p>
        <p className="text-black text-sm break-all mb-4">Your socket: {socketId}</p>

        {Object.entries(users).map(([id, name]) => {
          if (id === socketId) return null;

          return (
            <div
              key={id}
              onClick={() => {
                console.log("SELECT USER:", id, name);
                setSelectedUserId(id);
              }}
              className={`p-3 mb-2 cursor-pointer rounded border text-black ${
                selectedUserId === id ? "bg-gray-300" : "bg-gray-100"
              }`}
            >
              <div className="font-semibold">{name}</div>
              <div className="text-xs break-all">{id}</div>
            </div>
          );
        })}
      </div>

      <div className="flex-1 flex flex-col">
        <div className="bg-green-600 text-white p-4 font-semibold">
          {selectedUserName ? `Chat with ${selectedUserName}` : "Select a user"}
        </div>

        <div className="flex-1 p-4 overflow-y-auto bg-gray-100">
          {filteredMessages.length === 0 ? (
            <div className="text-gray-500">No messages yet</div>
          ) : (
            filteredMessages.map((msg, index) => {
              const isMe = msg.fromUsername === username;

              return (
                <div
                  key={msg._id || index}
                  className={`flex mb-3 ${isMe ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`px-4 py-2 rounded-2xl max-w-[65%] shadow ${
                      isMe
                        ? "bg-green-500 text-white rounded-br-none"
                        : "bg-white text-black rounded-bl-none"
                    }`}
                  >
                    {!isMe && (
                      <div className="text-xs font-bold text-gray-600 mb-1">
                        {msg.fromUsername}
                      </div>
                    )}

                    <div>{msg.text}</div>
                    <div className="text-[10px] text-right mt-1 opacity-70">
                      {msg.time}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="p-3 bg-gray-200">
          <div className="flex bg-white rounded-full px-3 py-2">
            <input
              name="message"
              id="message"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="flex-1 outline-none text-black"
              placeholder="Type message..."
              onKeyDown={(e) => {
                if (e.key === "Enter") sendMessage();
              }}
            />
            <button
              onClick={sendMessage}
              className="bg-green-500 text-white px-4 rounded-full"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}