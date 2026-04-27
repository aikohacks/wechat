"use client";

export default function Sidebar({
  users,
  socketId,
  setSelectedUser,
  selectedUser,
}) {
  return (
    <div className="w-1/3 bg-white border-r">
      <div className="p-4 font-bold bg-gray-200 text-black">Chats</div>

      {Object.entries(users).map(([id, name]) => {
        if (id === socketId) return null;

        return (
          <div
            key={id}
            onClick={() => setSelectedUser(id)}
            className={`p-4 cursor-pointer border-b text-black ${
              selectedUser === id ? "bg-gray-300" : "hover:bg-gray-100"
            }`}
          >
            <div className="font-semibold">{name}</div>
            <div className="text-xs text-gray-500 break-all">{id}</div>
          </div>
        );
      })}
    </div>
  );
}