"use client";

import { Avatar } from "@/lib/avatarColor";

export default function ChatHeader({ room, currentUser, typingUsers, onlineUserIds }) {
  if (!room) {
    return (
      <div className="h-16 bg-white border-b border-gray-100 flex items-center px-6 shrink-0">
        <span className="text-gray-400 text-sm">Select a conversation</span>
      </div>
    );
  }

  const other = !room.isGroup
    ? room.members?.find((m) => m._id?.toString() !== currentUser.userId)
    : null;

  const displayName = room.isGroup ? room.name : other?.username || "Unknown";
  const avatarColor = room.isGroup ? "#8b5cf6" : other?.avatarColor || "#10b981";
  const isOnline = !room.isGroup && onlineUserIds.includes(other?._id?.toString());
  const typingList = typingUsers.filter((u) => u !== currentUser.username);

  return (
    <div className="h-16 bg-white border-b border-gray-100 flex items-center px-4 gap-3 shrink-0">
      <div className="relative">
        {room.isGroup ? (
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold"
            style={{ backgroundColor: avatarColor }}
          >
            #
          </div>
        ) : (
          <Avatar username={displayName} avatarColor={avatarColor} size="md" />
        )}
        {isOnline && (
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="font-semibold text-gray-800 text-sm">{displayName}</div>
        <div className="text-xs h-4">
          {typingList.length > 0 ? (
            <span className="text-green-500">
              {typingList.join(", ")} {typingList.length === 1 ? "is" : "are"} typing...
            </span>
          ) : (
            <span className="text-gray-400">
              {room.isGroup
                ? `${room.members?.length || 0} members`
                : isOnline ? "Online" : "Offline"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}