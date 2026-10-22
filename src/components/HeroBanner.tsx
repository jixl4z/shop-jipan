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
  CreditCard,
  Layers,
  KeyRound,
  CheckCircle2,
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
    <section className="relative overflow-hidden pt-4 pb-8 sm:pt-6 sm:pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-6">
        
        {/* LED Marquee Announcement Ticker (Fluffy 4Tunez Style) */}
        <div className="w-full rounded-2xl bg-[#0d0f17]/90 border border-white/[0.08] p-2.5 sm:p-3 flex items-center gap-3 backdrop-blur-xl shadow-lg overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono shrink-0">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-bold">ระบบพร้อมใช้งาน</span>
          </div>
          <div className="flex-1 overflow-hidden relative">
            <div className="whitespace-nowrap animate-marquee flex items-center gap-8 text-xs text-slate-300 font-light">
              <span>⚡ {setting?.shopNotice || "พร้อมให้บริการแล้วนะ ระบบสแกนสลิปพร้อมเพย์ & ซองของขวัญทรูมันนี่ เงินเข้าทันทีตลอด 24 ชม."}</span>
              <span className="text-slate-600">•</span>
              <span>💬 ไลน์แอดมิน: <strong className="text-emerald-400">{setting?.contactLine || "@jipanstore"}</strong></span>
              <span className="text-slate-600">•</span>
              <span>🛡️ ปลอดภัย มั่นใจ ได้ของจริง 100% จัดส่งอัตโนมัติหลังชำระเงิน</span>
            </div>
          </div>
        </div>

        {/* Hero Headings */}
        <div className="text-center space-y-3 py-2 sm:py-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-xs font-mono text-slate-300 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>24/7 AUTOMATED DIGITAL STORE</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            {setting?.shopName || "JIPAN STORE"}{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
              🫰🏻✨
            </span>
          </h1>

          <p className="text-xs sm:text-base text-slate-400 max-w-xl mx-auto font-light leading-relaxed">
            {setting?.shopSlogan ||
              "ศูนย์รวมสินค้าดิจิทัล ไอดีเกม บัตรเติมเงิน และแอปพรีเมียมราคาประหยัด ได้รับสินค้าทันทีหลังชำระเงิน ปลอดภัย 100%"}
          </p>

          {/* CTA Buttons */}
          <div className="flex items-center justify-center gap-3 pt-2">
            <Link
              href="/products"
              className="px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-white text-black hover:bg-neutral-200 active:scale-95 transition-all shadow-lg shadow-white/10 flex items-center gap-2 cursor-pointer"
            >
              <span>เริ่มต้นการใช้งาน</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <button
              onClick={openTopup}
              className="px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-[#121522] hover:bg-[#1a1e30] border border-white/10 text-white flex items-center gap-2 active:scale-95 transition-all cursor-pointer shadow-md"
            >
              <CreditCard className="w-4 h-4 text-emerald-400" />
              <span>เติมเงิน (สลิป / วอเล็ท)</span>
            </button>
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
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex items-end p-5 sm:p-8">
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30">
                      PROMOTION
                    </span>
                    <h3 className="font-extrabold text-base sm:text-2xl text-white drop-shadow-md">
                      {b.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-300 drop-shadow-md font-light hidden sm:block">
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
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 border border-white/10 text-white flex items-center justify-center backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity z-20 cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => setActiveBanner((prev) => (prev + 1) % banners.length)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 border border-white/10 text-white flex items-center justify-center backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity z-20 cursor-pointer"
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

        {/* 4 Interactive Feature Shortcut Cards (Modern 4Tunez Style) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          
          <div
            onClick={openTopup}
            className="p-4 sm:p-5 rounded-2xl bg-[#0d0f17]/90 border border-white/[0.08] hover:border-emerald-500/40 hover:-translate-y-1 transition-all duration-200 cursor-pointer group shadow-lg flex flex-col justify-between"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm sm:text-base text-white group-hover:text-emerald-400 transition-colors">
                เติมเงินอัตโนมัติ
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                พร้อมเพย์ & ทรูวอเล็ท
              </div>
            </div>
          </div>

          <Link
            href="/products"
            className="p-4 sm:p-5 rounded-2xl bg-[#0d0f17]/90 border border-white/[0.08] hover:border-blue-500/40 hover:-translate-y-1 transition-all duration-200 cursor-pointer group shadow-lg flex flex-col justify-between"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm sm:text-base text-white group-hover:text-blue-400 transition-colors">
                สินค้าทั้งหมด
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                ไอดีเกม & แอปพรีเมียม
              </div>
            </div>
          </Link>

          <Link
            href="/categories"
            className="p-4 sm:p-5 rounded-2xl bg-[#0d0f17]/90 border border-white/[0.08] hover:border-purple-500/40 hover:-translate-y-1 transition-all duration-200 cursor-pointer group shadow-lg flex flex-col justify-between"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm sm:text-base text-white group-hover:text-purple-400 transition-colors">
                หมวดหมู่สินค้า
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                แยกตามประเภทสินค้า
              </div>
            </div>
          </Link>

          <Link
            href="/orders"
            className="p-4 sm:p-5 rounded-2xl bg-[#0d0f17]/90 border border-white/[0.08] hover:border-amber-500/40 hover:-translate-y-1 transition-all duration-200 cursor-pointer group shadow-lg flex flex-col justify-between"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm sm:text-base text-white group-hover:text-amber-400 transition-colors">
                คลังของฉัน
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                ดูประวัติรหัสที่ซื้อแล้ว
              </div>
            </div>
          </Link>

        </div>

      </div>
    </section>
  );
}
