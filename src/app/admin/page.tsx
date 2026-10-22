"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  DollarSign,
  ShoppingBag,
  CreditCard,
  Users,
  AlertTriangle,
  ArrowRight,
  Loader2,
  TrendingUp,
} from "lucide-react";

interface DashboardData {
  stats: {
    totalSales: number;
    totalOrders: number;
    totalTopups: number;
    totalUsers: number;
  };
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    productName: string;
    totalAmount: number;
    createdAt: string;
    user: { username: string };
  }>;
  lowStock: Array<{
    id: string;
    name: string;
    price: number;
    image: string;
    stockCount: number;
  }>;
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then((res) => res.json())
      .then((resData) => {
        if (!resData.error) {
          setData(resData);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3 text-neutral-400 text-xs">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
        <span>กำลังโหลดข้อมูลสถิติ...</span>
      </div>
    );
  }

  const stats = data?.stats || {
    totalSales: 0,
    totalOrders: 0,
    totalTopups: 0,
    totalUsers: 0,
  };

  const statCards = [
    {
      label: "ยอดขายรวมทั้งหมด",
      value: `฿${stats.totalSales.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10 border-emerald-500/20",
    },
    {
      label: "คำสั่งซื้อที่สำเร็จ",
      value: stats.totalOrders.toLocaleString(),
      icon: ShoppingBag,
      color: "text-blue-400",
      bg: "bg-blue-500/10 border-blue-500/20",
    },
    {
      label: "ยอดเติมเงินผ่านสลิป",
      value: `฿${stats.totalTopups.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
      icon: CreditCard,
      color: "text-violet-400",
      bg: "bg-violet-500/10 border-violet-500/20",
    },
    {
      label: "สมาชิกในระบบทั้งหมด",
      value: stats.totalUsers.toLocaleString(),
      icon: Users,
      color: "text-amber-400",
      bg: "bg-amber-500/10 border-amber-500/20",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          ภาพรวมร้านค้า (Dashboard Overview)
        </h1>
        <p className="text-xs text-neutral-400 mt-1">
          สรุปรายงานยอดขาย การสั่งซื้อ และสถานะสต็อกของร้านค้าแบบเรียลไทม์
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((c, i) => {
          const Icon = c.icon;
          return (
            <div
              key={i}
              className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-neutral-400">{c.label}</span>
                <div className={`p-2 rounded-xl border ${c.bg}`}>
                  <Icon className={`w-4 h-4 ${c.color}`} />
                </div>
              </div>
              <div className="text-2xl font-bold font-mono text-white">{c.value}</div>
            </div>
          );
        })}
      </div>

      {/* Low Stock Warning Box */}
      {data?.lowStock && data.lowStock.length > 0 && (
        <div className="p-5 rounded-2xl bg-amber-950/30 border border-amber-500/30 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span>แจ้งเตือน: สินค้าใกล้หมดสต็อก ({data.lowStock.length} รายการ)</span>
            </div>
            <Link
              href="/admin/products"
              className="text-xs font-semibold text-amber-300 hover:text-amber-200 flex items-center gap-1"
            >
              <span>ไปเติมสต็อก</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            {data.lowStock.map((prod) => (
              <div
                key={prod.id}
                className="flex items-center gap-3 p-3 rounded-xl bg-neutral-950/80 border border-amber-500/20 text-xs"
              >
                <img
                  src={prod.image}
                  alt={prod.name}
                  className="w-10 h-10 rounded-lg object-cover border border-neutral-800 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-white truncate">{prod.name}</div>
                  <div className="text-amber-400 font-mono text-[11px] mt-0.5">
                    คงเหลือ: {prod.stockCount} ชิ้น
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Orders Table */}
      <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-sm text-white">คำสั่งซื้อล่าสุด (Recent Orders)</h2>
          <Link
            href="/admin/orders"
            className="text-xs font-semibold text-neutral-400 hover:text-white flex items-center gap-1"
          >
            <span>ดูทั้งหมด</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-800 text-neutral-400">
                <th className="pb-3 font-semibold">เลขออเดอร์</th>
                <th className="pb-3 font-semibold">ผู้สั่งซื้อ</th>
                <th className="pb-3 font-semibold">สินค้า</th>
                <th className="pb-3 font-semibold">ยอดรวม</th>
                <th className="pb-3 font-semibold">วัน-เวลา</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60">
              {data?.recentOrders && data.recentOrders.length > 0 ? (
                data.recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-neutral-850/50">
                    <td className="py-3 font-mono text-neutral-300">{order.orderNumber}</td>
                    <td className="py-3 font-medium text-white">{order.user.username}</td>
                    <td className="py-3 text-neutral-300 max-w-xs truncate">
                      {order.productName}
                    </td>
                    <td className="py-3 font-mono font-bold text-emerald-400">
                      ฿{order.totalAmount.toFixed(2)}
                    </td>
                    <td className="py-3 text-neutral-400 font-mono text-[11px]">
                      {new Date(order.createdAt).toLocaleString("th-TH", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-neutral-500">
                    ยังไม่มีรายการสั่งซื้อ
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
