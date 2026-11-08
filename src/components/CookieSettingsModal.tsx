"use client";

import React, { useState, useEffect } from "react";
import { SlidersHorizontal, Lock, Zap, CheckCircle2, X } from "lucide-react";

interface CookieSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

export default function CookieSettingsModal({
  isOpen,
  onClose,
  onSaved,
}: CookieSettingsModalProps) {
  const [perfEnabled, setPerfEnabled] = useState(true);
  const [persEnabled, setPersEnabled] = useState(true);

  // Load saved preferences
  useEffect(() => {
    if (!isOpen) return;
    try {
      const consent = localStorage.getItem("jipan_cookie_consent");
      if (consent === "essential_only") {
        setPerfEnabled(false);
        setPersEnabled(false);
      } else if (consent === "accepted") {
        setPerfEnabled(true);
        setPersEnabled(true);
      } else {
        const perf = localStorage.getItem("jipan_cookie_perf");
        const pers = localStorage.getItem("jipan_cookie_pers");
        if (perf !== null) setPerfEnabled(perf === "true");
        if (pers !== null) setPersEnabled(pers === "true");
      }
    } catch {}
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    try {
      localStorage.setItem("jipan_cookie_consent", "custom");
      localStorage.setItem("jipan_cookie_perf", String(perfEnabled));
      localStorage.setItem("jipan_cookie_pers", String(persEnabled));
    } catch {}
    if (onSaved) onSaved();
    onClose();
  };

  const handleAcceptAll = () => {
    try {
      localStorage.setItem("jipan_cookie_consent", "accepted");
      localStorage.setItem("jipan_cookie_perf", "true");
      localStorage.setItem("jipan_cookie_pers", "true");
      setPerfEnabled(true);
      setPersEnabled(true);
    } catch {}
    if (onSaved) onSaved();
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="ตั้งค่าความเป็นส่วนตัวของคุกกี้"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-[#0c0d12] border border-white/[0.1] rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 pb-4 flex items-start justify-between gap-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-rose-500/10 border border-rose-500/25 flex items-center justify-center text-rose-500 shrink-0">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                ตั้งค่าความเป็นส่วนตัวของคุกกี้
              </h2>
              <p className="text-xs text-neutral-400 font-light mt-0.5">
                กำหนดตัวเลือกความยินยอมตามที่คุณต้องการ
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-neutral-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
            aria-label="ปิดหน้าต่าง"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body: Cards */}
        <div className="p-5 sm:p-6 space-y-3.5 max-h-[68vh] overflow-y-auto">
          {/* Card 1: Necessary */}
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.08] flex items-start justify-between gap-4">
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-neutral-300 shrink-0" />
                <span className="font-semibold text-sm text-white">
                  คุกกี้ที่จำเป็นอย่างยิ่ง
                </span>
              </div>
              <p className="text-xs text-neutral-400 font-light leading-relaxed">
                จำเป็นต่อระบบรักษาความปลอดภัย การเข้าสู่ระบบ และการทำรายการคำสั่งซื้อ
              </p>
            </div>
            <span className="px-3 py-1.5 rounded-xl bg-white/[0.06] border border-white/5 text-neutral-400 text-xs font-medium shrink-0 select-none">
              จำเป็นเสมอ
            </span>
          </div>

          {/* Card 2: Performance */}
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.08] flex items-start justify-between gap-4">
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-rose-500 fill-rose-500 shrink-0" />
                <span className="font-semibold text-sm text-white">
                  คุกกี้ประสิทธิภาพและความปลอดภัย
                </span>
              </div>
              <p className="text-xs text-neutral-400 font-light leading-relaxed">
                ช่วยแคชข้อมูลเพื่อโหลดหน้าเว็บเร็วขึ้น และวิเคราะห์ข้อผิดพลาดของระบบ
              </p>
            </div>
            {/* Toggle switch */}
            <button
              type="button"
              role="switch"
              aria-checked={perfEnabled}
              onClick={() => setPerfEnabled(!perfEnabled)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                perfEnabled ? "bg-[#ff334b]" : "bg-neutral-800"
              }`}
            >
              <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  perfEnabled ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Card 3: Personalization */}
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.08] flex items-start justify-between gap-4">
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-neutral-300 shrink-0" />
                <span className="font-semibold text-sm text-white">
                  คุกกี้การใช้งานส่วนบุคคล
                </span>
              </div>
              <p className="text-xs text-neutral-400 font-light leading-relaxed">
                ใช้จดจำธีมที่เลือก (สว่าง/มืด) เพื่อความสะดวกในการใช้งาน
              </p>
            </div>
            {/* Toggle switch */}
            <button
              type="button"
              role="switch"
              aria-checked={persEnabled}
              onClick={() => setPersEnabled(!persEnabled)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                persEnabled ? "bg-[#ff334b]" : "bg-neutral-800"
              }`}
            >
              <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  persEnabled ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-white/[0.06] bg-[#07080b] flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleAcceptAll}
            className="text-rose-500 hover:text-rose-400 font-semibold text-xs sm:text-sm transition-colors cursor-pointer px-1 py-1"
          >
            ยอมรับทั้งหมด
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-neutral-300 hover:text-white font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-[#ff334b] hover:bg-[#e02b41] text-white font-bold text-xs sm:text-sm shadow-lg shadow-rose-500/25 active:scale-95 transition-all cursor-pointer"
            >
              บันทึกการตั้งค่า
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
