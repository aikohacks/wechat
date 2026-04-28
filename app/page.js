"use client";

import { useEffect, useRef, useState } from "react";
import AuthPage from "@/components/AuthPage";
import Sidebar from "@/components/Sidebar";
import ChatHeader from "@/components/ChatHeader";
import ChatBox from "@/components/ChatBox";
import MessageInput from "@/components/MessageInput";
import { initSocket, getSocket } from "@/lib/socket";
import api from "@/lib/api";

export default function Home() {
  const [currentUser, setCurrentUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [onlineUserIds, setOnlineUserIds] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const typingTimerRef = useRef({});
  const selectedRoomRef = useRef(null);

  useEffect(() => {
    selectedRoomRef.current = selectedRoom;
  }, [selectedRoom]);

  // Restore session on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    const username = localStorage.getItem("username");
    const avatarColor = localStorage.getItem("avatarColor");
    if (token && userId && username) {
      setCurrentUser({ token, userId, username, avatarColor });
    }
    setAuthChecked(true);
  }, []);

  // Init socket + load rooms when user is set
  useEffect(() => {
    if (!currentUser) return;

    const socket = initSocket(currentUser.token);

    socket.on("onlineUsers", (ids) => setOnlineUserIds(ids));

    socket.on("newMessage", (msg) => {
      setMessages((prev) => {
        if (
          selectedRoomRef.current?._id?.toString() ===
          msg.room?.toString()
        ) {
          return [...prev, msg];
        }
        return prev;
      });

      setRooms((prev) =>
        prev
          .map((r) =>
            r._id?.toString() === msg.room?.toString()
              ? {
                  ...r,
                  lastMessage:
                    msg.type === "text"
                      ? msg.text
                      : `📎 ${msg.fileName || "file"}`,
                  lastMessageAt: msg.createdAt,
                  unreadCount:
                    selectedRoomRef.current?._id?.toString() ===
                    msg.room?.toString()
                      ? 0
                      : (r.unreadCount || 0) + 1,
                }
              : r
          )
          .sort(
            (a, b) =>
              new Date(b.lastMessageAt) - new Date(a.lastMessageAt)
          )
      );
    });

    socket.on("userTyping", ({ username }) => {
      setTypingUsers((prev) =>
        prev.includes(username) ? prev : [...prev, username]
      );
      if (typingTimerRef.current[username]) {
        clearTimeout(typingTimerRef.current[username]);
      }
      typingTimerRef.current[username] = setTimeout(() => {
        setTypingUsers((prev) => prev.filter((u) => u !== username));
      }, 2000);
    });

    socket.on("userStopTyping", ({ username }) => {
      setTypingUsers((prev) => prev.filter((u) => u !== username));
    });

    socket.on("messageSeen", ({ userId, roomId }) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.room?.toString() === roomId && !m.seenBy?.includes(userId)
            ? { ...m, seenBy: [...(m.seenBy || []), userId] }
            : m
        )
      );
    });

    loadRooms(socket);

    return () => {
      socket.off("onlineUsers");
      socket.off("newMessage");
      socket.off("userTyping");
      socket.off("userStopTyping");
      socket.off("messageSeen");
    };
  }, [currentUser]);

  const loadRooms = async (socketInstance) => {
    try {
      const res = await api.get("/rooms");
      const fetchedRooms = res.data;
      setRooms(fetchedRooms);
      const s = socketInstance || getSocket();
      if (s) {
        s.emit("joinRooms", fetchedRooms.map((r) => r._id));
      }
    } catch (err) {
      console.log("Failed to load rooms:", err);
    }
  };

  const handleSelectRoom = async (room) => {
    setSelectedRoom(room);
    setTypingUsers([]);
    try {
      const res = await api.get(`/rooms/${room._id}/messages`);
      setMessages(res.data);
      setRooms((prev) =>
        prev.map((r) =>
          r._id === room._id ? { ...r, unreadCount: 0 } : r
        )
      );
      const socket = getSocket();
      socket?.emit("markSeen", { roomId: room._id });
    } catch (err) {
      console.log("Failed to load messages:", err);
    }
  };

  const handleSend = ({ type, text, fileUrl, fileName }) => {
    const socket = getSocket();
    if (!socket || !selectedRoom) return;
    socket.emit("sendMessage", {
      roomId: selectedRoom._id,
      type,
      text,
      fileUrl,
      fileName,
    });
  };

  const handleTyping = () => {
    const socket = getSocket();
    if (!socket || !selectedRoom) return;
    socket.emit("typing", { roomId: selectedRoom._id });
  };

  const handleStopTyping = () => {
    const socket = getSocket();
    if (!socket || !selectedRoom) return;
    socket.emit("stopTyping", { roomId: selectedRoom._id });
  };

  const handleRoomCreated = (room) => {
    setRooms((prev) => {
      const exists = prev.find((r) => r._id === room._id);
      if (exists) {
        handleSelectRoom(exists);
        return prev;
      }
      const socket = getSocket();
      socket?.emit("joinRooms", [room._id]);
      handleSelectRoom(room);
      return [room, ...prev];
    });
  };

  const handleLogout = () => {
    localStorage.clear();
    setCurrentUser(null);
    setRooms([]);
    setSelectedRoom(null);
    setMessages([]);
  };

  if (!authChecked) return null;
  if (!currentUser) return <AuthPage onAuth={setCurrentUser} />;

  return (
    <div className="h-screen flex bg-gray-100 overflow-hidden">
      <Sidebar
        rooms={rooms}
        selectedRoomId={selectedRoom?._id}
        onSelectRoom={handleSelectRoom}
        currentUser={currentUser}
        onlineUserIds={onlineUserIds}
        onRoomCreated={handleRoomCreated}
        onLogout={handleLogout}
      />

      <div className="flex-1 flex flex-col bg-white min-w-0">
        <ChatHeader
          room={selectedRoom}
          currentUser={currentUser}
          typingUsers={typingUsers}
          onlineUserIds={onlineUserIds}
        />

        {selectedRoom ? (
          <>
            <ChatBox
              messages={messages}
              currentUser={currentUser}
              room={selectedRoom}
            />
            <MessageInput
              onSend={handleSend}
              onTyping={handleTyping}
              onStopTyping={handleStopTyping}
              disabled={false}
            />
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
            <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-green-400"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M20 2H4a2 2 0 00-2 2v18l4-4h14a2 2 0 002-2V4a2 2 0 00-2-2z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-700 mb-1">
              Your messages
            </h2>
            <p className="text-sm text-gray-400 max-w-xs">
              Select a conversation or press{" "}
              <span className="font-semibold text-green-500">+</span> to start
              a new one.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}