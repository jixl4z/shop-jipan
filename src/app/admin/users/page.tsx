"use client";

import React, { useEffect, useState } from "react";
import { Users, Loader2, Search, PlusCircle, Shield, User } from "lucide-react";

interface UserItem {
  id: string;
  username: string;
  email?: string;
  role: string;
  balance: number;
  createdAt: string;
  _count: { orders: number; topups: number };
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);
  const [adjustAmount, setAdjustAmount] = useState("");
  const [adjustRole, setAdjustRole] = useState("USER");
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (data.users) setUsers(data.users);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    setSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        id: selectedUser.id,
        role: adjustRole,
      };

      if (adjustAmount.trim() !== "") {
        payload.balanceDelta = parseFloat(adjustAmount);
      }

      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSelectedUser(null);
        setAdjustAmount("");
        await loadData();
      } else {
        alert("อัปเดตไม่สำเร็จ");
      }
    } catch {
      alert("เกิดข้อผิดพลาด");
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = users.filter((u) =>
    u.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            จัดการสมาชิก (Users Management)
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            ดูรายชื่อสมาชิก ปรับยอดเงินคงเหลือในกระเป๋า และกำหนดสิทธิ์แอดมิน
          </p>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ค้นหาชื่อผู้ใช้..."
          className="w-full pl-10 pr-4 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-xs placeholder-neutral-500 focus:outline-none focus:border-neutral-600"
        />
      </div>

      <div className="rounded-2xl bg-neutral-900 border border-neutral-800 overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-neutral-800 bg-neutral-950/60 text-neutral-400">
              <th className="p-3.5 font-semibold">ชื่อผู้ใช้</th>
              <th className="p-3.5 font-semibold">สิทธิ์</th>
              <th className="p-3.5 font-semibold">ยอดเงินคงเหลือ</th>
              <th className="p-3.5 font-semibold">คำสั่งซื้อ</th>
              <th className="p-3.5 font-semibold">วันที่สมัคร</th>
              <th className="p-3.5 font-semibold text-right">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800/60">
            {loading ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-neutral-400">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-white" />
                  <span>กำลังโหลดข้อมูลสมาชิก...</span>
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-neutral-500">
                  ไม่พบสมาชิก
                </td>
              </tr>
            ) : (
              filtered.map((u) => (
                <tr key={u.id} className="hover:bg-neutral-850/40">
                  <td className="p-3.5">
                    <div className="font-semibold text-white">{u.username}</div>
                    {u.email && (
                      <div className="text-[11px] text-neutral-500">{u.email}</div>
                    )}
                  </td>
                  <td className="p-3.5">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        u.role === "ADMIN"
                          ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          : "bg-neutral-800 text-neutral-400"
                      }`}
                    >
                      {u.role === "ADMIN" ? (
                        <>
                          <Shield className="w-3 h-3" />
                          <span>ADMIN</span>
                        </>
                      ) : (
                        <>
                          <User className="w-3 h-3" />
                          <span>USER</span>
                        </>
                      )}
                    </span>
                  </td>
                  <td className="p-3.5 font-mono font-bold text-emerald-400">
                    ฿{u.balance.toFixed(2)}
                  </td>
                  <td className="p-3.5 font-mono text-neutral-300">
                    {u._count?.orders || 0} รายการ
                  </td>
                  <td className="p-3.5 text-neutral-400 font-mono text-[11px]">
                    {new Date(u.createdAt).toLocaleDateString("th-TH")}
                  </td>
                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => {
                        setSelectedUser(u);
                        setAdjustRole(u.role);
                        setAdjustAmount("");
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium transition-colors cursor-pointer"
                    >
                      ปรับยอด / สิทธิ์
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Edit User Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setSelectedUser(null)}
          />
          <div className="relative w-full max-w-md rounded-3xl bg-neutral-900 border border-neutral-800 p-6 shadow-2xl z-10 text-xs">
            <h2 className="text-base font-bold text-white mb-1">
              ปรับข้อมูลสมาชิก: {selectedUser.username}
            </h2>
            <p className="text-neutral-400 mb-4">
              ยอดเงินปัจจุบัน:{" "}
              <span className="text-emerald-400 font-mono font-bold">
                ฿{selectedUser.balance.toFixed(2)}
              </span>
            </p>

            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div>
                <label className="block text-neutral-300 font-medium mb-1">
                  ปรับเพิ่ม/ลด ยอดเงิน (ใส่ค่าบวกเพื่อเพิ่ม เช่น 100, หรือใส่ค่าลบเพื่อหัก เช่น -50):
                </label>
                <input
                  type="number"
                  step="any"
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono focus:outline-none focus:border-neutral-500"
                />
              </div>

              <div>
                <label className="block text-neutral-300 font-medium mb-1">
                  กำหนดระดับสิทธิ์:
                </label>
                <select
                  value={adjustRole}
                  onChange={(e) => setAdjustRole(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-neutral-500"
                >
                  <option value="USER">USER (สมาชิกทั่วไป)</option>
                  <option value="ADMIN">ADMIN (ผู้ดูแลระบบ)</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  className="flex-1 py-2.5 rounded-xl bg-neutral-800 text-white font-semibold cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl bg-white text-black font-bold cursor-pointer"
                >
                  {submitting ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
