"use client";

import React, { useEffect, useState } from "react";
import { ShoppingBag, Loader2, Search, Copy, Check } from "lucide-react";

interface OrderItem {
  id: string;
  orderNumber: string;
  productName: string;
  price: number;
  quantity: number;
  totalAmount: number;
  deliveredData: string;
  status: string;
  createdAt: string;
  user: {
    username: string;
    email?: string;
  };
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/orders")
      .then((res) => res.json())
      .then((data) => {
        if (data.orders) setOrders(data.orders);
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filtered = orders.filter(
    (o) =>
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.productName.toLowerCase().includes(search.toLowerCase()) ||
      o.user.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            ประวัติการสั่งซื้อ (Orders Log)
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            ตรวจสอบประวัติการซื้อของลูกค้าทั้งหมดและข้อมูลคีย์ที่ระบบจัดส่งไป
          </p>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ค้นหาตามเลขออเดอร์, สินค้า, ชื่อผู้ใช้..."
          className="w-full pl-10 pr-4 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-xs placeholder-neutral-500 focus:outline-none focus:border-neutral-600"
        />
      </div>

      <div className="rounded-2xl bg-neutral-900 border border-neutral-800 overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-neutral-800 bg-neutral-950/60 text-neutral-400">
              <th className="p-3.5 font-semibold">เลขออเดอร์</th>
              <th className="p-3.5 font-semibold">ผู้สั่งซื้อ</th>
              <th className="p-3.5 font-semibold">สินค้า</th>
              <th className="p-3.5 font-semibold">ยอดรวม</th>
              <th className="p-3.5 font-semibold">ข้อมูลที่จัดส่ง</th>
              <th className="p-3.5 font-semibold">วัน-เวลา</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800/60">
            {loading ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-neutral-400">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-white" />
                  <span>กำลังโหลดรายการสั่งซื้อ...</span>
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-neutral-500">
                  ไม่พบรายการสั่งซื้อ
                </td>
              </tr>
            ) : (
              filtered.map((order) => {
                const isCopied = copiedId === order.id;
                return (
                  <tr key={order.id} className="hover:bg-neutral-850/40">
                    <td className="p-3.5 font-mono text-neutral-300 font-semibold">
                      {order.orderNumber}
                    </td>
                    <td className="p-3.5 font-medium text-white">
                      {order.user.username}
                    </td>
                    <td className="p-3.5 text-neutral-300 max-w-xs truncate">
                      {order.productName} ({order.quantity} ชิ้น)
                    </td>
                    <td className="p-3.5 font-mono font-bold text-emerald-400">
                      ฿{order.totalAmount.toFixed(2)}
                    </td>
                    <td className="p-3.5 max-w-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[11px] text-neutral-400 truncate max-w-[150px]">
                          {order.deliveredData}
                        </span>
                        <button
                          onClick={() => handleCopy(order.id, order.deliveredData)}
                          className="p-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 shrink-0 cursor-pointer"
                          title="คัดลอกรหัสที่ส่งให้ลูกค้า"
                        >
                          {isCopied ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="p-3.5 text-neutral-400 font-mono text-[11px]">
                      {new Date(order.createdAt).toLocaleString("th-TH", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
