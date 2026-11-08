"use client";

import React from "react";
import Link from "next/link";
import { useStore } from "@/context/StoreContext";
import {
  Zap,
  Star,
  Megaphone,
  BookOpen,
  LifeBuoy,
  ShieldCheck,
  Heart,
  MessageCircle,
  Cookie,
  ExternalLink,
} from "lucide-react";

export default function Footer() {
  const { setting } = useStore();

  const openCookieSettings = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("open-cookie-settings"));
    }
  };

  const hasDiscordWidget = !!setting?.discordServerId?.trim();
  const hasDiscordInvite = !!setting?.contactDiscord?.trim() && setting.contactDiscord !== "https://discord.gg/";

  return (
    <footer className="w-full bg-[#060608] border-t border-white/[0.08] pt-14 pb-8 text-neutral-400 transition-colors">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`grid grid-cols-1 ${
            hasDiscordWidget || hasDiscordInvite
              ? "lg:grid-cols-12 gap-8 lg:gap-10"
              : "md:grid-cols-3 gap-8 md:gap-12"
          } pb-12 border-b border-white/[0.06]`}
        >
          {/* Col 1: Brand Info & Contact Button */}
          <div
            className={`space-y-4 ${
              hasDiscordWidget || hasDiscordInvite ? "lg:col-span-4" : ""
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-600 to-red-500 border border-white/20 flex items-center justify-center font-black text-white text-base shadow-md overflow-hidden shrink-0">
                {setting?.logoUrl && setting.logoUrl !== "/logo.png" ? (
                  <img
                    src={setting.logoUrl}
                    alt={setting.shopName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Zap className="w-4 h-4 text-white" />
                )}
              </div>
              <span className="font-extrabold text-white text-base tracking-tight">
                {setting?.shopName || "JIPAN STORE"}
              </span>
            </div>

            <p className="text-xs text-neutral-400 font-light leading-relaxed max-w-sm">
              {setting?.shopSlogan ||
                "ศูนย์รวมสินค้าดิจิทัล ไอดีเกม บัตรเติมเงิน และบริการดิจิทัลระบบอัตโนมัติ 24 ชม. สแกนจ่ายด้วยสลิปพร้อมเพย์ รับของทันที"}
            </p>

            <div className="flex items-center gap-2 text-xs text-neutral-400 pt-0.5">
              <ShieldCheck className="w-4 h-4 text-rose-500 shrink-0" />
              <span className="font-light">การันตีความปลอดภัย 100% เชื่อมต่อระบบตรวจสลิปมาตรฐาน</span>
            </div>

            {/* Contact LINE Button */}
            {setting?.contactLine && (
              <div className="pt-2">
                <a
                  href={setting.contactLine}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:border-white/20 hover:bg-white/[0.06] text-neutral-300 hover:text-white transition-all text-xs group"
                >
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                    <MessageCircle className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-left">
                    <span className="font-bold text-white text-xs block">LINE Official</span>
                    <span className="text-[10px] text-neutral-400 block font-light">
                      ติดต่อฝ่ายบริการลูกค้า 24 ชม.
                    </span>
                  </div>
                </a>
              </div>
            )}
          </div>

          {/* Col 2: Navigation Links (เมนูหลัก) */}
          <div
            className={`space-y-3 ${
              hasDiscordWidget || hasDiscordInvite ? "lg:col-span-2" : ""
            }`}
          >
            <div className="font-bold text-white uppercase tracking-wider text-xs flex items-center gap-2">
              <span>เมนูหลัก</span>
            </div>
            <ul className="space-y-2.5 text-xs font-normal">
              <li>
                <Link
                  href="/"
                  className="text-neutral-400 hover:text-white transition-colors block py-0.5"
                >
                  หน้าแรก
                </Link>
              </li>
              <li>
                <Link
                  href="/categories"
                  className="text-neutral-400 hover:text-white transition-colors block py-0.5"
                >
                  หมวดหมู่สินค้า
                </Link>
              </li>
              <li>
                <Link
                  href="/topup"
                  className="text-neutral-400 hover:text-white transition-colors block py-0.5"
                >
                  เติมเงิน (สลิป / วอเล็ท)
                </Link>
              </li>
              <li>
                <Link
                  href="/orders"
                  className="text-neutral-400 hover:text-white transition-colors block py-0.5"
                >
                  คลังสินค้าของฉัน
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Support & Services (ช่วยเหลือ & บริการ) */}
          <div
            className={`space-y-3 ${
              hasDiscordWidget || hasDiscordInvite ? "lg:col-span-3" : ""
            }`}
          >
            <div className="font-bold text-white uppercase tracking-wider text-xs flex items-center gap-2">
              <span>ช่วยเหลือ & บริการ</span>
            </div>
            <ul className="space-y-2.5 text-xs font-normal">
              <li>
                <Link
                  href="/reviews"
                  className="text-neutral-400 hover:text-white transition-colors flex items-center gap-2 py-0.5 group"
                >
                  <Star className="w-3.5 h-3.5 text-neutral-400 group-hover:text-rose-400 transition-colors shrink-0" />
                  <span>รีวิวจากลูกค้า (5 ดาว)</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/news"
                  className="text-neutral-400 hover:text-white transition-colors flex items-center gap-2 py-0.5 group"
                >
                  <Megaphone className="w-3.5 h-3.5 text-neutral-400 group-hover:text-rose-400 transition-colors shrink-0" />
                  <span>โปรโมชั่นและข่าวสาร</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/docs"
                  className="text-neutral-400 hover:text-white transition-colors flex items-center gap-2 py-0.5 group"
                >
                  <BookOpen className="w-3.5 h-3.5 text-neutral-400 group-hover:text-rose-400 transition-colors shrink-0" />
                  <span>คู่มือการใช้งาน (Guide)</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/support"
                  className="text-neutral-400 hover:text-white transition-colors flex items-center gap-2 py-0.5 group"
                >
                  <LifeBuoy className="w-3.5 h-3.5 text-neutral-400 group-hover:text-rose-400 transition-colors shrink-0" />
                  <span>ศูนย์ช่วยเหลือ & เคลม</span>
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={openCookieSettings}
                  className="text-neutral-400 hover:text-white transition-colors flex items-center gap-2 py-0.5 group cursor-pointer text-left"
                >
                  <Cookie className="w-3.5 h-3.5 text-neutral-400 group-hover:text-rose-400 transition-colors shrink-0" />
                  <span>ตั้งค่าความเป็นส่วนตัวคุกกี้</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4 (ล่างขวา): Discord Widget UI / Community Box */}
          {(hasDiscordWidget || hasDiscordInvite) && (
            <div className="lg:col-span-3 space-y-3">
              <div className="font-bold text-white uppercase tracking-wider text-xs flex items-center justify-between">
                <span>ชุมชนดิสคอร์ด</span>
                {setting?.contactDiscord && (
                  <a
                    href={setting.contactDiscord}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-rose-500 hover:text-rose-400 flex items-center gap-1 font-semibold"
                  >
                    <span>เข้าร่วม</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              {hasDiscordWidget ? (
                /* Official Discord Server Widget Iframe */
                <div className="w-full rounded-2xl overflow-hidden border border-white/[0.08] bg-[#0c0d12] shadow-lg">
                  <iframe
                    src={`https://discord.com/widget?id=${setting?.discordServerId}&theme=dark`}
                    width="100%"
                    height="240"
                    allowTransparency={true}
                    frameBorder="0"
                    sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
                    title="Discord Server Widget"
                    className="w-full"
                  />
                </div>
              ) : (
                /* Fallback sleek Discord Invite Community Card if only Invite link is set */
                <div className="p-4 rounded-2xl border border-white/[0.08] bg-white/[0.02] space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#5865F2]/10 border border-[#5865F2]/20 flex items-center justify-center text-[#5865F2] shrink-0 font-bold">
                      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-white text-xs truncate">Discord Community</div>
                      <div className="text-[11px] text-emerald-400 flex items-center gap-1.5 mt-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span>ชุมชนออนไลน์ 24 ชม.</span>
                      </div>
                    </div>
                  </div>
                  <a
                    href={setting.contactDiscord}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2 rounded-xl bg-[#5865F2] hover:bg-[#4752c4] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95"
                  >
                    <span>เข้าร่วมเซิร์ฟเวอร์</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom copyright row */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-400">
          <div>
            © {new Date().getFullYear()} {setting?.shopName || "JIPAN STORE"}. All rights reserved.
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-neutral-400">
            <span>สร้างด้วยความใส่ใจและปลอดภัย</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
          </div>
        </div>
      </div>
    </footer>
  );
}
