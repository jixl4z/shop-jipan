"use client";

import React from "react";
import { useStore } from "@/context/StoreContext";
import { MessageCircle } from "lucide-react";

export default function FloatingChat() {
  const { setting, themeMode } = useStore();
  const isLight = themeMode === "light";
  const lineUrl = setting?.contactLine || "https://line.me";

  return (
    <a
      href={lineUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-2.5 rounded-2xl font-extrabold text-xs sm:text-sm shadow-2xl hover:scale-105 active:scale-95 transition-all group backdrop-blur-md border ${
        isLight
          ? "bg-white hover:bg-slate-100 text-slate-900 border-slate-200/90 shadow-slate-300/50"
          : "bg-[#0c0d12]/95 hover:bg-[#151722] text-white border-white/10 shadow-black/80"
      }`}
    >
      <div className="relative flex items-center justify-center">
        <MessageCircle className={`w-4 h-4 ${isLight ? "text-emerald-600" : "text-emerald-400"}`} />
        <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
      </div>
      <span className="tracking-wide">ติดต่อแอดมิน</span>
    </a>
  );
}
