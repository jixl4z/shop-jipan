"use client";

import React from "react";
import { ShieldCheck, Zap, Lock, Headphones } from "lucide-react";
import { useStore } from "@/context/StoreContext";

export default function FeatureHighlights() {
  const { setting, currentTheme } = useStore();

  const features = [
    {
      icon: ShieldCheck,
      title: "ปลอดภัย 100%",
      desc: "ข้อมูลปลอดภัย เข้ารหัสมาตรฐานระดับสากล ไม่เก็บข้อมูลส่วนตัวที่อ่อนไหว",
    },
    {
      icon: Zap,
      title: "ระบบอัตโนมัติ รวดเร็ว",
      desc: "ระบบสแกนสลิป PromptPay อัตโนมัติ เงินเข้ากระเป๋าใน 1 นาที ตลอด 24 ชม.",
    },
    {
      icon: Lock,
      title: "รับสินค้าทันที",
      desc: "สต็อกพร้อมส่ง กดสั่งซื้อปุ๊บ ระบบแจกคีย์/รหัสผ่านเข้าบัญชีทันที",
    },
    {
      icon: Headphones,
      title: "บริการลูกค้าและซัพพอร์ต",
      desc: "มีปัญหาในการสั่งซื้อหรือการใช้งาน สามารถทักแชตติดต่อแอดมินได้ตลอดเวลา",
    },
  ];

  return (
    <section className="py-12 bg-neutral-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            ทำไมต้องเลือก {setting?.shopName || "JIPAN STORE"}?
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            มาตรฐานร้านค้าออนไลน์ยุคใหม่ รวดเร็ว โปร่งใส ตรวจสอบได้
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={i}
                className="p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800/80 hover:border-neutral-700 transition-all group glow-card"
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${currentTheme.badgeBg}`}>
                  <Icon className={`w-5 h-5 ${currentTheme.badgeText}`} />
                </div>
                <h3 className="font-bold text-sm sm:text-base text-white mb-1.5">
                  {f.title}
                </h3>
                <p className="text-xs text-neutral-400 leading-relaxed font-light">
                  {f.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
