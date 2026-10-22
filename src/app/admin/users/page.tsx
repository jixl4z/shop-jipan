"use client";

import React, { useEffect, useState } from "react";
import {
  Users,
  Loader2,
  Search,
  Shield,
  User,
  KeyRound,
  Dices,
  Copy,
  Trash2,
  CheckCircle2,
  X,
  Sliders,
} from "lucide-react";

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

  // Edit Balance/Role Modal
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);
  const [adjustAmount, setAdjustAmount] = useState("");
  const [adjustRole, setAdjustRole] = useState("USER");
  const [modalNewPassword, setModalNewPassword] = useState("");

  // Reset Password Quick Modal
  const [passwordUser, setPasswordUser] = useState<UserItem | null>(null);
  const [resetPasswordVal, setResetPasswordVal] = useState("");
  const [copied, setCopied] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [successToast, setSuccessToast] = useState("");

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

  const showNotification = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(""), 4000);
  };

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

      if (modalNewPassword.trim() !== "") {
        payload.newPassword = modalNewPassword.trim();
      }

      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const resData = await res.json();

      if (res.ok) {
        setSelectedUser(null);
        setAdjustAmount("");
        setModalNewPassword("");
        showNotification("อัปเดตข้อมูลผู้ใช้ " + selectedUser.username + " เรียบร้อยแล้ว");
        await loadData();
      } else {
        alert(resData.error || "อัปเดตไม่สำเร็จ");
      }
    } catch {
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordUser) return;

    if (!resetPasswordVal || resetPasswordVal.trim().length < 6) {
      alert("รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 6 ตัวอักษร");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: passwordUser.id,
          newPassword: resetPasswordVal.trim(),
        }),
      });

      const resData = await res.json();

      if (res.ok) {
        showNotification(
          `รีเซ็ตรหัสผ่านของ ${passwordUser.username} เป็น "${resetPasswordVal.trim()}" สำเร็จ!`
        );
        setPasswordUser(null);
        setResetPasswordVal("");
        await loadData();
      } else {
        alert(resData.error || "รีเซ็ตรหัสผ่านไม่สำเร็จ");
      }
    } catch {
      alert("เกิดข้อผิดพลาด");
    } finally {
      setSubmitting(false);
    }
  };

  const generateRandomPassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let rand = "";
    for (let i = 0; i < 5; i++) {
      rand += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const newPwd = `Jp@${rand}${Math.floor(100 + Math.random() * 900)}`;
    setResetPasswordVal(newPwd);
  };

  const handleCopyPassword = () => {
    if (!resetPasswordVal) return;
    navigator.clipboard.writeText(resetPasswordVal);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDeleteUser = async (u: UserItem) => {
    if (u.role === "ADMIN") {
      alert("ไม่สามารถลบบัญชีผู้ดูแลระบบ (ADMIN) ได้");
      return;
    }
    if (!confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบบัญชี "${u.username}" ?\nข้อมูลทั้งหมดของผู้ใช้นี้จะถูกลบถาวร`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/users?id=${u.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok) {
        showNotification(`ลบบัญชี ${u.username} สำเร็จ`);
        await loadData();
      } else {
        alert(data.error || "ลบไม่สำเร็จ");
      }
    } catch {
      alert("เกิดข้อผิดพลาดในการลบบัญชี");
    }
  };

  const filtered = users.filter((u) =>
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    (u.email && u.email.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-neutral-400" />
            <span>จัดการสมาชิก & รีเซ็ตรหัสผ่าน (Users Management)</span>
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            ดูรายชื่อสมาชิก ปรับยอดเงินคงเหลือ รีเซ็ตรหัสผ่านใหม่ และกำหนดสิทธิ์แอดมิน
          </p>
        </div>
      </div>

      {successToast && (
        <div className="p-3.5 rounded-2xl bg-emerald-950/90 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2 shadow-lg animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-medium">{successToast}</span>
        </div>
      )}

      <div className="relative max-w-sm">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ค้นหาตามชื่อผู้ใช้ หรืออีเมล..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-500 text-xs focus:outline-none focus:border-neutral-500"
        />
      </div>

      <div className="rounded-2xl bg-neutral-900 border border-neutral-800 overflow-hidden shadow-xl">
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
                  ไม่พบรายชื่อสมาชิก
                </td>
              </tr>
            ) : (
              filtered.map((u) => (
                <tr key={u.id} className="hover:bg-neutral-850/40 transition-colors">
                  <td className="p-3.5 font-medium text-white">
                    <div className="font-semibold text-sm">{u.username}</div>
                    {u.email && (
                      <div className="text-[11px] text-neutral-500 font-mono mt-0.5">{u.email}</div>
                    )}
                  </td>
                  <td className="p-3.5">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        u.role === "ADMIN"
                          ? "bg-amber-400/10 text-amber-400 border border-amber-400/30"
                          : "bg-neutral-800 text-neutral-300 border border-neutral-700"
                      }`}
                    >
                      {u.role === "ADMIN" ? (
                        <>
                          <Shield className="w-3 h-3 text-amber-400" />
                          <span>ADMIN</span>
                        </>
                      ) : (
                        <>
                          <User className="w-3 h-3 text-neutral-400" />
                          <span>USER</span>
                        </>
                      )}
                    </span>
                  </td>
                  <td className="p-3.5 font-mono font-bold text-emerald-400 text-sm">
                    ฿{u.balance.toFixed(2)}
                  </td>
                  <td className="p-3.5 font-mono text-neutral-300">
                    {u._count?.orders || 0} รายการ
                  </td>
                  <td className="p-3.5 text-neutral-400 font-mono text-[11px]">
                    {new Date(u.createdAt).toLocaleDateString("th-TH")}
                  </td>
                  <td className="p-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Adjust Balance / Role */}
                      <button
                        onClick={() => {
                          setSelectedUser(u);
                          setAdjustRole(u.role);
                          setAdjustAmount("");
                          setModalNewPassword("");
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium transition-colors cursor-pointer flex items-center gap-1"
                        title="ปรับยอดเงินและสิทธิ์"
                      >
                        <Sliders className="w-3 h-3 text-neutral-400" />
                        <span>ปรับยอด / สิทธิ์</span>
                      </button>

                      {/* Quick Reset Password Button */}
                      <button
                        onClick={() => {
                          setPasswordUser(u);
                          setResetPasswordVal("");
                          setCopied(false);
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-medium transition-colors cursor-pointer flex items-center gap-1"
                        title="รีเซ็ตรหัสผ่านให้สมาชิก"
                      >
                        <KeyRound className="w-3 h-3 text-amber-400" />
                        <span>รีเซ็ตรหัส</span>
                      </button>

                      {/* Delete User */}
                      {u.role !== "ADMIN" && (
                        <button
                          onClick={() => handleDeleteUser(u)}
                          className="p-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 border border-rose-500/30 text-rose-400 transition-colors cursor-pointer"
                          title="ลบบัญชีนี้"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Quick Reset Password Modal */}
      {passwordUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setPasswordUser(null)}
          />
          <div className="relative w-full max-w-md rounded-3xl bg-neutral-900 border border-neutral-800 p-6 shadow-2xl z-10 text-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <KeyRound className="w-4 h-4 text-amber-400" />
                <span>รีเซ็ตรหัสผ่านสมาชิก</span>
              </div>
              <button
                onClick={() => setPasswordUser(null)}
                className="w-7 h-7 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800/80 space-y-1">
              <div className="text-neutral-400">บัญชีผู้ใช้:</div>
              <div className="text-white font-bold text-sm">{passwordUser.username}</div>
              {passwordUser.email && (
                <div className="text-neutral-500 font-mono text-[11px]">{passwordUser.email}</div>
              )}
            </div>

            <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-neutral-300 font-medium">รหัสผ่านใหม่ *</label>
                  <button
                    type="button"
                    onClick={generateRandomPassword}
                    className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer font-semibold"
                  >
                    <Dices className="w-3 h-3" />
                    <span>สุ่มรหัสผ่าน</span>
                  </button>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={resetPasswordVal}
                    onChange={(e) => setResetPasswordVal(e.target.value)}
                    placeholder="กรอกรหัสผ่านใหม่ (อย่างน้อย 6 ตัว)..."
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono text-xs focus:outline-none focus:border-amber-400"
                  />
                  {resetPasswordVal && (
                    <button
                      type="button"
                      onClick={handleCopyPassword}
                      className="px-3 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold flex items-center gap-1 cursor-pointer shrink-0"
                      title="คัดลอกรหัสผ่าน"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copied ? "คัดลอกแล้ว!" : "คัดลอก"}</span>
                    </button>
                  )}
                </div>
                <p className="text-[10px] text-neutral-500 mt-1">
                  💡 เมื่อกดบันทึก รหัสผ่านจะถูกอัปเดตทันที ลูกค้าสามารถนำรหัสนี้ไปเข้าสู่ระบบได้เลย
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPasswordUser(null)}
                  className="flex-1 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-semibold cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={submitting || !resetPasswordVal.trim()}
                  className="flex-1 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-500/20 disabled:opacity-50"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>ยืนยันเปลี่ยนรหัส</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Balance & Role Modal */}
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

              <div>
                <label className="block text-neutral-300 font-medium mb-1">
                  ตั้งรหัสผ่านใหม่ (ไม่บังคับ - เว้นว่างไว้ถ้าไม่ต้องการเปลี่ยน):
                </label>
                <input
                  type="text"
                  value={modalNewPassword}
                  onChange={(e) => setModalNewPassword(e.target.value)}
                  placeholder="กรอกรหัสผ่านใหม่..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono focus:outline-none focus:border-neutral-500 text-xs"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  className="flex-1 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-semibold cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl bg-white hover:bg-neutral-200 text-black font-bold cursor-pointer"
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
