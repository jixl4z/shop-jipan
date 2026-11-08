"use client";

import React, { useState, useEffect } from "react";
import { PackageCheck, X, Check } from "lucide-react";

import { useStore } from "@/context/StoreContext";

interface RecentOrder {
  id: string;
  productName: string;
  price: number;
  username: string;
  timeAgo: string;
  image?: string;
}

const DEFAULT_ITEMS: RecentOrder[] = [
  {
    id: "def-1",
    productName: "Capcut Pro (เมลส่วนตัว 1 เดือน)",
    price: 49,
    username: "Kiw***",
    timeAgo: "2 นาทีที่แล้ว",
  },
  {
    id: "def-2",
    productName: "JIPAN Mail (เมลพร้อมใช้รับโค้ด)",
    price: 15,
    username: "Nop***",
    timeAgo: "5 นาทีที่แล้ว",
  },
  {
    id: "def-3",
    productName: "Capcut Pro (เมลส่วนตัว 1 ปี)",
    price: 199,
    username: "Aom***",
    timeAgo: "12 นาทีที่แล้ว",
  },
  {
    id: "def-4",
    productName: "JIPAN Mail (เมลพรีเมียม 10 กล่อง)",
    price: 120,
    username: "Ton***",
    timeAgo: "18 นาทีที่แล้ว",
  },
];

export default function RecentSalesToast() {
  const { themeMode } = useStore();
  const isLight = themeMode === "light";

  const [orders, setOrders] = useState<RecentOrder[]>(DEFAULT_ITEMS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // Fetch real recent orders
  useEffect(() => {
    fetch("/api/recent-orders")
      .then((res) => res.json())
      .then((data: any) => {
        if (data?.orders && Array.isArray(data.orders) && data.orders.length > 0) {
          setOrders(data.orders);
        }
      })
      .catch(() => {});
  }, []);

  // Interval loop: Show for 5.5s, hide for 7s, next item
  useEffect(() => {
    if (isDismissed || orders.length === 0) return;

    // First appearance after 4 seconds
    const initialTimer = setTimeout(() => {
      setIsVisible(true);
    }, 4000);

    const cycleInterval = setInterval(() => {
      // Hide current
      setIsVisible(false);

      // After fade out, switch index and show again
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % orders.length);
        setIsVisible(true);
      }, 7000);
    }, 13000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(cycleInterval);
    };
  }, [isDismissed, orders.length]);

  if (isDismissed || orders.length === 0) return null;

  const current = orders[currentIndex] || orders[0];

  return (
    <aside
      aria-live="polite"
      className={`fixed bottom-4 left-4 sm:bottom-6 sm:left-6 z-40 max-w-[340px] sm:max-w-[360px] transition-all duration-500 transform ${
        isVisible
          ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
          : "opacity-0 translate-y-6 scale-95 pointer-events-none"
      }`}
    >
      <div
        className={`rounded-2xl border p-3 sm:p-3.5 backdrop-blur-2xl flex items-center gap-3 relative group transition-colors shadow-2xl ${
          isLight
            ? "border-slate-200 bg-white/95 text-slate-900 shadow-slate-300/40 hover:border-slate-300"
            : "border-white/[0.1] bg-[#0c0d12]/95 text-white shadow-black/90 hover:border-white/20"
        }`}
      >
        {/* Product Thumbnail / Icon */}
        <div
          className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl border flex items-center justify-center shrink-0 overflow-hidden shadow-sm ${
            isLight
              ? "bg-slate-100 border-slate-200 text-slate-700"
              : "bg-gradient-to-tr from-white/[0.08] to-white/[0.03] border-white/10 text-white"
          }`}
        >
          <PackageCheck className="w-5 h-5 sm:w-6 sm:h-6 text-current" />
        </div>

        {/* Content Info */}
        <div className="flex-1 min-w-0 pr-1">
          <div
            className={`flex items-center gap-1.5 text-[11px] font-medium ${
              isLight ? "text-slate-600" : "text-neutral-300"
            }`}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="truncate">คุณ {current.username} เพิ่งสั่งซื้อ</span>
          </div>

          <div
            className={`text-xs font-bold truncate mt-0.5 ${
              isLight ? "text-slate-900" : "text-white"
            }`}
          >
            {current.productName}
          </div>

          <div
            className={`text-[10px] flex items-center gap-1.5 mt-0.5 ${
              isLight ? "text-slate-400" : "text-neutral-400"
            }`}
          >
            <span>{current.timeAgo}</span>
            <span className={isLight ? "text-slate-300" : "text-neutral-600"}>•</span>
            <span className="text-emerald-500 font-medium inline-flex items-center gap-0.5">
              <Check className="w-3 h-3" />
              <span>จัดส่งสำเร็จ</span>
            </span>
          </div>
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={() => setIsDismissed(true)}
          className={`p-1 rounded-lg transition-colors cursor-pointer self-start -mr-1 -mt-1 shrink-0 ${
            isLight
              ? "text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              : "text-neutral-500 hover:text-white hover:bg-white/10"
          }`}
          title="ปิดการแจ้งเตือน"
          aria-label="ปิดการแจ้งเตือน"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </aside>
  );
}
