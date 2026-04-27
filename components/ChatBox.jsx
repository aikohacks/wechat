"use client";

import { useEffect, useRef } from "react";

export default function ChatBox({ messages, socketId }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 p-4 overflow-y-auto bg-gray-100">
      {messages.length === 0 ? (
        <div className="text-gray-500 text-center mt-10">No messages yet</div>
      ) : (
        messages.map((msg, index) => {
          const isMe = msg.sender === socketId;

          return (
            <div
              key={index}
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
                    {msg.username}
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

      <div ref={bottomRef}></div>
    </div>
  );
}