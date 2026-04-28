"use client";

export function getInitials(username = "") {
  return username.slice(0, 2).toUpperCase();
}

export function Avatar({ username = "", avatarColor = "#10b981", size = "md" }) {
  const sizes = {
    sm: { outer: "w-6 h-6", text: "text-[10px]" },
    md: { outer: "w-9 h-9", text: "text-sm" },
    lg: { outer: "w-12 h-12", text: "text-base" },
  };

  const s = sizes[size] || sizes.md;

  return (
    <div
      className={`${s.outer} rounded-full flex items-center justify-center font-semibold text-white shrink-0 select-none`}
      style={{ backgroundColor: avatarColor }}
    >
      <span className={s.text}>{getInitials(username)}</span>
    </div>
  );
}