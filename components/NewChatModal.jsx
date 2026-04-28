"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Avatar } from "@/lib/avatarColor";

export default function NewChatModal({ currentUser, onClose, onRoomCreated }) {
  const [tab, setTab] = useState("dm");
  const [users, setUsers] = useState([]);
  const [groupName, setGroupName] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    api.get("/rooms/users/all").then((r) => setUsers(r.data)).catch(console.log);
  }, []);

  const filtered = users.filter((u) =>
    u.username.toLowerCase().includes(search.toLowerCase())
  );

  const toggleUser = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleCreate = async () => {
    if (tab === "dm" && selectedIds.length !== 1) return;
    if (tab === "group" && (!groupName.trim() || selectedIds.length < 1)) return;
    setLoading(true);
    try {
      if (tab === "dm") {
        const res = await api.post("/rooms/dm", { targetUserId: selectedIds[0] });
        onRoomCreated(res.data);
      } else {
        const res = await api.post("/rooms/group", {
          name: groupName.trim(),
          memberIds: selectedIds,
        });
        onRoomCreated(res.data);
      }
    } catch (err) {
      console.log("CREATE ROOM ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800 text-sm">New Conversation</h2>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center transition"
          >
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex border-b border-gray-100">
          {[{ key: "dm", label: "Direct Message" }, { key: "group", label: "New Group" }].map((t) => (
            <button
              key={t.key}
              onClick={() => { setTab(t.key); setSelectedIds([]); setGroupName(""); }}
              className={`flex-1 py-3 text-xs font-semibold transition border-b-2 ${
                tab === t.key
                  ? "text-green-600 border-green-500"
                  : "text-gray-400 border-transparent hover:text-gray-600"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="p-4 space-y-3">
          {tab === "group" && (
            <input
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Group name"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-green-400"
            />
          )}
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users..."
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-green-400"
          />
          <div className="max-h-56 overflow-y-auto space-y-0.5">
            {filtered.length === 0 && (
              <div className="text-center text-gray-400 text-xs py-6">No users found</div>
            )}
            {filtered.map((user) => {
              const selected = selectedIds.includes(user._id);
              return (
                <div
                  key={user._id}
                  onClick={() => tab === "dm" ? setSelectedIds([user._id]) : toggleUser(user._id)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition ${
                    selected ? "bg-green-50" : "hover:bg-gray-50"
                  }`}
                >
                  <Avatar username={user.username} avatarColor={user.avatarColor} size="sm" />
                  <span className="text-sm text-gray-800 flex-1">{user.username}</span>
                  {selected && (
                    <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center shrink-0">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="px-4 pb-4">
          <button
            onClick={handleCreate}
            disabled={
              loading ||
              (tab === "dm" && selectedIds.length !== 1) ||
              (tab === "group" && (!groupName.trim() || selectedIds.length < 1))
            }
            className="w-full bg-green-500 hover:bg-green-600 active:scale-[0.98] text-white py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating..." : tab === "dm" ? "Start Chat" : "Create Group"}
          </button>
        </div>
      </div>
    </div>
  );
}