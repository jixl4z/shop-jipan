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
              className="relative overflow-hidden rounded-2xl sm:rounded-3xl glass-panel p-4 sm:p-5 border border-white/[0.08] hover:border-white/20 transition-all duration-300 group shadow-lg flex flex-col justify-between min-h-[95px] sm:min-h-[110px]"
            >
              {/* Content (Text & Number) */}
              <div className="relative z-10 space-y-1">
                <span className="text-[11px] sm:text-xs font-medium text-neutral-400 block tracking-wide">
                  {item.label}
                </span>
                <div className="flex items-baseline gap-1.5 pt-0.5">
                  <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-tight group-hover:text-neutral-100 transition-colors">
                    {item.value.toLocaleString()}
                  </span>
                  <span className="text-[11px] sm:text-xs text-neutral-400 font-normal">
                    {item.unit}
                  </span>
                </div>
              </div>

              {/* Giant Translucent Stroke Icon in Background (Overflowing Right & Bottom) */}
              <div className="absolute -right-3 -bottom-3 sm:-right-4 sm:-bottom-4 w-20 h-20 sm:w-28 sm:h-28 text-white/[0.07] group-hover:text-white/[0.14] group-hover:scale-105 transition-all duration-300 pointer-events-none flex items-center justify-center">
                <Icon className="w-full h-full stroke-[1.2]" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
