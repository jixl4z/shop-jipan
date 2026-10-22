"use client";

import React, { useEffect, useState } from "react";
import { CreditCard, Loader2, Search, CheckCircle2 } from "lucide-react";

interface TopupItem {
  id: string;
  transactionId: string;
  amount: number;
  transRef?: string;
  senderName?: string;
  bank?: string;
  status: string;
  createdAt: string;
  user: {
    username: string;
    email?: string;
  };
}

export default function AdminTopupsPage() {
  const [topups, setTopups] = useState<TopupItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/admin/topups")
      .then((res) => res.json())
      .then((data) => {
        if (data.topups) setTopups(data.topups);
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  const filtered = topups.filter(
    (t) =>
      t.transactionId.toLowerCase().includes(search.toLowerCase()) ||
      (t.transRef && t.transRef.toLowerCase().includes(search.toLowerCase())) ||
      t.user.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            ประวัติการเติมเงิน & สลิป (Topup Logs)
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            บันทึกรายการตรวจสอบสลิปจากลูกค้า รหัสอ้างอิง และสถานะการปรับยอดเงิน
          </p>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ค้นหาตามรหัสธุรกรรม, รหัสสลิป, ชื่อผู้ใช้..."
          className="w-full pl-10 pr-4 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-xs placeholder-neutral-500 focus:outline-none focus:border-neutral-600"
        />
      </div>

      <div className="rounded-2xl bg-neutral-900 border border-neutral-800 overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-neutral-800 bg-neutral-950/60 text-neutral-400">
              <th className="p-3.5 font-semibold">รหัสธุรกรรม</th>
              <th className="p-3.5 font-semibold">ผู้เติมเงิน</th>
              <th className="p-3.5 font-semibold">จำนวนเงิน</th>
              <th className="p-3.5 font-semibold">เลขอ้างอิงสลิป (transRef)</th>
              <th className="p-3.5 font-semibold">สถานะ</th>
              <th className="p-3.5 font-semibold">วัน-เวลา</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800/60">
            {loading ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-neutral-400">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-white" />
                  <span>กำลังโหลดข้อมูลการเติมเงิน...</span>
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-neutral-500">
                  ไม่พบรายการเติมเงิน
                </td>
              </tr>
            ) : (
              filtered.map((t) => (
                <tr key={t.id} className="hover:bg-neutral-850/40">
                  <td className="p-3.5 font-mono text-neutral-300 font-semibold">
                    {t.transactionId}
                  </td>
                  <td className="p-3.5 font-medium text-white">{t.user.username}</td>
                  <td className="p-3.5 font-mono font-bold text-emerald-400">
                    +฿{t.amount.toFixed(2)}
                  </td>
                  <td className="p-3.5 font-mono text-neutral-400">
                    {t.transRef || "-"}
                  </td>
                  <td className="p-3.5">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>สำเร็จ</span>
                    </span>
                  </td>
                  <td className="p-3.5 text-neutral-400 font-mono text-[11px]">
                    {new Date(t.createdAt).toLocaleString("th-TH", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
