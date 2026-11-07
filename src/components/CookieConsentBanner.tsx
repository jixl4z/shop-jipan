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
      <div className="rounded-2xl border border-white/[0.12] bg-[#0c0d12]/95 backdrop-blur-2xl p-4 sm:p-5 shadow-2xl shadow-black/90 space-y-3.5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/[0.08] border border-white/10 flex items-center justify-center text-white shrink-0">
            <Cookie className="w-5 h-5 text-amber-300" />
          </div>
          <div className="space-y-1 min-w-0">
            <div className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>นโยบายคุกกี้และความเป็นส่วนตัว</span>
            </div>
            <p className="text-xs text-neutral-400 font-light leading-relaxed">
              เว็บไซต์นี้ใช้คุกกี้เพื่อมอบประสบการณ์การใช้งานที่ดีที่สุด รักษาความปลอดภัยในการทำรายการ และจดจำสถานะการเข้าสู่ระบบของคุณ
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={handleAccept}
            className="flex-1 py-2 sm:py-2.5 rounded-xl bg-white text-black hover:bg-neutral-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md active:scale-95 btn-shine"
          >
            <Check className="w-4 h-4 text-black" />
            <span>ยอมรับทั้งหมด</span>
          </button>
          <button
            type="button"
            onClick={handleDecline}
            className="px-4 py-2 sm:py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/10 text-neutral-300 hover:text-white font-medium text-xs transition-colors cursor-pointer border border-white/10"
          >
            จำเป็นเท่านั้น
          </button>
        </div>
      </div>
    </aside>
  );
}
