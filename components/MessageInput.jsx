"use client";

import { useState } from "react";

export default function MessageInput({ onSend }) {
  const [text, setText] = useState("");

  const handleSend = () => {
    if (!text.trim()) return;
    onSend(text);
    setText("");
  };

  return (
    <div className="p-3 bg-gray-200">
      <div className="flex bg-white rounded-full px-3 py-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="flex-1 outline-none text-black"
          placeholder="Type message..."
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSend();
          }}
        />
        <button
          onClick={handleSend}
          className="bg-green-500 text-white px-4 rounded-full"
        >
          Send
        </button>
      </div>
    </div>
  );
}