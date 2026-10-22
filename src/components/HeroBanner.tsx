"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useStore } from "@/context/StoreContext";
import {
  Sparkles,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  ShoppingBag,
  Layers,
  KeyRound,
} from "lucide-react";

export default function HeroBanner() {
  const { setting, openTopup } = useStore();

  const defaultBanners = [
    {
      id: 1,
      image: "/images/4tunez-b1-1791027234.webp",
      title: "ยินดีต้อนรับสู่ " + (setting?.shopName || "JIPAN STORE"),
      subtitle: "บริการจัดส่งรหัสสินค้าดิจิทัลและไอดีเกมอัตโนมัติ 24 ชั่วโมง",
    },
    {
      id: 2,
      image: "/images/4tunez-b2-1791027234.webp",
      title: "ระบบสแกนสลิปออโต้ & ทรูมันนี่",
      subtitle: "เติมเงินปุ๊บ ยอดเข้ากระเป๋าทันที พร้อมเพย์และซองของขวัญ",
    },
    {
      id: 3,
      image: "/images/4tunez-b3-1791027234.webp",
      title: "สินค้าพร้อมส่ง รับประกันคุณภาพ",
      subtitle: "รับสินค้าและรหัสทันทีหลังชำระเงิน ตรวจสอบได้ตลอดเวลา",
    },
  ];

  const banners =
    setting?.bannerUrls && Array.isArray(setting.bannerUrls) && setting.bannerUrls.length > 0
      ? setting.bannerUrls.map((url, idx) => ({
          id: idx + 1,
          image: url,
          title: setting.shopName || "โปรโมชั่นพิเศษ",
          subtitle: setting.shopSlogan || "ระบบอัตโนมัติส่งของทันที 24 ชั่วโมง",
        }))
      : defaultBanners;

  const [activeBanner, setActiveBanner] = useState(0);

  // Auto slide carousel every 6 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveBanner((prev) => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [banners.length]);

  return (
    <section className="relative pt-4 pb-6 sm:pt-6 sm:pb-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-5">
        
        {/* LED Marquee Announcement Ticker */}
        <div className="w-full rounded-2xl glass-panel p-2.5 sm:p-3 flex items-center gap-3 overflow-hidden shadow-lg">
          <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono shrink-0">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-semibold">ระบบพร้อมใช้งาน</span>
          </div>
          <div className="flex-1 overflow-hidden relative">
            <div className="whitespace-nowrap animate-marquee flex items-center gap-8 text-xs text-neutral-300 font-light">
              <span>⚡ {setting?.shopNotice || "พร้อมให้บริการแล้วนะ ระบบสแกนสลิปพร้อมเพย์ & ซองของขวัญทรูมันนี่ เงินเข้าทันทีตลอด 24 ชม."}</span>
              <span className="text-neutral-600">•</span>
              <span>💬 ไลน์แอดมิน: <strong className="text-emerald-400 font-medium">{setting?.contactLine || "@jipanstore"}</strong></span>
              <span className="text-neutral-600">•</span>
              <span>🛡️ ปลอดภัย มั่นใจ ได้ของจริง 100% จัดส่งอัตโนมัติในคลังของฉัน</span>
            </div>
          </div>
        </div>

        {/* Banner Carousel Slider */}
        <div className="relative rounded-3xl overflow-hidden border border-white/[0.08] bg-[#0c0e15] shadow-2xl group">
          <div className="relative aspect-[21/9] sm:aspect-[24/9] w-full overflow-hidden">
            {banners.map((b, idx) => (
              <div
                key={b.id}
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                  activeBanner === idx ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
                }`}
              >
                <img
                  src={b.image}
                  alt={b.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent flex items-end p-5 sm:p-8">
                  <div className="space-y-1.5 max-w-2xl">
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-400 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 backdrop-blur-md">
                      <Sparkles className="w-3 h-3" />
                      <span>FEATURED</span>
                    </span>
                    <h2 className="font-extrabold text-base sm:text-2xl text-white drop-shadow-md">
                      {b.title}
                    </h2>
                    <p className="text-xs sm:text-sm text-neutral-300 drop-shadow-md font-light hidden sm:block">
                      {b.subtitle}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Slider Controls */}
          <button
            onClick={() =>
              setActiveBanner((prev) => (prev - 1 + banners.length) % banners.length)
            }
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 border border-white/10 text-white flex items-center justify-center backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity z-20 cursor-pointer"
            aria-label="Previous Slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => setActiveBanner((prev) => (prev + 1) % banners.length)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 border border-white/10 text-white flex items-center justify-center backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity z-20 cursor-pointer"
            aria-label="Next Slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Indicator Dots */}
          <div className="absolute bottom-3 right-4 flex items-center gap-1.5 z-20">
            {banners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveBanner(idx)}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  activeBanner === idx ? "w-6 bg-white" : "w-1.5 bg-white/40"
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* 4 Clean Quick Action Shortcut Cards (Harmonious Dock) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div
            onClick={openTopup}
            className="p-4 sm:p-4.5 rounded-2xl glass-panel interactive-card cursor-pointer group flex items-center gap-3.5"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <CreditCard className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="font-bold text-xs sm:text-sm text-white group-hover:text-emerald-400 transition-colors truncate">
                เติมเงินอัตโนมัติ
              </div>
              <div className="text-[11px] text-neutral-400 mt-0.5 truncate">
                สแกนสลิป & วอเล็ท
              </div>
            </div>
          </div>

          <Link
            href="/products"
            className="p-4 sm:p-4.5 rounded-2xl glass-panel interactive-card cursor-pointer group flex items-center gap-3.5"
          >
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="font-bold text-xs sm:text-sm text-white group-hover:text-sky-400 transition-colors truncate">
                สินค้าทั้งหมด
              </div>
              <div className="text-[11px] text-neutral-400 mt-0.5 truncate">
                ไอดีเกม & บริการ
              </div>
            </div>
          </Link>

          <Link
            href="/categories"
            className="p-4 sm:p-4.5 rounded-2xl glass-panel interactive-card cursor-pointer group flex items-center gap-3.5"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Layers className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="font-bold text-xs sm:text-sm text-white group-hover:text-purple-400 transition-colors truncate">
                หมวดหมู่สินค้า
              </div>
              <div className="text-[11px] text-neutral-400 mt-0.5 truncate">
                เลือกตามประเภท
              </div>
            </div>
          </Link>

          <Link
            href="/orders"
            className="p-4 sm:p-4.5 rounded-2xl glass-panel interactive-card cursor-pointer group flex items-center gap-3.5"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <KeyRound className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="font-bold text-xs sm:text-sm text-white group-hover:text-amber-400 transition-colors truncate">
                คลังของฉัน
              </div>
              <div className="text-[11px] text-neutral-400 mt-0.5 truncate">
                รับรหัสที่สั่งซื้อ
              </div>
            </div>
          </Link>
        </div>

      </div>
    </section>
  );
}
