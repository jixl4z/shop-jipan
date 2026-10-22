"use client";

import React, { useState } from "react";
import { useStore } from "@/context/StoreContext";
import {
  X,
  User,
  ShieldCheck,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Headphones,
  HelpCircle,
  PhoneCall,
  ExternalLink,
  ShoppingBag,
  Sparkles,
  CreditCard,
  PackageCheck,
  BookOpen,
} from "lucide-react";

// 1. Profile Modal (จัดการโปรไฟล์)
export function ProfileModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { user, addToast } = useStore();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen || !user) return null;

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      addToast("รหัสผ่านใหม่ทั้งสองช่องไม่ตรงกัน", "error");
      return;
    }
    if (newPassword.length < 6) {
      addToast("รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 6 ตัวอักษร", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        addToast("เปลี่ยนรหัสผ่านสำเร็จเรียบร้อยแล้ว", "success");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        onClose();
      } else {
        addToast(data.error || "เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน", "error");
      }
    } catch {
      addToast("การเชื่อมต่อล้มเหลว", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="relative w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-2xl z-10 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-neutral-800 border border-neutral-700 flex items-center justify-center text-white">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">จัดการโปรไฟล์</h3>
              <p className="text-xs text-neutral-400">ข้อมูลบัญชีและการตั้งค่าความปลอดภัย</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-neutral-800 text-neutral-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* User Card */}
        <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-neutral-800 to-neutral-700 border border-neutral-600 flex items-center justify-center font-bold text-lg text-white">
              {user.username.slice(0, 1).toUpperCase()}
            </div>
            <div>
              <div className="font-bold text-white text-sm">{user.username}</div>
              <div className="text-xs text-neutral-400">{user.email || "ไม่ได้ระบุอีเมล"}</div>
              <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                {user.role === "ADMIN" ? "👑 ผู้ดูแลระบบ (Admin)" : "👤 สมาชิกทั่วไป (Member)"}
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-neutral-400">ยอดเงินคงเหลือ</div>
            <div className="text-base font-bold text-white font-mono">฿{user.balance.toFixed(2)}</div>
          </div>
        </div>

        {/* Change Password Form */}
        <form onSubmit={handleChangePassword} className="space-y-3 text-xs">
          <h4 className="font-bold text-neutral-200 text-xs flex items-center gap-1.5">
            <KeyRound className="w-3.5 h-3.5 text-amber-400" />
            <span>เปลี่ยนรหัสผ่าน (Change Password)</span>
          </h4>
          <div>
            <label className="block text-neutral-400 mb-1">รหัสผ่านปัจจุบัน</label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-neutral-500"
            />
          </div>
          <div>
            <label className="block text-neutral-400 mb-1">รหัสผ่านใหม่</label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-neutral-500"
            />
          </div>
          <div>
            <label className="block text-neutral-400 mb-1">ยืนยันรหัสผ่านใหม่</label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-neutral-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-white text-black font-bold text-xs hover:bg-neutral-200 transition-colors mt-2"
          >
            {loading ? "กำลังบันทึก..." : "อัปเดตรหัสผ่าน"}
          </button>
        </form>
      </div>
    </div>
  );
}

// 2. Support & Warranty Claim Modal (ช่วยเหลือ & เคลมสินค้า)
export function SupportModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { setting } = useStore();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-2xl z-10 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">ช่วยเหลือ & เคลมสินค้า</h3>
              <p className="text-xs text-neutral-400">นโยบายการรับประกันสินค้าและแจ้งปัญหา</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-neutral-800 text-neutral-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3 text-xs text-neutral-300">
          <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2">
            <h4 className="font-bold text-white flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>เงื่อนไขการรับประกันสินค้า (Warranty Policy)</span>
            </h4>
            <ul className="list-disc list-inside space-y-1 text-neutral-400 text-[11px] leading-relaxed">
              <li>กรณีรหัส / โค้ด / ไอดี มีปัญหาไม่สามารถเข้าใช้งานได้ เคลมเปลี่ยนชิ้นใหม่ทันที</li>
              <li>กรุณาบันทึกคลิปวิดีโอตั้งแต่กดรับสินค้าจนถึงการทดลองเข้าใช้งานเพื่อเป็นหลักฐาน</li>
              <li>การรับประกันครอบคลุมตามระยะเวลาที่ระบุไว้ในแต่ละรายการสินค้า</li>
              <li>สินค้าดิจิทัลซื้อแล้วไม่สามารถขอคืนเป็นเงินสดได้ทุกกรณี เว้นแต่สินค้าหมดสต็อก</li>
            </ul>
          </div>

          <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2">
            <h4 className="font-bold text-white flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-cyan-400" />
              <span>ช่องทางติดต่อเปิดทิคเก็ตเคลมสินค้า</span>
            </h4>
            <p className="text-neutral-400 text-[11px]">
              ติดต่อแอดมินโดยตรงเพื่อส่งหลักฐานและรับการแก้ไขปัญหาอย่างรวดเร็วตลอด 24 ชั่วโมง
            </p>
            <div className="grid grid-cols-2 gap-2 pt-1">
              {setting?.contactDiscord && (
                <a
                  href={setting.contactDiscord}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-violet-600/20 text-violet-300 border border-violet-500/30 hover:bg-violet-600/30 font-semibold"
                >
                  <span>Discord Ticket</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
              {setting?.contactLine && (
                <a
                  href={setting.contactLine}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600/30 font-semibold"
                >
                  <span>LINE Official</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 3. Guide Modal (คู่มือการใช้งาน)
export function GuideModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!isOpen) return null;

  const steps = [
    {
      step: "01",
      title: "เติมเงินเข้าสู่ระบบ",
      desc: "สแกน QR PromptPay แนบสลิปผ่านระบบ SlipOK ตรวจสอบอัตโนมัติ หรือส่งซองของขวัญ TrueMoney Wallet เงินเข้าทันทีใน 1 นาที",
      icon: <CreditCard className="w-5 h-5 text-emerald-400" />,
    },
    {
      step: "02",
      title: "เลือกดูสินค้าที่ต้องการ",
      desc: "ค้นหาสินค้า บัตรเติมเงิน หรือแอปพรีเมียมในหมวดหมู่ต่างๆ อ่านรายละเอียดการรับประกันและจำนวนคงเหลือในสต็อก",
      icon: <ShoppingBag className="w-5 h-5 text-cyan-400" />,
    },
    {
      step: "03",
      title: "กดสั่งซื้อและชำระเงิน",
      desc: "กดยืนยันการสั่งซื้อ ระบบจะตัดเงินจากยอดคงเหลือในกระเป๋าของคุณ และตัดสต็อกอัตโนมัติ 24 ชม.",
      icon: <Sparkles className="w-5 h-5 text-amber-400" />,
    },
    {
      step: "04",
      title: "รับรหัสทันทีใน 'คลังของฉัน'",
      desc: "ระบบจะแสดงรหัส โค้ด หรือข้อมูลบัญชีทันที พร้อมปุ่ม 1-Click Copy นำไปใช้งานได้เลย และสามารถย้อนดูในหน้าคำสั่งซื้อได้ตลอดเวลา",
      icon: <PackageCheck className="w-5 h-5 text-violet-400" />,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-2xl z-10 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">คู่มือการใช้งานเว็บไซต์</h3>
              <p className="text-xs text-neutral-400">4 ขั้นตอนง่ายๆ สำหรับการเติมเงินและสั่งซื้อสินค้า</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-neutral-800 text-neutral-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          {steps.map((s) => (
            <div
              key={s.step}
              className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 flex items-start gap-3.5"
            >
              <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-700/80 flex items-center justify-center shrink-0">
                {s.icon}
              </div>
              <div className="space-y-0.5 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold text-neutral-500">
                    STEP {s.step}
                  </span>
                  <h4 className="font-bold text-white text-xs">{s.title}</h4>
                </div>
                <p className="text-[11px] text-neutral-400 leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// 4. Contact Modal (ติดต่อเรา)
export function ContactModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { setting } = useStore();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="relative w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-2xl z-10 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">ช่องทางติดต่อเรา</h3>
              <p className="text-xs text-neutral-400">สอบถามข้อมูลเพิ่มเติม หรือแจ้งปัญหาการใช้งาน</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-neutral-800 text-neutral-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2.5 text-xs">
          {setting?.contactDiscord && (
            <a
              href={setting.contactDiscord}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 hover:border-violet-500/50 hover:bg-violet-950/20 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-violet-600/20 text-violet-400 flex items-center justify-center font-bold">
                  💬
                </div>
                <div>
                  <div className="font-bold text-white text-xs group-hover:text-violet-300">
                    Discord Community
                  </div>
                  <div className="text-[11px] text-neutral-400">พูดคุยและเปิด Ticket ซัพพอร์ต</div>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-neutral-500 group-hover:text-white" />
            </a>
          )}

          {setting?.contactLine && (
            <a
              href={setting.contactLine}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 hover:border-emerald-500/50 hover:bg-emerald-950/20 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center font-bold">
                  📱
                </div>
                <div>
                  <div className="font-bold text-white text-xs group-hover:text-emerald-300">
                    LINE Official Account
                  </div>
                  <div className="text-[11px] text-neutral-400">ติดต่อแอดมินทาง LINE โดยตรง</div>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-neutral-500 group-hover:text-white" />
            </a>
          )}

          {setting?.contactFacebook && (
            <a
              href={setting.contactFacebook}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 hover:border-blue-500/50 hover:bg-blue-950/20 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold">
                  📘
                </div>
                <div>
                  <div className="font-bold text-white text-xs group-hover:text-blue-300">
                    Facebook Fanpage
                  </div>
                  <div className="text-[11px] text-neutral-400">ติดตามข่าวสารและโปรโมชั่น</div>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-neutral-500 group-hover:text-white" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
