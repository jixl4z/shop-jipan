"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useStore } from "@/context/StoreContext";
import {
  Sparkles,
  ArrowRight,
  Bell,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Zap,
  ShoppingBag,
} from "lucide-react";

export default function HeroBanner() {
  const { setting, openTopup, currentTheme } = useStore();

  const defaultBanners = [
    {
      id: 1,
      image: "/images/4tunez-b1-1791027234.webp",
      title: "โปรโมชั่นต้อนรับสมาชิกใหม่",
      subtitle: "เติมเงินวันนี้ รับโบนัสพิเศษและส่วนลดทุกหมวดหมู่",
    },
    {
      id: 2,
      image: "/images/4tunez-b2-1791027234.webp",
      title: "ระบบสแกนสลิปออโต้ 24 ชั่วโมง",
      subtitle: "สแกน QR PromptPay เงินเข้ากระเป๋าทันทีใน 1 นาที",
    },
    {
      id: 3,
      image: "/images/4tunez-b3-1791027234.webp",
      title: "ไอดีเกม & แอปพรีเมียมราคาถูก",
      subtitle: "รับของทันทีหลังกดซื้อ พร้อมการรับประกันตลอดอายุการใช้งาน",
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

  // Auto slide carousel every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveBanner((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  return (
    <section className="relative overflow-hidden pt-6 pb-10 sm:pt-10 sm:pb-14">
      {/* Background Decorative Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-white/[0.02] rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10 space-y-7">
        {/* Notice Bar */}
        {setting?.shopNotice && (
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-full bg-neutral-900/90 border border-neutral-800 backdrop-blur-md text-xs text-neutral-300">
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 font-semibold text-[11px] shrink-0 border border-amber-500/20">
              <Bell className="w-3 h-3" />
              <span>ประกาศร้านค้า</span>
            </div>
            <div className="truncate font-medium">{setting.shopNotice}</div>
          </div>
        )}

        {/* Hero Header Area */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-900/90 border border-neutral-800 text-xs text-neutral-300 shadow-md animate-float">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 animate-pulse-glow" />
            </span>
            <span className="font-semibold text-white">พร้อมให้บริการแล้วนะ</span>
            <span className="text-neutral-600">|</span>
            <span className="text-neutral-400 font-mono text-[11px]">Auto Delivery 24/7</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            ยินดีต้อนรับสู่{" "}
            <span className="text-shimmer font-black">
              {setting?.shopName || "JIPAN STORE"}
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xs sm:text-sm text-neutral-400 max-w-lg mx-auto font-light leading-relaxed">
            {setting?.shopSlogan ||
              "ศูนย์รวมสินค้าดิจิทัล ไอดีเกม บัตรเติมเงิน และแอปพรีเมียมราคาประหยัด ได้รับสินค้าทันทีหลังชำระเงิน ปลอดภัย 100%"}
          </p>

          {/* CTA Buttons */}
          <div className="flex items-center justify-center gap-3 pt-1">
            <Link
              href="/products"
              className={`px-5 py-2.5 rounded-full font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer ${currentTheme.accent}`}
            >
              <span>เริ่มต้นการใช้งาน</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <button
              onClick={openTopup}
              className="px-5 py-2.5 rounded-full font-semibold text-xs sm:text-sm bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-white flex items-center gap-2 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>เติมเงิน (สลิป / วอเล็ท)</span>
            </button>
          </div>
        </div>

        {/* Banner Carousel Slider */}
        <div className="relative rounded-3xl overflow-hidden border border-neutral-800/90 bg-neutral-900/60 shadow-2xl group">
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
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-5 sm:p-7">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                      Promotion
                    </span>
                    <h3 className="font-bold text-sm sm:text-lg text-white drop-shadow-md">
                      {b.title}
                    </h3>
                    <p className="text-xs text-neutral-300 drop-shadow-md hidden sm:block">
                      {b.subtitle}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Slider Arrows */}
          <button
            onClick={() =>
              setActiveBanner((prev) => (prev - 1 + banners.length) % banners.length)
            }
            className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 border border-white/10 text-white flex items-center justify-center backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity z-20 cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => setActiveBanner((prev) => (prev + 1) % banners.length)}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 border border-white/10 text-white flex items-center justify-center backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity z-20 cursor-pointer"
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
              />
            ))}
          </div>
        </div>

        {/* 4 Quick Action Feature Cards (with real webp graphics) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div
            onClick={openTopup}
            className="relative rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-900/60 hover:border-neutral-700 hover:scale-[1.02] transition-all cursor-pointer group shadow-lg"
          >
            <img
              src="/images/btn-topup.webp"
              alt="เติมเงินอัตโนมัติ"
              className="w-full h-auto object-cover"
            />
          </div>

          <Link
            href="/products"
            className="relative rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-900/60 hover:border-neutral-700 hover:scale-[1.02] transition-all cursor-pointer group shadow-lg"
          >
            <img
              src="/images/btn-rent.webp"
              alt="เลือกซื้อสินค้า"
              className="w-full h-auto object-cover"
            />
          </Link>

          <Link
            href="/categories"
            className="relative rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-900/60 hover:border-neutral-700 hover:scale-[1.02] transition-all cursor-pointer group shadow-lg"
          >
            <img
              src="/images/btn-support.webp"
              alt="หมวดหมู่สินค้า"
              className="w-full h-auto object-cover"
            />
          </Link>

          <Link
            href="/orders"
            className="relative rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-900/60 hover:border-neutral-700 hover:scale-[1.02] transition-all cursor-pointer group shadow-lg"
          >
            <img
              src="/images/btn-howto.webp"
              alt="คลังของฉัน"
              className="w-full h-auto object-cover"
            />
          </Link>
        </div>
      </div>
    </section>
  );
}
