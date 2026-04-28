"use client";

import { useState } from "react";
import { Avatar } from "@/lib/avatarColor";
import NewChatModal from "@/components/NewChatModal";

export default function Sidebar({
  rooms,
  selectedRoomId,
  onSelectRoom,
  currentUser,
  onlineUserIds,
  onRoomCreated,
  onLogout,
}) {
  const [showModal, setShowModal] = useState(false);

  const formatTime = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    return isToday
      ? d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : d.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  const getRoomDisplay = (room) => {
    if (room.isGroup) {
      return { name: room.name, avatarColor: "#8b5cf6", isOnline: false };
    }
    const other = room.members?.find(
      (m) => m._id?.toString() !== currentUser.userId
    );
    const isOnline = onlineUserIds.includes(other?._id?.toString());
    return {
      name: other?.username || "Unknown",
      avatarColor: other?.avatarColor || "#10b981",
      isOnline,
    };
  };

  return (
    <div className="w-[300px] bg-white border-r border-gray-100 flex flex-col h-full shrink-0">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Avatar
            username={currentUser.username}
            avatarColor={currentUser.avatarColor}
            size="md"
          />
          <div className="min-w-0">
            <div className="font-semibold text-gray-800 text-sm truncate">
              {currentUser.username}
            </div>
            <div className="text-[11px] text-green-500 font-medium">● Online</div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowModal(true)}
            className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition"
            title="New conversation"
          >
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
          <button
            onClick={onLogout}
            className="w-8 h-8 rounded-full hover:bg-red-50 flex items-center justify-center transition"
            title="Sign out"
          >
            <svg className="w-4 h-4 text-gray-400 hover:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>

      {/* Room list */}
      <div className="flex-1 overflow-y-auto">
        {rooms.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center px-6 pb-10">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 2H4a2 2 0 00-2 2v18l4-4h14a2 2 0 002-2V4a2 2 0 00-2-2z" />
              </svg>
            </div>
            <p className="text-xs text-gray-400">No conversations yet.<br />Press + to start one.</p>
          </div>
        )}

        {rooms.map((room) => {
          const { name, avatarColor, isOnline } = getRoomDisplay(room);
          const isSelected = room._id === selectedRoomId;

          return (
            <div
              key={room._id}
              onClick={() => onSelectRoom(room)}
              className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition border-b border-gray-50 ${
                isSelected ? "bg-green-50" : "hover:bg-gray-50"
              }`}
            >
              <div className="relative shrink-0">
                {room.isGroup ? (
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold"
                    style={{ backgroundColor: avatarColor }}
                  >
                    #
                  </div>
                ) : (
                  <Avatar username={name} avatarColor={avatarColor} size="md" />
                )}
                {isOnline && !room.isGroup && (
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 border-2 border-white rounded-full" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-0.5">
                  <span className={`text-sm truncate ${isSelected ? "font-semibold text-green-700" : "font-semibold text-gray-800"}`}>
                    {name}
                  </span>
                  <span className="text-[10px] text-gray-400 ml-2 shrink-0">
                    {formatTime(room.lastMessageAt)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400 truncate">
                    {room.lastMessage || "No messages yet"}
                  </span>
                  {room.unreadCount > 0 && (
                    <span className="ml-2 min-w-[18px] h-[18px] bg-green-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 shrink-0">
                      {room.unreadCount > 99 ? "99+" : room.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <NewChatModal
          currentUser={currentUser}
          onClose={() => setShowModal(false)}
          onRoomCreated={(room) => {
            onRoomCreated(room);
            setShowModal(false);
          }}
        />
      )}
    </div>
  );
}