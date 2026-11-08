"use client";

import React, { useState, useEffect } from "react";
import { Cookie, ShieldCheck, Check } from "lucide-react";

export default function CookieConsentBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem("jipan_cookie_consent");
      if (!consent) {
        // Show after 1.5s
        const timer = setTimeout(() => {
          setIsVisible(true);
        }, 1500);
        return () => clearTimeout(timer);
      }
    } catch {
      // localStorage may fail in private mode
    }
  }, []);

  const handleAccept = () => {
    try {
      localStorage.setItem("jipan_cookie_consent", "accepted");
    } catch {}
    setIsVisible(false);
  };

  const handleDecline = () => {
    try {
      localStorage.setItem("jipan_cookie_consent", "essential_only");
    } catch {}
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <aside
      aria-label="การตั้งค่าคุกกี้"
      className="fixed bottom-4 sm:bottom-6 left-4 right-4 sm:left-auto sm:right-6 z-50 max-w-md animate-in fade-in slide-in-from-bottom-5 duration-300"
    >
      <div className="rounded-2xl border border-slate-200 bg-white/95 text-slate-900 shadow-2xl p-4 sm:p-5 space-y-3.5 backdrop-blur-2xl dark:border-white/[0.12] dark:bg-[#0c0d12]/95 dark:text-white dark:shadow-black/90">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
            <Cookie className="w-5 h-5" />
          </div>
          <div className="space-y-1 min-w-0">
            <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>นโยบายคุกกี้และความเป็นส่วนตัว</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-neutral-400 font-light leading-relaxed">
              เว็บไซต์นี้ใช้คุกกี้เพื่อมอบประสบการณ์การใช้งานที่ดีที่สุด รักษาความปลอดภัยในการทำรายการ และจดจำสถานะการเข้าสู่ระบบของคุณ
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={handleAccept}
            className="flex-1 py-2 sm:py-2.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md active:scale-95 btn-shine"
          >
            <Check className="w-4 h-4 text-current" />
            <span>ยอมรับทั้งหมด</span>
          </button>
          <button
            type="button"
            onClick={handleDecline}
            className="px-4 py-2 sm:py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-white/[0.06] dark:hover:bg-white/10 dark:text-neutral-300 dark:hover:text-white font-medium text-xs transition-colors cursor-pointer border border-slate-200 dark:border-white/10"
          >
            จำเป็นเท่านั้น
          </button>
        </div>
      </div>
    </aside>
  );
}
