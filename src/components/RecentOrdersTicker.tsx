"use client";

import React, { useEffect, useState } from "react";
import { ShoppingCart } from "lucide-react";

interface OrderItem {
  id: string;
  productName: string;
  price: number;
  username: string;
  timeAgo: string;
}

export default function RecentOrdersTicker() {
  const [orders, setOrders] = useState<OrderItem[]>([]);

  useEffect(() => {
    fetch("/api/recent-orders")
      .then((res) => res.json())
      .then((data) => {
        if (data.orders) setOrders(data.orders);
      })
      .catch(() => {});
  }, []);

  if (orders.length === 0) return null;

  return (
    <div className="w-full bg-neutral-950 border-b border-neutral-800/80 py-3 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-2 flex items-center gap-2 text-xs font-semibold text-neutral-400">
        <ShoppingCart className="w-3.5 h-3.5 text-emerald-400" />
        <span>รายการสั่งซื้อล่าสุด (Live Orders)</span>
      </div>

      <div className="relative w-full overflow-hidden flex">
        {/* Repeating track for infinite smooth scroll */}
        <div className="animate-marquee flex items-center gap-3">
          {[...orders, ...orders].map((item, idx) => (
            <div
              key={`${item.id}-${idx}`}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-neutral-900/80 border border-neutral-800 shrink-0 text-xs shadow-sm hover:border-neutral-700 transition-colors"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="font-medium text-white max-w-[160px] truncate">
                {item.productName}
              </span>
              <span className="font-mono font-bold text-neutral-300">
                ฿{item.price.toFixed(2)}
              </span>
              <span className="text-[10px] text-neutral-500 font-mono">
                {item.timeAgo} | {item.username}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
