"use client";

import React, { useState, useEffect } from "react";
import { useStore } from "@/context/StoreContext";
import { Megaphone, X, ExternalLink } from "lucide-react";

export default function AnnouncementPopup() {
  const { setting } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [hideForOneHour, setHideForOneHour] = useState(false);

  useEffect(() => {
    if (!setting) return;
    if (!setting.popupEnabled || !setting.popupMediaUrl?.trim()) return;

    try {
      const dismissedUntil = localStorage.getItem("jipan_popup_dismissed_until");
      if (dismissedUntil && Date.now() < Number(dismissedUntil)) {
        return;
      }
    } catch {}

    // Show after slight delay for smooth entrance
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 700);

    return () => clearTimeout(timer);
  }, [setting]);

  if (!isOpen || !setting?.popupEnabled || !setting?.popupMediaUrl?.trim()) {
    return null;
  }

  const handleClose = () => {
    if (hideForOneHour) {
      try {
        const oneHourLater = Date.now() + 60 * 60 * 1000;
        localStorage.setItem("jipan_popup_dismissed_until", String(oneHourLater));
      } catch {}
    }
    setIsOpen(false);
  };

  const isVideo =
    setting.popupMediaType === "video" ||
    (setting.popupMediaType === "auto" &&
      /\.(mp4|webm|mov)(\?.*)?$/i.test(setting.popupMediaUrl));

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="ประกาศร้านค้า"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-sm sm:max-w-md bg-[#0c0d12] border border-white/[0.1] rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 pb-3 flex items-center justify-between gap-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/25 flex items-center justify-center text-sky-400 shrink-0">
              <Megaphone className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm sm:text-base text-white truncate">
              {setting.popupTitle || "ข่าวสารและกิจกรรม"}
            </h3>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="w-8 h-8 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-neutral-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
            aria-label="ปิดหน้าต่าง"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Media Body (Image or MP4 Video) */}
        <div className="p-4 sm:p-5 relative">
          <div className="relative rounded-2xl overflow-hidden bg-black/60 border border-white/[0.08] shadow-inner group">
            {isVideo ? (
              <video
                src={setting.popupMediaUrl}
                autoPlay
                muted
                loop
                playsInline
                className="w-full max-h-[58vh] object-contain sm:object-cover mx-auto"
              />
            ) : (
              <img
                src={setting.popupMediaUrl}
                alt={setting.popupTitle || "ประกาศร้านค้า"}
                className="w-full max-h-[58vh] object-contain sm:object-cover mx-auto"
              />
            )}

            {/* Open Link Button (Floating on bottom right of media) */}
            {setting.popupLink && (
              <a
                href={setting.popupLink}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute bottom-3 right-3 px-3.5 py-1.5 rounded-xl bg-black/80 hover:bg-black text-white border border-white/20 backdrop-blur-md text-xs font-bold shadow-lg flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95"
              >
                <span>{setting.popupLinkText || "เปิดลิงก์"}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 pt-1 border-t border-white/[0.06] bg-[#07080b] flex items-center justify-between gap-3">
          {/* Hide for 1 hour checkbox */}
          <label className="flex items-center gap-2 text-xs text-neutral-400 hover:text-neutral-200 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={hideForOneHour}
              onChange={(e) => setHideForOneHour(e.target.checked)}
              className="w-4 h-4 rounded border-neutral-700 bg-neutral-800 text-white accent-white focus:ring-0 focus:outline-none cursor-pointer"
            />
            <span>ไม่แสดงอีก 1 ชั่วโมง</span>
          </label>

          {/* Close button */}
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-neutral-300 hover:text-white text-xs font-medium border border-white/10 transition-colors cursor-pointer"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
}
