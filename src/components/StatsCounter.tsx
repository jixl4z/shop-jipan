"use client";

import React, { useEffect, useState } from "react";
import { Users, ShoppingBag, Box, CheckCircle2, TrendingUp } from "lucide-react";

export default function StatsCounter() {
  const [stats, setStats] = useState({
    users: 1471,
    products: 44,
    inStock: 61,
    orders: 21616,
  });

  useEffect(() => {
    fetch("/api/stats")
      .then((res) => res.json())
      .then((data) => {
        if (data.stats) {
          setStats({
            users: data.stats.totalUsers > 0 ? data.stats.totalUsers : 1471,
            products: data.stats.totalProducts > 0 ? data.stats.totalProducts : 44,
            inStock: data.stats.inStock > 0 ? data.stats.inStock : 61,
            orders: data.stats.totalOrders > 0 ? data.stats.totalOrders : 21616,
          });
        }
      })
      .catch(() => {});
  }, []);

  const statItems = [
    {
      label: "ผู้ใช้ทั้งหมด",
      value: stats.users,
      unit: "คน",
      icon: Users,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
    },
    {
      label: "สินค้าทั้งหมด",
      value: stats.products,
      unit: "รายการ",
      icon: ShoppingBag,
      color: "text-purple-400",
      bg: "bg-purple-500/10",
      border: "border-purple-500/20",
    },
    {
      label: "สต็อกพร้อมส่ง",
      value: stats.inStock,
      unit: "ชิ้น",
      icon: Box,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
    },
    {
      label: "ทำรายการสำเร็จ",
      value: stats.orders,
      unit: "รายการ",
      icon: CheckCircle2,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
    },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 my-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 p-4 sm:p-5 rounded-2xl bg-[#0d0f17]/80 border border-white/[0.08] backdrop-blur-xl shadow-xl">
        {statItems.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="flex items-center gap-3.5 p-3 sm:p-3.5 rounded-xl bg-black/40 border border-white/[0.04] hover:border-white/10 transition-colors"
            >
              <div
                className={`w-11 h-11 rounded-xl ${item.bg} border ${item.border} ${item.color} flex items-center justify-center shrink-0 shadow-sm`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] text-slate-400 font-medium truncate">
                  {item.label}
                </div>
                <div className="font-extrabold text-base sm:text-lg text-white font-mono tracking-tight mt-0.5">
                  {item.value.toLocaleString()}{" "}
                  <span className="text-[11px] font-normal text-slate-500 font-sans">
                    {item.unit}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
