"use client";

import { useEffect, useRef } from "react";
import { Avatar } from "@/lib/avatarColor";

function SeenAvatars({ seenBy, currentUserId, members }) {
  const seenOthers = seenBy?.filter((id) => id?.toString() !== currentUserId) || [];
  if (seenOthers.length === 0) return null;

  return (
    <div className="flex gap-0.5 mt-1 justify-end">
      {seenOthers.slice(0, 5).map((id) => {
        const member = members?.find((m) => m._id?.toString() === id?.toString());
        if (!member) return null;
        return (
          <Avatar
            key={id}
            username={member.username}
            avatarColor={member.avatarColor}
            size="sm"
          />
        );
      })}
    </div>
  );
}

function FileLink({ url, fileName, isMe }) {
  const linkClass = isMe
    ? "flex items-center gap-2 underline text-sm text-white"
    : "flex items-center gap-2 underline text-sm text-green-600";

  return (
    <a href={url} target="_blank" rel="noreferrer" className={linkClass}>
      <svg
        className="w-4 h-4 shrink-0"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828L18 9.828A4 4 0 1012.172 4L5.586 10.586a6 6 0 108.486 8.486"
        />
      </svg>
      {fileName || "Download file"}
    </a>
  );
}

function MessageBubble({ msg, isMe, room, currentUserId, members }) {
  const fileFullUrl = "http://localhost:5000" + (msg.fileUrl || "");

  const bubbleClass = isMe
    ? "px-4 py-2.5 rounded-2xl shadow-sm text-sm bg-green-500 text-white rounded-br-none"
    : "px-4 py-2.5 rounded-2xl shadow-sm text-sm bg-white text-gray-800 rounded-bl-none";

  const timeClass = isMe
    ? "text-[10px] mt-1 text-right text-green-100"
    : "text-[10px] mt-1 text-right text-gray-400";

  const formatTime = (dateStr) =>
    new Date(dateStr).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className={bubbleClass}>
      {msg.type === "image" ? (
        <img src={fileFullUrl} alt="shared" className="max-w-[220px] rounded-xl" />
      ) : msg.type === "file" ? (
        <FileLink url={fileFullUrl} fileName={msg.fileName} isMe={isMe} />
      ) : (
        <span>{msg.text}</span>
      )}
      <div className={timeClass}>{formatTime(msg.createdAt)}</div>
    </div>
  );
}

export default function ChatBox({ messages, currentUser, room }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const groupByDate = (msgs) => {
    const groups = [];
    let lastDate = null;
    msgs.forEach((msg) => {
      const d = new Date(msg.createdAt).toDateString();
      if (d !== lastDate) {
        groups.push({
          type: "date",
          label: d,
          id: d + (msg._id || Math.random()),
        });
        lastDate = d;
      }
      groups.push({ type: "msg", msg });
    });
    return groups;
  };

  const items = groupByDate(messages);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 bg-gray-50 space-y-1">
      {messages.length === 0 && (
        <div className="text-center text-gray-400 text-sm mt-16">
          No messages yet. Say hello!
        </div>
      )}

      {items.map((item, i) => {
        if (item.type === "date") {
          return (
            <div key={item.id} className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-[11px] text-gray-400 shrink-0">
                {item.label}
              </span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>
          );
        }

        const { msg } = item;
        const isMe =
          msg.sender?.toString() === currentUser.userId ||
          msg.senderUsername === currentUser.username;

        const senderMember = room?.members?.find(
          (m) =>
            m._id?.toString() === msg.sender?.toString() ||
            m.username === msg.senderUsername
        );

        const rowClass = isMe
          ? "flex items-end gap-2 flex-row-reverse"
          : "flex items-end gap-2";

        const colClass = isMe
          ? "max-w-[65%] flex flex-col items-end"
          : "max-w-[65%] flex flex-col items-start";

        return (
          <div key={msg._id || i} className={rowClass}>
            {!isMe && (
              <Avatar
                username={msg.senderUsername}
                avatarColor={senderMember?.avatarColor || "#10b981"}
                size="sm"
              />
            )}

            <div className={colClass}>
              {!isMe && room?.isGroup && (
                <span className="text-[11px] text-gray-500 mb-1 ml-1">
                  {msg.senderUsername}
                </span>
              )}

              <MessageBubble
                msg={msg}
                isMe={isMe}
                room={room}
                currentUserId={currentUser.userId}
                members={room?.members}
              />

              {isMe && (
                <SeenAvatars
                  seenBy={msg.seenBy}
                  currentUserId={currentUser.userId}
                  members={room?.members}
                />
              )}
            </div>
          </div>
        );
      })}

      <div ref={bottomRef} />
    </div>
  );
}