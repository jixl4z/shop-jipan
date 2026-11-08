"use client";

import React, { useEffect, useState } from "react";
import { User, Coins, PackageCheck, ShoppingBag } from "lucide-react";

interface StatsData {
  totalUsers: number;
  totalProducts: number;
  inStock: number;
  totalOrders: number;
  totalTopup: number;
}

export default function StatsCounter() {
  const [stats, setStats] = useState<StatsData>({
    totalUsers: 0,
    totalProducts: 0,
    inStock: 0,
    totalOrders: 0,
    totalTopup: 0,
  });

  useEffect(() => {
    fetch("/api/stats")
      .then((res) => res.json())
      .then((data) => {
        if (data.stats) {
          setStats(data.stats);
        }
      })
      .catch((err) => console.error("[Stats Error]:", err));
  }, []);

  const statItems = [
    {
      id: "users",
      label: "ผู้ใช้งาน",
      value: stats.totalUsers,
      unit: "คน",
      icon: User,
    },
    {
      id: "topup",
      label: "ยอดเติม",
      value: stats.totalTopup,
      unit: "บาท",
      icon: Coins,
    },
    {
      id: "stock",
      label: "สต็อก",
      value: stats.inStock,
      unit: "ชิ้น",
      icon: PackageCheck,
    },
    {
      id: "orders",
      label: "ยอดขาย",
      value: stats.totalOrders,
      unit: "ครั้ง",
      icon: ShoppingBag,
    },
  ];

  return (
    <div className="w-full">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {statItems.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className="relative overflow-hidden rounded-2xl glass-panel interactive-card p-4 sm:p-5 border border-black/10 dark:border-white/[0.08] hover:border-black/30 dark:hover:border-white/30 transition-all duration-300 group shadow-lg flex items-center justify-between min-h-[95px] sm:min-h-[105px] cursor-pointer"
            >
              {/* Content (Text & Number) */}
              <div className="space-y-1 min-w-0 pr-2">
                <span className="text-[11px] sm:text-xs font-semibold text-neutral-500 dark:text-neutral-400 block tracking-wide truncate">
                  {item.label}
                </span>
                <div className="flex items-baseline gap-1.5 pt-0.5">
                  <span className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white font-mono tracking-tight group-hover:text-neutral-700 dark:group-hover:text-neutral-100 transition-colors">
                    {item.value.toLocaleString()}
                  </span>
                  <span className="text-[11px] sm:text-xs text-neutral-500 dark:text-neutral-400 font-normal">
                    {item.unit}
                  </span>
                </div>
              </div>

              {/* Crisp Solid Icon Badge on the Right */}
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-neutral-100 dark:bg-white/[0.06] border border-black/[0.06] dark:border-white/10 text-neutral-700 dark:text-neutral-200 flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:bg-neutral-200 dark:group-hover:bg-white/10 group-hover:text-black dark:group-hover:text-white transition-all shadow-sm">
                <Icon className="w-5 h-5 sm:w-6 sm:h-6 stroke-[1.8]" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
