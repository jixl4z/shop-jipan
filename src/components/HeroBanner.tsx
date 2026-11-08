"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useStore } from "@/context/StoreContext";
import StatsCounter from "@/components/StatsCounter";
import {
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Zap,
  MessageCircle,
  ShieldCheck,
  ShoppingBag,
  ArrowRight,
  Wallet,
  Star,
  Headphones,
} from "lucide-react";

export default function HeroBanner() {
  const { setting, currentTheme, themeMode } = useStore();
  const isLight = themeMode === "light";

  const userBanners =
    setting?.bannerUrls && Array.isArray(setting.bannerUrls) && setting.bannerUrls.length > 0
      ? setting.bannerUrls.map((url, idx) => ({
          id: idx + 1,
          image: url,
          title: setting.shopName || "โปรโมชั่นพิเศษ",
          subtitle: setting.shopSlogan || "ระบบจัดส่งอัตโนมัติ 24 ชั่วโมง",
        }))
      : [];

  const defaultBanners = [
    {
      id: 1,
      image: "",
      title: setting?.shopName || "ยินดีต้อนรับสู่ JIPAN STORE",
      subtitle: setting?.shopSlogan || "บริการจัดส่งรหัสสินค้าดิจิทัลและไอดีเกมอัตโนมัติ 24 ชั่วโมง",
    },
  ];

  const banners = userBanners.length > 0 ? userBanners : defaultBanners;

  const [activeBanner, setActiveBanner] = useState(0);

  // Auto slide carousel every 6 seconds if multiple banners
  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setActiveBanner((prev) => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [banners.length]);

  return (
    <section className="relative pt-4 pb-6 sm:pt-6 sm:pb-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-4 sm:space-y-5">

        {/* Banner Carousel Slider */}
        <div className="relative rounded-2xl overflow-hidden border border-white/[0.08] bg-[#07080a] shadow-2xl group">
          <div className="relative aspect-[16/9] sm:aspect-[21/9] md:aspect-[24/9] w-full overflow-hidden">
            {banners.map((b, idx) => (
              <div
                key={b.id}
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                  activeBanner === idx ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
                }`}
              >
                {b.image ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={b.image}
                    alt={b.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-neutral-900 via-neutral-950 to-black flex items-center justify-center relative">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.06)_0%,transparent_70%)]" />
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent flex items-end p-4 sm:p-8">
                  <div className="space-y-1 sm:space-y-1.5 max-w-2xl">
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-white px-2.5 py-0.5 rounded-lg bg-white/10 border border-white/20 backdrop-blur-md">
                      <Sparkles className="w-3 h-3 text-white" />
                      <span>FEATURED</span>
                    </span>
                    <h2 className="font-extrabold text-sm sm:text-2xl text-white drop-shadow-md line-clamp-2">
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

          {banners.length > 1 && (
            <>
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
            </>
          )}
        </div>

        {/* Welcome Spotlight Banner (GenzX Shop reference layout) */}
        <div
          className={`rounded-2xl p-5 sm:p-7 border relative overflow-hidden shadow-xl transition-colors backdrop-blur-xl ${
            isLight
              ? "bg-white border-slate-200/80 shadow-slate-200/50"
              : "bg-[#0e0f15]/90 border-white/[0.08]"
          }`}
        >
          {/* Top Row: Info (Left) & Stacked Buttons (Right) */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              {/* Compact Pill Badge */}
              <div
                className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full border text-xs font-mono ${
                  isLight
                    ? "bg-slate-100 border-slate-200 text-slate-700"
                    : "bg-white/[0.05] border-white/10 text-neutral-300"
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[11px] font-medium">{setting?.shopName?.toLowerCase().replace(/\s+/g, '') || "jipanstore"}</span>
              </div>

              {/* Title with accent color on store name */}
              <h1
                className={`text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight flex items-baseline gap-2 flex-wrap ${
                  isLight ? "text-slate-900" : "text-white"
                }`}
              >
                <span>ยินดีต้อนรับสู่</span>
                <span className="text-white font-black">{setting?.shopName || "JIPAN STORE"}</span>
              </h1>

              {/* Slogan */}
              <p
                className={`text-xs sm:text-sm leading-relaxed font-light ${
                  isLight ? "text-slate-600" : "text-neutral-400"
                }`}
              >
                {setting?.shopSlogan || "ร้านบริการจำหน่ายสินค้าดิจิทัล บัญชีโซเชียล แอปพรีเมียม และเกมอื่นๆ ตอบโจทย์ทุกการใช้งาน"}
              </p>
            </div>

            {/* Stacked Action Buttons (Right) */}
            <div className="flex flex-col gap-2 w-full sm:w-48 shrink-0">
              <a
                href="#products"
                className="w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold bg-white hover:bg-neutral-200 text-black flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all cursor-pointer btn-shine"
              >
                <ShoppingBag className="w-4 h-4 text-black" />
                <span className="text-black">เลือกดูสินค้า</span>
                <ArrowRight className="w-4 h-4 text-black" />
              </a>
              <Link
                href="/topup"
                className={`w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-medium flex items-center justify-center gap-2 transition-all cursor-pointer border shadow-sm active:scale-95 ${
                  isLight
                    ? "bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-800"
                    : "bg-white/[0.04] hover:bg-white/[0.08] border-white/10 text-white"
                }`}
              >
                <Wallet className={`w-4 h-4 ${isLight ? "text-slate-500" : "text-neutral-400"}`} />
                <span>เติมเงินเข้ากระเป๋า</span>
              </Link>
            </div>
          </div>

          {/* Full-width Divider Line */}
          <div className={`w-full h-[1px] my-4 sm:my-5 ${isLight ? "bg-slate-200/80" : "bg-white/[0.06]"}`} />

          {/* Bottom Features Row */}
          <div className={`flex flex-wrap items-center gap-x-6 gap-y-2 text-xs ${isLight ? "text-slate-600" : "text-neutral-400"}`}>
            <span className="flex items-center gap-2">
              <Star className={`w-3.5 h-3.5 ${isLight ? "text-slate-800 fill-slate-800/20" : "text-white fill-white/20"}`} />
              <span>สินค้าคุณภาพสูง</span>
            </span>
            <span className="flex items-center gap-2">
              <ShieldCheck className={`w-3.5 h-3.5 ${isLight ? "text-slate-800" : "text-white"}`} />
              <span>ความปลอดภัยสูง ตรวจสอบได้</span>
            </span>
            <span className="flex items-center gap-2">
              <Headphones className={`w-3.5 h-3.5 ${isLight ? "text-slate-800" : "text-white"}`} />
              <span>บริการซัพพอร์ตตลอดการใช้งาน</span>
            </span>
          </div>
        </div>

        {/* Store Live Stats Counter (Positioned directly under hero banner like reference design) */}
        <StatsCounter />
      </div>
    </section>
  );
}
