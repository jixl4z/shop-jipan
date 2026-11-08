"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Home, ChevronLeft } from "lucide-react";

export default function NotFound() {
  const router = useRouter();

  const handleOpenSearch = () => {
    // Dispatch Ctrl+K event to open search modal
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "k",
          ctrlKey: true,
          bubbles: true,
        })
      );
    }
  };

  // Fixed confetti coordinates matching reference image
  const confettiPieces = [
    { top: "10%", left: "8%", color: "bg-purple-400", rotate: "rotate-45", w: "w-1.5", h: "h-3" },
    { top: "18%", left: "25%", color: "bg-blue-400", rotate: "-rotate-12", w: "w-2", h: "h-1" },
    { top: "12%", left: "62%", color: "bg-purple-300", rotate: "rotate-45", w: "w-2", h: "h-1" },
    { top: "8%", left: "86%", color: "bg-blue-500", rotate: "-rotate-45", w: "w-1.5", h: "h-2.5" },
    { top: "28%", left: "48%", color: "bg-blue-400", rotate: "rotate-20", w: "w-2", h: "h-1" },
    { top: "22%", left: "92%", color: "bg-amber-300", rotate: "rotate-12", w: "w-1", h: "h-2" },
    { top: "33%", left: "74%", color: "bg-purple-300", rotate: "rotate-12", w: "w-1.5", h: "h-2" },
    { top: "38%", left: "5%", color: "bg-emerald-400", rotate: "rotate-45", w: "w-1", h: "h-2.5" },
    { top: "37%", left: "10%", color: "bg-purple-400", rotate: "-rotate-45", w: "w-1", h: "h-2" },
    { top: "42%", left: "47%", color: "bg-emerald-400", rotate: "rotate-12", w: "w-1.5", h: "h-2" },
    { top: "56%", left: "18%", color: "bg-blue-500", rotate: "rotate-45", w: "w-2", h: "h-1.5" },
    { top: "54%", left: "34%", color: "bg-amber-400", rotate: "-rotate-30", w: "w-1.5", h: "h-1" },
    { top: "67%", left: "34%", color: "bg-white/80", rotate: "rotate-12", w: "w-1", h: "h-2" },
    { top: "63%", left: "64%", color: "bg-neutral-400", rotate: "-rotate-20", w: "w-2", h: "h-1" },
    { top: "67%", left: "36%", color: "bg-neutral-300", rotate: "rotate-45", w: "w-1.5", h: "h-2.5" },
    { top: "74%", left: "67%", color: "bg-white/70", rotate: "-rotate-45", w: "w-1.5", h: "h-2" },
    { top: "76%", left: "97%", color: "bg-neutral-300", rotate: "rotate-45", w: "w-1.5", h: "h-2" },
    { top: "86%", left: "61%", color: "bg-neutral-400", rotate: "rotate-45", w: "w-1.5", h: "h-2" },
    { top: "92%", left: "12%", color: "bg-neutral-300", rotate: "rotate-20", w: "w-1.5", h: "h-2" },
    { top: "98%", left: "19%", color: "bg-white/90", rotate: "-rotate-45", w: "w-2", h: "h-1.5" },
    { top: "98%", left: "84%", color: "bg-blue-300", rotate: "rotate-30", w: "w-1.5", h: "h-2" },
  ];

  return (
    <div className="relative min-h-[78vh] flex flex-col items-center justify-center px-4 py-16 overflow-hidden select-none">
      {/* Decorative Confetti Sprinkles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-90">
        {confettiPieces.map((p, i) => (
          <div
            key={i}
            className={`absolute ${p.color} ${p.rotate} ${p.w} ${p.h} rounded-sm shadow-sm transition-transform`}
            style={{ top: p.top, left: p.left }}
          />
        ))}
      </div>

      {/* Giant 404 Watermark in Background */}
      <div className="relative flex flex-col items-center justify-center text-center max-w-xl z-10">
        <div className="relative mb-2">
          {/* 404 Backdrop Watermark */}
          <span
            className="text-[140px] sm:text-[200px] md:text-[260px] font-black leading-none text-neutral-900/[0.06] dark:text-white/[0.04] tracking-tighter select-none pointer-events-none block -mb-16 sm:-mb-24"
            aria-hidden="true"
          >
            404
          </span>

          {/* Error Tag */}
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-neutral-200/60 dark:bg-white/[0.08] text-neutral-600 dark:text-neutral-400 border border-neutral-300/50 dark:border-white/10 text-xs font-medium backdrop-blur-md shadow-sm">
            <span>ข้อผิดพลาด 404</span>
          </div>
        </div>

        {/* Main Heading */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-neutral-900 dark:text-white tracking-tight mt-1">
          ไม่พบหน้าที่คุณต้องการ
        </h1>

        {/* Subtitle */}
        <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 font-light mt-2 max-w-md leading-relaxed">
          ขออภัย ไม่พบเนื้อหาที่คุณกำลังค้นหา หน้านี้อาจถูกย้าย ถูกลบ หรือพิมพ์ที่อยู่ไม่ถูกต้อง
        </p>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-3 mt-7">
          {/* Home Button */}
          <Link
            href="/"
            className="px-5 py-2.5 rounded-2xl bg-[#121318] hover:bg-[#1f2029] text-white dark:bg-white dark:text-black dark:hover:bg-neutral-200 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg hover:scale-105 active:scale-95 transition-all"
          >
            <Home className="w-4 h-4" />
            <span>กลับหน้าแรก</span>
          </Link>

          {/* Back Button */}
          <button
            type="button"
            onClick={() => {
              if (window.history.length > 1) {
                router.back();
              } else {
                router.push("/");
              }
            }}
            className="px-5 py-2.5 rounded-2xl bg-neutral-200/80 hover:bg-neutral-300/80 text-neutral-800 dark:bg-white/[0.08] dark:hover:bg-white/[0.14] dark:text-neutral-200 font-semibold text-xs sm:text-sm flex items-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer border border-neutral-300/50 dark:border-white/10"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>ย้อนกลับ</span>
          </button>
        </div>

        {/* Keyboard shortcut hint */}
        <button
          type="button"
          onClick={handleOpenSearch}
          className="mt-6 inline-flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-white transition-colors cursor-pointer group"
          title="กดเพื่อเปิดค้นหาสินค้า"
        >
          <span>หรือกด</span>
          <kbd className="px-2 py-0.5 rounded-md bg-neutral-200/80 dark:bg-white/[0.08] border border-neutral-300 dark:border-white/10 font-mono text-[11px] text-neutral-700 dark:text-neutral-300 group-hover:border-neutral-400 dark:group-hover:border-white/25 transition-colors">
            Ctrl
          </kbd>
          <kbd className="px-2 py-0.5 rounded-md bg-neutral-200/80 dark:bg-white/[0.08] border border-neutral-300 dark:border-white/10 font-mono text-[11px] text-neutral-700 dark:text-neutral-300 group-hover:border-neutral-400 dark:group-hover:border-white/25 transition-colors">
            K
          </kbd>
          <span>เพื่อค้นหาสินค้า</span>
        </button>
      </div>
    </div>
  );
}
