"use client";

import React from "react";
import { ShieldCheck, Zap, Lock, Headphones } from "lucide-react";
import { useStore } from "@/context/StoreContext";

export default function FeatureHighlights() {
  const { setting } = useStore();

  const features = [
    {
      icon: ShieldCheck,
      title: "ปลอดภัย 100%",
      desc: "ระบบมาตรฐาน เข้ารหัสข้อมูล ปลอดภัยทุกการทำรายการ",
    },
    {
      icon: Zap,
      title: "ระบบอัตโนมัติ รวดเร็ว",
      desc: "สแกนสลิป PromptPay & ทรูมันนี่ เงินเข้าทันทีใน 1 นาที ตลอด 24 ชม.",
    },
    {
      icon: Lock,
      title: "รับสินค้าทันที",
      desc: "สต็อกพร้อมส่ง สั่งซื้อปุ๊บ ระบบส่งคีย์/รหัสเข้าคลังสินค้าทันที",
    },
    {
      icon: Headphones,
      title: "ฝ่ายบริการลูกค้า",
      desc: "มีปัญหาในการสั่งซื้อ สามารถติดต่อแอดมินผ่าน LINE ได้ตลอดเวลา",
    },
  ];

  return (
    <section className="py-10 max-w-6xl mx-auto px-4 sm:px-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {features.map((f, i) => {
          const Icon = f.icon;
          return (
            <div
              key={i}
              className="p-5 rounded-2xl glass-panel interactive-card group"
            >
              <div className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/10 text-white flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Icon className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="font-bold text-sm text-white mb-1">
                {f.title}
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed font-light">
                {f.desc}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
