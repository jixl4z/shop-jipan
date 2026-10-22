"use client";

import React from "react";
import { useStore } from "@/context/StoreContext";
import { MessageCircle } from "lucide-react";

export default function FloatingChat() {
  const { setting } = useStore();
  const lineUrl = setting?.contactLine || "https://line.me";

  return (
    <a
      href={lineUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-3 rounded-full bg-[#06c755] hover:bg-[#05b34c] text-white font-bold text-xs sm:text-sm shadow-2xl hover:scale-105 active:scale-95 transition-all group backdrop-blur-md"
    >
      <div className="relative">
        <MessageCircle className="w-5 h-5 fill-white text-transparent" />
        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-200 rounded-full animate-ping" />
      </div>
      <span className="tracking-wide">ติดต่อแอดมิน LINE</span>
    </a>
  );
}
