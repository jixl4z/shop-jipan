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
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 my-4">
      <div className="glass-panel rounded-2xl p-3 flex flex-col sm:flex-row items-center gap-3 overflow-hidden shadow-md border border-white/[0.08]">
        <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-white/10 border border-white/20 text-white text-xs font-semibold shrink-0">
          <ShoppingCart className="w-3.5 h-3.5" />
          <span>รายการซื้อล่าสุด</span>
        </div>

        <div className="flex-1 w-full overflow-hidden relative">
          <div className="animate-marquee flex items-center gap-3">
            {[...orders, ...orders].map((item, idx) => (
              <div
                key={`${item.id}-${idx}`}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.06] shrink-0 text-xs shadow-sm hover:border-white/20 transition-colors"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-white" />
                <span className="font-medium text-white max-w-[150px] truncate">
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
