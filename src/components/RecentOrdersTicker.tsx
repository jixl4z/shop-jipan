"use client";

import React, { useEffect, useState, useMemo } from "react";
import { ShoppingBag } from "lucide-react";

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
        if (Array.isArray(data.orders)) {
          setOrders(data.orders);
        }
      })
      .catch(() => {});
  }, []);

  // Prepare a seamless continuous marquee loop
  const displayItems = useMemo(() => {
    if (orders.length === 0) return [];
    if (orders.length === 1) return Array(8).fill(orders[0]);
    if (orders.length < 4) return [...orders, ...orders, ...orders, ...orders];
    if (orders.length < 8) return [...orders, ...orders, ...orders];
    return [...orders, ...orders];
  }, [orders]);

  // Hide the ticker completely if there are 0 real orders in the database
  if (orders.length === 0) return null;

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 my-4">
      <div className="glass-panel rounded-2xl p-2.5 sm:p-3 flex flex-col sm:flex-row items-center gap-3 overflow-hidden shadow-lg border border-white/[0.08]">
        {/* Badge */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-white/10 border border-white/20 text-white text-xs font-semibold shrink-0 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>คำสั่งซื้อจริงล่าสุด</span>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/15 text-neutral-300">
            {orders.length}
          </span>
        </div>

        {/* Marquee Track */}
        <div className="flex-1 w-full overflow-hidden relative">
          <div className="animate-marquee flex items-center gap-3">
            {displayItems.map((item, idx) => (
              <div
                key={`${item.id}-${idx}`}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.06] shrink-0 text-xs shadow-sm hover:border-white/30 hover:bg-white/[0.07] transition-all"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-white/60" />
                <span className="font-semibold text-white max-w-[160px] truncate">
                  {item.productName}
                </span>
                <span className="font-mono font-bold text-white">
                  ฿{item.price.toFixed(2)}
                </span>
                <span className="text-[10px] text-neutral-400 font-mono">
                  {item.timeAgo} • {item.username}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
