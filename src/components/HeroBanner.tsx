"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useStore } from "@/context/StoreContext";
import {
  Sparkles,
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-4 sm:space-y-5">
        
        {/* Monochrome LED Marquee Announcement Ticker */}
        <div className="w-full rounded-2xl glass-panel p-2.5 sm:p-3 flex items-center gap-3 overflow-hidden shadow-lg border border-white/[0.08]">
          <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-white/10 border border-white/20 text-white text-xs font-mono shrink-0">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </span>
            <span className="font-semibold">ระบบพร้อมใช้งาน</span>
          </div>
          <div className="flex-1 overflow-hidden relative">
            <div className="whitespace-nowrap animate-marquee flex items-center gap-8 text-xs text-neutral-300 font-light">
              <span>⚡ {setting?.shopNotice || "พร้อมให้บริการแล้วนะ ระบบสแกนสลิปพร้อมเพย์ & ซองของขวัญทรูมันนี่ เงินเข้าทันทีตลอด 24 ชม."}</span>
              <span className="text-neutral-600">•</span>
              <span>💬 ไลน์แอดมิน: <strong className="text-white font-medium">{setting?.contactLine || "@jipanstore"}</strong></span>
              <span className="text-neutral-600">•</span>
              <span>🛡️ ปลอดภัย มั่นใจ ได้ของจริง 100% จัดส่งอัตโนมัติในคลังของฉัน</span>
            </div>
          </div>
        </div>

        {/* Banner Carousel Slider */}
        <div className="relative rounded-3xl overflow-hidden border border-white/[0.08] bg-[#07080a] shadow-2xl group">
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
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent flex items-end p-5 sm:p-8">
                  <div className="space-y-1.5 max-w-2xl">
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-white px-2.5 py-0.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md">
                      <Sparkles className="w-3 h-3 text-white" />
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
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 border border-white/15 text-white flex items-center justify-center backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity z-20 cursor-pointer"
            aria-label="Previous Slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => setActiveBanner((prev) => (prev + 1) % banners.length)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 border border-white/15 text-white flex items-center justify-center backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity z-20 cursor-pointer"
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
                  activeBanner === idx ? "w-6 bg-white" : "w-1.5 bg-white/30"
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* 4 Monochrome Quick Action Shortcut Cards (Harmonious Black & White Dock) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div
            onClick={openTopup}
            className="p-4 rounded-2xl glass-panel interactive-card cursor-pointer group flex items-center gap-3.5"
          >
            <div className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/10 text-white flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:bg-white group-hover:text-black transition-all">
              <CreditCard className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="font-bold text-xs sm:text-sm text-white group-hover:text-white transition-colors truncate">
                เติมเงินอัตโนมัติ
              </div>
              <div className="text-[11px] text-neutral-400 mt-0.5 truncate">
                สแกนสลิป & วอเล็ท
              </div>
            </div>
          </div>

          <Link
            href="/products"
            className="p-4 rounded-2xl glass-panel interactive-card cursor-pointer group flex items-center gap-3.5"
          >
            <div className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/10 text-white flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:bg-white group-hover:text-black transition-all">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="font-bold text-xs sm:text-sm text-white group-hover:text-white transition-colors truncate">
                สินค้าทั้งหมด
              </div>
              <div className="text-[11px] text-neutral-400 mt-0.5 truncate">
                ไอดีเกม & บริการ
              </div>
            </div>
          </Link>

          <Link
            href="/categories"
            className="p-4 rounded-2xl glass-panel interactive-card cursor-pointer group flex items-center gap-3.5"
          >
            <div className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/10 text-white flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:bg-white group-hover:text-black transition-all">
              <Layers className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="font-bold text-xs sm:text-sm text-white group-hover:text-white transition-colors truncate">
                หมวดหมู่สินค้า
              </div>
              <div className="text-[11px] text-neutral-400 mt-0.5 truncate">
                เลือกตามประเภท
              </div>
            </div>
          </Link>

          <Link
            href="/orders"
            className="p-4 rounded-2xl glass-panel interactive-card cursor-pointer group flex items-center gap-3.5"
          >
            <div className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/10 text-white flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:bg-white group-hover:text-black transition-all">
              <KeyRound className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="font-bold text-xs sm:text-sm text-white group-hover:text-white transition-colors truncate">
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
