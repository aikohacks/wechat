"use client";

import { useState } from "react";
import api from "@/lib/api";

export default function AuthPage({ onAuth }) {
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError("");
    if (!username.trim() || !password.trim()) {
      setError("Both fields are required.");
      return;
    }
    setLoading(true);
    try {
      const res = await api.post(`/auth/${mode}`, {
        username: username.trim(),
        password: password.trim(),
      });
      const { token, userId, username: uname, avatarColor } = res.data;
      localStorage.setItem("token", token);
      localStorage.setItem("userId", userId);
      localStorage.setItem("username", uname);
      localStorage.setItem("avatarColor", avatarColor);
      onAuth({ token, userId, username: uname, avatarColor });
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 w-full max-w-sm p-8">
        <div className="flex justify-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-green-500 flex items-center justify-center shadow-md">
            <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 2H4a2 2 0 00-2 2v18l4-4h14a2 2 0 002-2V4a2 2 0 00-2-2z" />
            </svg>
          </div>
        </div>

        <h1 className="text-xl font-bold text-center text-gray-800 mb-1">
          {mode === "login" ? "Welcome back" : "Create your account"}
        </h1>
        <p className="text-sm text-center text-gray-400 mb-6">
          {mode === "login" ? "Sign in to continue" : "Join and start chatting"}
        </p>

        {error && (
          <div className="bg-red-50 text-red-500 text-sm px-4 py-2.5 rounded-xl mb-4 border border-red-100">
            {error}
          </div>
        )}

        <div className="space-y-3 mb-5">
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            autoComplete="username"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-50 transition"
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-50 transition"
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-green-500 hover:bg-green-600 active:scale-[0.98] text-white py-3 rounded-xl text-sm font-semibold transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Please wait..." : mode === "login" ? "Sign In" : "Create Account"}
        </button>

        <p className="text-center text-sm text-gray-400 mt-5">
          {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            className="text-green-600 font-semibold hover:underline"
            onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}
          >
            {mode === "login" ? "Sign Up" : "Sign In"}
          </button>
        </p>
      </div>
    </div>
  );
}