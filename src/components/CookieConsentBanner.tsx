"use client";

import React, { useState, useEffect } from "react";
import { Cookie, Check, SlidersHorizontal } from "lucide-react";
import CookieSettingsModal from "./CookieSettingsModal";

export default function CookieConsentBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  // Listen to open-cookie-settings custom event (e.g. from footer)
  useEffect(() => {
    const handleOpen = () => setIsModalOpen(true);
    window.addEventListener("open-cookie-settings", handleOpen);
    return () => window.removeEventListener("open-cookie-settings", handleOpen);
  }, []);

  const handleAcceptAll = () => {
    try {
      localStorage.setItem("jipan_cookie_consent", "accepted");
      localStorage.setItem("jipan_cookie_perf", "true");
      localStorage.setItem("jipan_cookie_pers", "true");
    } catch {}
    setIsVisible(false);
  };

  const handleDecline = () => {
    try {
      localStorage.setItem("jipan_cookie_consent", "essential_only");
      localStorage.setItem("jipan_cookie_perf", "false");
      localStorage.setItem("jipan_cookie_pers", "false");
    } catch {}
    setIsVisible(false);
  };

  return (
    <>
      {isVisible && (
        <aside
          aria-label="การตั้งค่าคุกกี้"
          className="fixed bottom-4 sm:bottom-6 left-4 right-4 sm:left-auto sm:right-6 z-40 max-w-md animate-in fade-in slide-in-from-bottom-5 duration-300"
        >
          <div className="rounded-2xl border border-white/[0.12] bg-[#0c0d12]/95 text-white shadow-2xl p-4 sm:p-5 space-y-3.5 backdrop-blur-2xl shadow-black/90">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white shrink-0">
                <Cookie className="w-5 h-5" />
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
                onClick={handleAcceptAll}
                className="flex-1 py-2 sm:py-2.5 rounded-xl bg-white hover:bg-neutral-200 text-black font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md active:scale-95"
              >
                <Check className="w-4 h-4 text-black" />
                <span>ยอมรับทั้งหมด</span>
              </button>
              <button
                type="button"
                onClick={handleDecline}
                className="px-3.5 py-2 sm:py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/10 text-neutral-300 hover:text-white font-medium text-xs transition-colors cursor-pointer border border-white/10"
              >
                จำเป็นเท่านั้น
              </button>
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="p-2 sm:p-2.5 rounded-xl bg-white/[0.06] hover:bg-white/10 text-neutral-300 hover:text-white transition-colors cursor-pointer border border-white/10"
                title="ตั้งค่าตัวเลือกคุกกี้"
                aria-label="ตั้งค่าตัวเลือกคุกกี้"
              >
                <SlidersHorizontal className="w-4 h-4" />
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* Floating Cookie Settings Trigger Button (Small bottom-left icon pill for easy re-opening) */}
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-4 left-4 z-30 w-9 h-9 rounded-full bg-[#0e0f14]/80 hover:bg-[#161720] border border-white/10 text-neutral-400 hover:text-white backdrop-blur-md shadow-lg flex items-center justify-center transition-all hover:scale-105 cursor-pointer"
        title="ตั้งค่าความเป็นส่วนตัวคุกกี้"
        aria-label="ตั้งค่าความเป็นส่วนตัวคุกกี้"
      >
        <Cookie className="w-4 h-4" />
      </button>

      {/* Detailed Privacy Settings Modal */}
      <CookieSettingsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaved={() => setIsVisible(false)}
      />
    </>
  );
}
