"use client";

import React, { useEffect, useState } from "react";
import { Users, ShoppingBag, Box, CheckCircle2 } from "lucide-react";

export default function StatsCounter() {
  const [stats, setStats] = useState({
    users: 1,
    products: 8,
    inStock: 24,
    orders: 12,
  });

  useEffect(() => {
    fetch("/api/stats")
      .then((res) => res.json())
      .then((data) => {
        if (data.stats) {
          setStats({
            users: data.stats.totalUsers ?? 0,
            products: data.stats.totalProducts ?? 0,
            inStock: data.stats.inStock ?? 0,
            orders: data.stats.totalOrders ?? 0,
          });
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 p-4 sm:p-6 rounded-3xl bg-neutral-900/60 border border-neutral-800 backdrop-blur-xl shadow-2xl">
        {/* Total Users */}
        <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-neutral-950/60 border border-neutral-800/80">
          <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-neutral-400">สมาชิกในระบบ</div>
            <div className="font-extrabold text-lg sm:text-xl text-white font-mono tracking-tight">
              {stats.users.toLocaleString()}{" "}
              <span className="text-xs font-normal text-neutral-400">คน</span>
            </div>
          </div>
        </div>

        {/* Total Products */}
        <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-neutral-950/60 border border-neutral-800/80">
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-neutral-400">สินค้าในร้าน</div>
            <div className="font-extrabold text-lg sm:text-xl text-white font-mono tracking-tight">
              {stats.products.toLocaleString()}{" "}
              <span className="text-xs font-normal text-neutral-400">รายการ</span>
            </div>
          </div>
        </div>

        {/* In Stock */}
        <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-neutral-950/60 border border-neutral-800/80">
          <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
            <Box className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-neutral-400">สต็อกพร้อมส่งทันที</div>
            <div className="font-extrabold text-lg sm:text-xl text-white font-mono tracking-tight">
              {stats.inStock.toLocaleString()}{" "}
              <span className="text-xs font-normal text-neutral-400">ชิ้น</span>
            </div>
          </div>
        </div>

        {/* Completed Orders */}
        <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-neutral-950/60 border border-neutral-800/80">
          <div className="w-11 h-11 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-neutral-400">ส่งมอบสำเร็จแล้ว</div>
            <div className="font-extrabold text-lg sm:text-xl text-white font-mono tracking-tight">
              {stats.orders.toLocaleString()}{" "}
              <span className="text-xs font-normal text-neutral-400">ออเดอร์</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
