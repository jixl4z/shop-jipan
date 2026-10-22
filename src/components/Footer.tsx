"use client";

import React from "react";
import Link from "next/link";
import { useStore } from "@/context/StoreContext";
import { MessageSquare, ShieldCheck, Heart } from "lucide-react";

export default function Footer() {
  const { setting, openTopup } = useStore();

  return (
    <footer className="w-full bg-neutral-950 border-t border-neutral-800/80 pt-12 pb-8 text-neutral-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-neutral-900">
          {/* Col 1: Brand Info */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-neutral-800 border border-neutral-700 flex items-center justify-center font-bold text-white text-base">
                ⚡
              </div>
              <span className="font-bold text-white text-base">
                {setting?.shopName || "JIPAN STORE"}
              </span>
            </div>
            <p className="text-xs text-neutral-400 max-w-md font-light leading-relaxed">
              {setting?.shopSlogan ||
                "ระบบจำหน่ายสินค้าดิจิทัล ไอดีเกม บัตรเติมเงิน และแอปพรีเมียมระบบอัตโนมัติ 24 ชั่วโมง สแกนจ่ายด้วยสลิปพร้อมเพย์ รับสินค้าได้ทันที"}
            </p>
            <div className="flex items-center gap-2 text-xs text-neutral-500">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>การันตีความปลอดภัย 100% เชื่อมต่อระบบตรวจสลิปมาตรฐาน</span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-2.5 text-xs">
            <div className="font-bold text-white uppercase tracking-wider text-[11px]">
              เมนูหลัก
            </div>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  หน้าแรก
                </Link>
              </li>
              <li>
                <Link href="/categories" className="hover:text-white transition-colors">
                  หมวดหมู่สินค้า
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-white transition-colors">
                  สินค้าทั้งหมด
                </Link>
              </li>
              <li>
                <Link href="/topup" className="hover:text-white transition-colors">
                  เติมเงิน (สลิป / วอเล็ท)
                </Link>
              </li>
              <li>
                <Link href="/orders" className="hover:text-white transition-colors">
                  คลังสินค้าของฉัน
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Support & Guide */}
          <div className="space-y-2.5 text-xs">
            <div className="font-bold text-white uppercase tracking-wider text-[11px]">
              ช่วยเหลือ & บริการ
            </div>
            <ul className="space-y-2">
              <li>
                <Link href="/reviews" className="hover:text-white transition-colors text-amber-400">
                  ★ รีวิวจากลูกค้า (5 ดาว)
                </Link>
              </li>
              <li>
                <Link href="/news" className="hover:text-white transition-colors text-cyan-400">
                  📢 โปรโมชั่นและข่าวสาร
                </Link>
              </li>
              <li>
                <Link href="/docs" className="hover:text-white transition-colors">
                  📖 คู่มือการใช้งาน (Guide)
                </Link>
              </li>
              <li>
                <Link href="/support" className="hover:text-white transition-colors text-emerald-400">
                  🛡️ ศูนย์ช่วยเหลือ & เคลม
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact & Community */}
          <div className="space-y-2.5 text-xs">
            <div className="font-bold text-white uppercase tracking-wider text-[11px]">
              ติดต่อสอบถาม
            </div>
            <div className="space-y-2">
              {setting?.contactLine && (
                <a
                  href={setting.contactLine}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-emerald-500/40 text-neutral-300 hover:text-white transition-all text-xs"
                >
                  <span className="text-emerald-400 font-bold">LINE</span>
                  <span>ติดต่อฝ่ายบริการลูกค้า</span>
                </a>
              )}
              {setting?.contactDiscord && (
                <a
                  href={setting.contactDiscord}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-indigo-500/40 text-neutral-300 hover:text-white transition-all text-xs"
                >
                  <span className="text-indigo-400 font-bold">Discord</span>
                  <span>เข้าร่วมคอมมูนิตี้</span>
                </a>
              )}
              {setting?.contactFacebook && (
                <a
                  href={setting.contactFacebook}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-blue-500/40 text-neutral-300 hover:text-white transition-all text-xs"
                >
                  <span className="text-blue-400 font-bold">Facebook</span>
                  <span>เพจทางการ</span>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-500">
          <div>
            © {new Date().getFullYear()} {setting?.shopName || "JIPAN STORE"}. All rights reserved.
          </div>
          <div className="flex items-center gap-1 text-[11px]">
            <span>สร้างด้วยความใส่ใจและปลอดภัย</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
          </div>
        </div>
      </div>
    </footer>
  );
}
