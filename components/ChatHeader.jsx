"use client";

export default function ChatHeader({ selectedUserName }) {
  return (
    <div className="bg-green-600 text-white p-4 font-semibold">
      {selectedUserName ? `Chat with ${selectedUserName}` : "Select a user"}
    </div>
  );
}