"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useStore } from "@/context/StoreContext";
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingBag,
  CreditCard,
  Users,
  Settings,
  ArrowLeft,
  ShieldCheck,
  Loader2,
  Lock,
  Ticket,
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loadingUser, currentTheme } = useStore();
  const pathname = usePathname();
  const router = useRouter();

  if (loadingUser) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center gap-3 text-neutral-400 text-xs">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
        <span>กำลังตรวจสอบสิทธิ์ผู้ดูแลระบบ...</span>
      </div>
    );
  }

  if (!user || user.role !== "ADMIN") {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full p-8 rounded-3xl bg-neutral-900 border border-neutral-800 text-center space-y-4 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto text-2xl">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white">ไม่มีสิทธิ์เข้าถึงระบบหลังบ้าน</h2>
          <p className="text-xs text-neutral-400">
            หน้านี้สงวนไว้สำหรับผู้ดูแลระบบ (Admin) เท่านั้น กรุณาเข้าสู่ระบบด้วยบัญชีผู้ดูแลระบบที่มีสิทธิ์
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>กลับสู่หน้าร้านค้า</span>
          </Link>
        </div>
      </div>
    );
  }

  const navItems = [
    { href: "/admin", label: "ภาพรวมระบบ (Dashboard)", icon: LayoutDashboard },
    { href: "/admin/products", label: "จัดการสินค้า & สต็อก", icon: Package },
    { href: "/admin/coupons", label: "คูปองส่วนลด (Coupons)", icon: Ticket },
    { href: "/admin/categories", label: "หมวดหมู่สินค้า", icon: Layers },
    { href: "/admin/orders", label: "รายการสั่งซื้อทั้งหมด", icon: ShoppingBag },
    { href: "/admin/topups", label: "ประวัติสลิป & เติมเงิน", icon: CreditCard },
    { href: "/admin/users", label: "จัดการสมาชิก", icon: Users },
    { href: "/admin/settings", label: "ตั้งค่าร้านค้า & ระบบสลิป", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-neutral-900/90 border-b md:border-b-0 md:border-r border-neutral-800/80 p-4 flex flex-col shrink-0">
        <div>
          {/* Admin Header */}
          <div className="flex items-center gap-3 px-2 py-3 mb-3 border-b border-neutral-800">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold text-base">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm text-white flex items-center gap-1.5">
                <span>ระบบหลังบ้าน</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono">
                  ADMIN
                </span>
              </div>
              <div className="text-[11px] text-neutral-400 font-mono truncate max-w-[140px]">
                {user.username}
              </div>
            </div>
          </div>

          {/* Quick Return to Storefront (Under header, before menu) */}
          <div className="mb-4">
            <Link
              href="/"
              className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-medium bg-white/[0.04] border border-white/[0.08] hover:border-white/20 text-neutral-300 hover:text-white hover:bg-white/[0.08] transition-all group shadow-sm"
            >
              <ArrowLeft className="w-4 h-4 text-neutral-400 group-hover:text-white group-hover:-translate-x-0.5 transition-all" />
              <span className="font-semibold">กลับสู่หน้าร้านค้า (Storefront)</span>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-white text-black shadow-md font-bold"
                      : "text-neutral-400 hover:text-white hover:bg-neutral-800/60"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl">
        {children}
      </main>
    </div>
  );
}
