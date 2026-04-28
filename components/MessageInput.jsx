"use client";

import { useRef, useState } from "react";
import api from "@/lib/api";

export default function MessageInput({ onSend, onTyping, onStopTyping, disabled }) {
  const [text, setText] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const typingTimerRef = useRef(null);

  const handleChange = (value) => {
    setText(value);
    onTyping?.();
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => onStopTyping?.(), 1500);
  };

  const handleSend = () => {
    const clean = text.trim();
    if (!clean || disabled) return;
    onSend({ type: "text", text: clean });
    setText("");
    onStopTyping?.();
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await api.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onSend({ type: res.data.type, fileUrl: res.data.url, fileName: res.data.fileName });
    } catch {
      alert("Upload failed. Max 10MB. Allowed: images, pdf, doc, txt, zip.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div className="px-4 py-3 bg-white border-t border-gray-100">
      <div className="flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2.5">
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || uploading}
          className="text-gray-400 hover:text-green-500 transition disabled:opacity-40"
          title="Attach file"
        >
          {uploading ? (
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828L18 9.828A4 4 0 1012.172 4L5.586 10.586a6 6 0 108.486 8.486" />
            </svg>
          )}
        </button>

        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileChange}
          accept="image/*,.pdf,.doc,.docx,.txt,.zip"
        />

        <input
          value={text}
          onChange={(e) => handleChange(e.target.value)}
          className="flex-1 bg-transparent outline-none text-sm text-gray-800 placeholder-gray-400"
          placeholder={disabled ? "Select a conversation" : "Type a message..."}
          disabled={disabled}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />

        <button
          onClick={handleSend}
          disabled={!text.trim() || disabled}
          className="w-8 h-8 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center transition disabled:opacity-40"
        >
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
        </button>
      </div>
    </div>
  );
}