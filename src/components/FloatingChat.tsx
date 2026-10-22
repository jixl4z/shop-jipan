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
      className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4.5 py-3 rounded-full bg-white hover:bg-neutral-200 text-black font-extrabold text-xs sm:text-sm shadow-2xl hover:scale-105 active:scale-95 transition-all group backdrop-blur-md border border-white/30"
    >
      <div className="relative">
        <MessageCircle className="w-5 h-5 fill-black text-transparent" />
        <span className="absolute -top-1 -right-1 w-2 h-2 bg-neutral-900 rounded-full animate-ping" />
      </div>
      <span className="tracking-wide">ติดต่อแอดมิน</span>
    </a>
  );
}
