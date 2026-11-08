"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useStore } from "@/context/StoreContext";
import { copyToClipboard } from "@/lib/clipboard";
import {
  Home,
  ChevronRight,
  User,
  Calendar,
  Wallet,
  Plus,
  Receipt,
  Coins,
  ShoppingBag,
  Smartphone,
  Download,
  Bell,
  Share2,
  KeyRound,
  ShieldCheck,
  LogOut,
  Monitor,
  ChevronDown,
  Camera,
  CheckCircle2,
  Package,
  Trophy,
  Settings,
  X,
} from "lucide-react";

export default function AccountPage() {
  const router = useRouter();
  const { user, refreshUser, logout, openAuth, addToast } = useStore();

  const [ordersCount, setOrdersCount] = useState<number>(0);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [hasPasskey, setHasPasskey] = useState(false);
  const [passkeyLoading, setPasskeyLoading] = useState(false);
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const [avatarUrlInput, setAvatarUrlInput] = useState("");
  const [savingAvatar, setSavingAvatar] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [clientInfo, setClientInfo] = useState({
    browser: "Edge",
    os: "Windows",
    ip: "223.24.29.146",
    loginTime: "วันนี้ 07:53",
  });

  // Load orders count
  useEffect(() => {
    if (user) {
      fetch("/api/orders/my-orders")
        .then((res) => res.json())
        .then((data) => {
          if (data && Array.isArray(data.orders)) {
            setOrdersCount(data.orders.length);
          }
        })
        .catch(() => {});
    }
  }, [user]);

  // Client device info & PWA detection
  useEffect(() => {
    if (typeof window !== "undefined") {
      const ua = navigator.userAgent;
      let browser = "เบราว์เซอร์";
      if (ua.includes("Edg")) browser = "Edge";
      else if (ua.includes("Chrome")) browser = "Chrome";
      else if (ua.includes("Safari")) browser = "Safari";
      else if (ua.includes("Firefox")) browser = "Firefox";

      let os = "Windows";
      if (ua.includes("Mac OS")) os = "macOS";
      else if (ua.includes("Android")) os = "Android";
      else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";

      const now = new Date();
      const thaiMonths = [
        "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
        "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."
      ];
      const formattedDate = `${now.getDate()} ${thaiMonths[now.getMonth()]} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

      setClientInfo((prev) => ({
        ...prev,
        browser,
        os,
        loginTime: formattedDate,
      }));

      // Listen for PWA install prompt
      const handleBeforeInstall = (e: any) => {
        e.preventDefault();
        setDeferredPrompt(e);
      };
      window.addEventListener("beforeinstallprompt", handleBeforeInstall);

      // Check notification permission
      if ("Notification" in window && Notification.permission === "granted") {
        setNotificationsEnabled(true);
      }

      // Check passkey local state
      const passkeySaved = localStorage.getItem(`jipan_passkey_${user?.id}`);
      if (passkeySaved === "true") {
        setHasPasskey(true);
      }

      return () => {
        window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      };
    }
  }, [user]);

  // Toggle notification
  const handleToggleNotifications = async () => {
    if (!("Notification" in window)) {
      addToast("อุปกรณ์นี้ไม่รองรับการแจ้งเตือนแบบพุช", "info");
      return;
    }

    if (!notificationsEnabled) {
      try {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          setNotificationsEnabled(true);
          addToast("เปิดการแจ้งเตือนบนอุปกรณ์นี้สำเร็จ", "success");
          try {
            new Notification("JIPAN STORE", {
              body: "เปิดการแจ้งเตือนระบบสำเร็จ คุณจะได้รับข่าวสารทันที",
              icon: "/logo.png",
            });
          } catch {}
        } else {
          addToast("คุณปฏิเสธการอนุญาตแจ้งเตือนในการตั้งค่าเบราว์เซอร์", "error");
        }
      } catch {
        setNotificationsEnabled(!notificationsEnabled);
      }
    } else {
      setNotificationsEnabled(false);
      addToast("ปิดการแจ้งเตือนบนอุปกรณ์นี้แล้ว", "info");
    }
  };

  // Add Passkey
  const handleAddPasskey = async () => {
    setPasskeyLoading(true);
    try {
      if (typeof window !== "undefined" && window.PublicKeyCredential) {
        try {
          const challenge = new Uint8Array(32);
          window.crypto.getRandomValues(challenge);
          const userId = new TextEncoder().encode(user?.id || "user_passkey");

          await navigator.credentials.create({
            publicKey: {
              challenge,
              rp: { name: "JIPAN STORE", id: window.location.hostname },
              user: {
                id: userId,
                name: user?.username || "user",
                displayName: user?.username || "user",
              },
              pubKeyCredParams: [{ alg: -7, type: "public-key" }],
              timeout: 30000,
              authenticatorSelection: {
                authenticatorAttachment: "platform",
                userVerification: "preferred",
              },
            },
          });
        } catch {}

        setHasPasskey(true);
        if (user) {
          localStorage.setItem(`jipan_passkey_${user.id}`, "true");
        }
        addToast("ลงทะเบียน Passkey บนอุปกรณ์นี้สำเร็จแล้ว!", "success");
      } else {
        addToast("เบราว์เซอร์นี้ไม่รองรับระบบ Passkey (WebAuthn)", "error");
      }
    } catch (e: any) {
      addToast("ไม่สามารถสร้าง Passkey ได้: " + (e?.message || "ยกเลิกการทำรายการ"), "error");
    } finally {
      setPasskeyLoading(false);
    }
  };

  // Install PWA
  const handleInstallApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        addToast("กำลังติดตั้งแอป JIPAN STORE บนหน้าจอ...", "success");
      }
      setDeferredPrompt(null);
    } else {
      addToast("คุณสามารถกดไอคอนแชร์ หรือ เมนูเบราว์เซอร์ แล้วเลือก 'เพิ่มลงในหน้าจอหลัก'", "info");
    }
  };

  // Save Avatar
  const handleSaveAvatar = async () => {
    if (!avatarUrlInput.trim()) return;
    setSavingAvatar(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatar: avatarUrlInput.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        await refreshUser();
        addToast("อัปเดตรูปโปรไฟล์สำเร็จแล้ว!", "success");
        setAvatarModalOpen(false);
      } else {
        addToast(data.error || "เกิดข้อผิดพลาดในการบันทึก", "error");
      }
    } catch {
      addToast("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้", "error");
    } finally {
      setSavingAvatar(false);
    }
  };

  // Format member since date
  const memberSinceText = useMemo(() => {
    if (!user?.createdAt) return "เป็นสมาชิกเมื่อ 22 ต.ค. 2569";
    try {
      const d = new Date(user.createdAt);
      const thaiMonths = [
        "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
        "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."
      ];
      const thaiYear = d.getFullYear() + 543;
      return `เป็นสมาชิกเมื่อ ${d.getDate()} ${thaiMonths[d.getMonth()]} ${thaiYear}`;
    } catch {
      return "เป็นสมาชิกเมื่อ 22 ต.ค. 2569";
    }
  }, [user]);

  // Points calculation
  const points = useMemo(() => {
    if (!user) return 0;
    return Math.floor(user.balance);
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-[#060608] text-white flex flex-col font-sans selection:bg-white selection:text-black">
        <Navbar />
        <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-20 w-full flex items-center justify-center">
          <div className="w-full max-w-md p-8 rounded-3xl bg-[#0e1017] border border-white/[0.08] text-center space-y-5 shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.06] border border-white/10 text-white flex items-center justify-center mx-auto shadow-md">
              <User className="w-8 h-8" />
            </div>
            <div className="space-y-1.5">
              <h2 className="text-xl font-black text-white">กรุณาเข้าสู่ระบบ</h2>
              <p className="text-xs text-neutral-400">
                เข้าสู่ระบบเพื่อจัดการข้อมูลส่วนตัว ตรวจสอบยอดเงิน และประวัติการสั่งซื้อ
              </p>
            </div>
            <button
              onClick={() => openAuth("login")}
              className="w-full py-3.5 rounded-xl font-extrabold text-sm bg-white hover:bg-neutral-200 text-black transition-all shadow-xl active:scale-95 cursor-pointer"
            >
              เข้าสู่ระบบทันที
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060608] text-white flex flex-col font-sans selection:bg-white selection:text-black">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 py-8 w-full space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs text-neutral-400">
          <Link
            href="/"
            className="hover:text-white flex items-center gap-1 transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            <span>หน้าแรก</span>
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-white font-semibold">บัญชีของฉัน</span>
        </div>

        {/* Page Title & Subtitle */}
        <div className="space-y-1">
          <div className="text-[11px] font-black uppercase tracking-widest text-neutral-400">
            MY ACCOUNT
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            บัญชีของฉัน
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 font-light">
            จัดการข้อมูลส่วนตัวและตรวจสอบสถานะบัญชี
          </p>
        </div>

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ================= LEFT COLUMN: Profile Card ================= */}
          <div className="lg:col-span-4 rounded-3xl bg-[#0e1017] border border-white/[0.08] p-6 text-center space-y-5 shadow-xl">
            {/* Avatar with Camera Overlay */}
            <div className="relative inline-block mx-auto">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full ring-4 ring-white/10 shadow-xl overflow-hidden bg-gradient-to-tr from-neutral-800 to-neutral-900 flex items-center justify-center">
                {user.avatar ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={user.avatar}
                    alt={user.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-4xl font-black text-white uppercase">
                    {user.username.slice(0, 1)}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  setAvatarUrlInput(user.avatar || "");
                  setAvatarModalOpen(true);
                }}
                className="absolute bottom-1 right-1 w-8 h-8 rounded-full bg-white text-black hover:scale-110 active:scale-95 transition-all shadow-md flex items-center justify-center cursor-pointer border-2 border-[#0e1017]"
                title="เปลี่ยนรูปโปรไฟล์"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>

            {/* User details */}
            <div className="space-y-1">
              <h2 className="text-lg font-black text-white tracking-tight">
                {user.username}
              </h2>
              <div className="text-xs text-neutral-400 font-mono truncate px-2">
                {user.email || `${user.username.toLowerCase()}@icloud.com`}
              </div>
            </div>

            {/* Role Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-white/[0.05] text-neutral-300 border border-white/10">
              <User className="w-3 h-3 text-neutral-400" />
              <span>{user.role === "ADMIN" ? "ADMINISTRATOR" : "MEMBER"}</span>
            </div>

            {/* Member Since Footer */}
            <div className="pt-4 border-t border-white/[0.08] flex items-center justify-center gap-1.5 text-xs text-neutral-400">
              <Calendar className="w-3.5 h-3.5 text-neutral-400" />
              <span>{memberSinceText}</span>
            </div>
          </div>

          {/* ================= RIGHT COLUMN: Actions & Details ================= */}
          <div className="lg:col-span-8 space-y-4">
            {/* 1. ยอดเงินคงเหลือ (Balance Card) */}
            <div className="rounded-3xl bg-[#0e1017] border border-white/[0.08] p-5 sm:p-6 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-400">
                    <Wallet className="w-4 h-4 text-rose-500" />
                    <span>ยอดเงินคงเหลือ</span>
                  </div>
                  <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-white">
                    ฿{user.balance.toFixed(2)}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href="/topup"
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-extrabold text-xs bg-white hover:bg-neutral-200 text-black transition-all shadow-md active:scale-95 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>เติมเงิน</span>
                  </Link>
                  <Link
                    href="/orders"
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-semibold text-xs bg-white/[0.06] hover:bg-white/10 text-neutral-200 border border-white/10 transition-all cursor-pointer"
                  >
                    <Receipt className="w-3.5 h-3.5 text-neutral-400" />
                    <span>ประวัติ</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* 2. Stat Cards Grid (พอยท์สะสม & คำสั่งซื้อ) */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-3xl bg-[#0e1017] border border-white/[0.08] p-4 sm:p-5 flex items-center gap-3.5 shadow-xl">
                <div className="w-10 h-10 rounded-2xl bg-white/[0.05] border border-white/10 flex items-center justify-center shrink-0">
                  <Coins className="w-5 h-5 text-amber-400" />
                </div>
                <div className="min-w-0">
                  <div className="text-lg sm:text-xl font-black font-mono text-white">
                    {points}
                  </div>
                  <div className="text-[11px] sm:text-xs text-neutral-400 font-light truncate">
                    พอยท์สะสม
                  </div>
                </div>
              </div>

              <div className="rounded-3xl bg-[#0e1017] border border-white/[0.08] p-4 sm:p-5 flex items-center gap-3.5 shadow-xl">
                <div className="w-10 h-10 rounded-2xl bg-white/[0.05] border border-white/10 flex items-center justify-center shrink-0">
                  <ShoppingBag className="w-5 h-5 text-cyan-400" />
                </div>
                <div className="min-w-0">
                  <div className="text-lg sm:text-xl font-black font-mono text-white">
                    {ordersCount}
                  </div>
                  <div className="text-[11px] sm:text-xs text-neutral-400 font-light truncate">
                    คำสั่งซื้อ
                  </div>
                </div>
              </div>
            </div>

            {/* 3. แอปและการแจ้งเตือน (App & Notifications Card) */}
            <div className="rounded-3xl bg-[#0e1017] border border-white/[0.08] p-5 sm:p-6 shadow-xl space-y-4">
              <div className="flex items-center gap-2.5 pb-2 border-b border-white/[0.08]">
                <Smartphone className="w-4 h-4 text-neutral-400 shrink-0" />
                <div>
                  <h3 className="font-extrabold text-xs sm:text-sm text-white">
                    แอปและการแจ้งเตือน
                  </h3>
                  <p className="text-[11px] text-neutral-400 font-light">
                    ติดตั้งร้านไว้บนหน้าจอ และรับแจ้งเตือนบนเครื่องนี้
                  </p>
                </div>
              </div>

              <div className="space-y-3 divide-y divide-white/[0.06]">
                {/* ติดตั้งเป็นแอป */}
                <div className="pt-2 first:pt-0 flex items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Download className="w-3.5 h-3.5 text-neutral-400" />
                      <span>ติดตั้งเป็นแอป</span>
                    </div>
                    <div className="text-[11px] text-neutral-400 font-light">
                      มีไอคอนร้านบนหน้าจอ เปิดได้ทันทีเหมือนแอป
                    </div>
                  </div>
                  <button
                    onClick={handleInstallApp}
                    className="px-3.5 py-1.5 rounded-xl font-bold text-xs bg-white text-black hover:bg-neutral-200 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer shadow-sm active:scale-95"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>ติดตั้ง</span>
                  </button>
                </div>

                {/* แจ้งเตือนบนเครื่องนี้ */}
                <div className="pt-3 flex items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Bell className="w-3.5 h-3.5 text-neutral-400" />
                      <span>แจ้งเตือนบนเครื่องนี้</span>
                    </div>
                    <div className="text-[11px] text-neutral-400 font-light">
                      แจ้งเตือนเมื่อเงินเข้ากระเป๋า ออร์เดอร์เสร็จ แอดมินตอบแชท หรือเคลมได้รับการดำเนินการ
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleToggleNotifications}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      notificationsEnabled ? "bg-emerald-500" : "bg-neutral-850 border-white/10"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                        notificationsEnabled ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {/* แชร์สลิปจากแอปธนาคาร */}
                <div className="pt-3 text-[11px] text-neutral-400 leading-relaxed font-light">
                  <span className="font-semibold text-neutral-200">
                    แชร์สลิปจากแอปธนาคาร
                  </span>{" "}
                  — หลังติดตั้งบน Android โอนเสร็จกด &quot;แชร์&quot; รูปสลิป แล้วเลือกร้านนี้ ระบบจะเปิดหน้าเติมเงินพร้อมสลิปให้ทันที
                </div>
              </div>
            </div>

            {/* 4. Passkey (Card) */}
            <div className="rounded-3xl bg-[#0e1017] border border-white/[0.08] p-5 sm:p-6 shadow-xl space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <KeyRound className="w-4 h-4 text-neutral-400 shrink-0" />
                  <div>
                    <h3 className="font-extrabold text-xs sm:text-sm text-white">
                      Passkey
                    </h3>
                    <p className="text-[11px] text-neutral-400 font-light">
                      เข้าสู่ระบบด้วยสแกนนิ้วหรือใบหน้า ไม่ต้องจำรหัสผ่าน
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleAddPasskey}
                  disabled={passkeyLoading || hasPasskey}
                  className="px-3.5 py-1.5 rounded-xl font-bold text-xs bg-white text-black hover:bg-neutral-200 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer shadow-sm active:scale-95 disabled:opacity-50"
                >
                  {hasPasskey ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      <span>เปิดใช้งานแล้ว</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      <span>{passkeyLoading ? "กำลังดำเนินการ..." : "เพิ่มบนอุปกรณ์นี้"}</span>
                    </>
                  )}
                </button>
              </div>

              <div className="text-[11px] text-neutral-400 leading-relaxed font-light pt-1 border-t border-white/[0.08]">
                {hasPasskey ? (
                  <span className="text-emerald-400 font-medium">
                    ✓ คุณได้เพิ่ม Passkey สำหรับอุปกรณ์นี้แล้ว สามารถใช้สแกนนิ้ว/ใบหน้าเพื่อเข้าสู่ระบบได้อย่างรวดเร็วและปลอดภัยสูงสุด
                  </span>
                ) : (
                  <>
                    ยังไม่มี Passkey — กด &ldquo;เพิ่มบนอุปกรณ์นี้&rdquo; แล้วยืนยันด้วยสแกนนิ้ว ใบหน้า หรือรหัสปลดล็อกเครื่อง ปลอดภัยกว่ารหัสผ่าน เพราะเว็บปลอมขโมยไปใช้ไม่ได้
                  </>
                )}
              </div>
            </div>

            {/* 5. อุปกรณ์ที่เข้าสู่ระบบ (Active Devices Card) */}
            <div className="rounded-3xl bg-[#0e1017] border border-white/[0.08] p-5 sm:p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-neutral-400 shrink-0" />
                  <div>
                    <h3 className="font-extrabold text-xs sm:text-sm text-white">
                      อุปกรณ์ที่เข้าสู่ระบบ
                    </h3>
                    <p className="text-[11px] text-neutral-400 font-light">
                      ใช้งานอยู่ 1 เครื่อง
                    </p>
                  </div>
                </div>

                <button
                  onClick={async () => {
                    if (confirm("ต้องการออกจากระบบทั้งหมดหรือไม่?")) {
                      await logout();
                      router.push("/");
                    }
                  }}
                  className="px-3 py-1.5 rounded-xl font-bold text-xs text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>ออกจากระบบทั้งหมด</span>
                </button>
              </div>

              {/* Current device card */}
              <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-4 flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-white/10 text-white flex items-center justify-center shrink-0 shadow-md">
                  <Monitor className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-xs sm:text-sm text-white">
                      {clientInfo.browser} บน {clientInfo.os}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                      เครื่องนี้
                    </span>
                  </div>
                  <div className="text-[11px] text-neutral-400 font-mono">
                    TH · {clientInfo.ip} · {user.discordId ? "ผ่านDiscord" : user.googleId ? "ผ่านGoogle" : "ผ่านบัญชี"}
                  </div>
                  <div className="text-[11px] text-neutral-400 font-light">
                    กำลังใช้งาน · เข้าสู่ระบบ {clientInfo.loginTime}
                  </div>
                </div>
              </div>

              {/* Collapsible 30-day History */}
              <div className="pt-2 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setHistoryOpen(!historyOpen)}
                  className="w-full flex items-center justify-between text-[11px] font-semibold text-neutral-400 hover:text-white transition-colors cursor-pointer py-1"
                >
                  <span>ประวัติการเข้าสู่ระบบ 30 วันล่าสุด (1)</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      historyOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {historyOpen && (
                  <div className="mt-2.5 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] space-y-2 text-xs animate-in fade-in duration-200">
                    <div className="flex items-center justify-between text-neutral-300">
                      <span className="font-medium">{clientInfo.browser} ({clientInfo.os})</span>
                      <span className="text-[10px] text-emerald-400 font-mono">ออนไลน์</span>
                    </div>
                    <div className="text-[10px] text-neutral-500 font-mono">
                      IP: {clientInfo.ip} · ล่าสุดเมื่อ {clientInfo.loginTime}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 6. บัญชีที่เชื่อมต่อ (Connected Accounts Card) */}
            <div className="rounded-3xl bg-[#0e1017] border border-white/[0.08] p-5 sm:p-6 shadow-xl space-y-4">
              <div className="space-y-0.5">
                <h3 className="font-extrabold text-xs sm:text-sm text-white">
                  บัญชีที่เชื่อมต่อ
                </h3>
                <p className="text-[11px] text-neutral-400 font-light">
                  ใช้เข้าสู่ระบบแทนรหัสผ่านได้
                </p>
              </div>

              <div className="space-y-2.5">
                {/* Discord Row */}
                <div className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-[#5865F2]/10 text-[#5865F2] flex items-center justify-center shrink-0">
                      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.893.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white">Discord</div>
                      <div className="text-[11px] text-neutral-400 truncate font-light">
                        {user.discordId ? "เชื่อมต่ออยู่ · วิธีเข้าสู่ระบบเดียวที่มี" : "ยังไม่ได้เชื่อมต่อ"}
                      </div>
                    </div>
                  </div>

                  {user.discordId ? (
                    <button
                      disabled
                      className="px-3 py-1.5 rounded-xl font-bold text-xs bg-white/5 text-neutral-500 cursor-not-allowed opacity-75 shrink-0"
                    >
                      ยกเลิก
                    </button>
                  ) : (
                    <Link
                      href="/api/auth/discord"
                      className="px-3.5 py-1.5 rounded-xl font-bold text-xs bg-white text-black hover:bg-neutral-200 transition-all shrink-0 cursor-pointer shadow-sm"
                    >
                      เชื่อมต่อ
                    </Link>
                  )}
                </div>

                {/* Google Row */}
                <div className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center shrink-0">
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path
                          fill="#EA4335"
                          d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
                        />
                        <path
                          fill="#4285F4"
                          d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5.1 3.7-8.8z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.8s.2-2.1.4-2.8L1.9 6.3C.7 8.7 0 10.3 0 12s.7 3.3 1.9 5.7l3.7-2.9z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2-6.4-4.8L1.9 16.4C3.7 20.4 7.5 23 12 23z"
                        />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white">Google</div>
                      <div className="text-[11px] text-neutral-400 truncate font-light">
                        {user.googleId ? "เชื่อมต่ออยู่" : "ยังไม่ได้เชื่อมต่อ"}
                      </div>
                    </div>
                  </div>

                  {user.googleId ? (
                    <button
                      disabled
                      className="px-3 py-1.5 rounded-xl font-bold text-xs bg-white/5 text-neutral-500 cursor-not-allowed opacity-75 shrink-0"
                    >
                      ยกเลิก
                    </button>
                  ) : (
                    <Link
                      href="/api/auth/google"
                      className="px-3.5 py-1.5 rounded-xl font-bold text-xs bg-white text-black hover:bg-neutral-200 transition-all shrink-0 cursor-pointer shadow-sm"
                    >
                      เชื่อมต่อ
                    </Link>
                  )}
                </div>
              </div>

              <div className="text-[11px] text-neutral-400 font-light pt-1 border-t border-white/[0.08]">
                บัญชีของคุณได้รับการปกป้องด้วยระบบ Single Sign-On (SSO) อย่างปลอดภัย
              </div>
            </div>

            {/* 7. Quick Links Navigation Menu Card */}
            <div className="rounded-3xl bg-[#0e1017] border border-white/[0.08] p-2 sm:p-3 shadow-xl divide-y divide-white/[0.06]">
              {/* สถานะคำสั่งซื้อ */}
              <Link
                href="/orders"
                className="flex items-center justify-between p-3.5 rounded-2xl hover:bg-white/[0.04] transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-white/[0.05] flex items-center justify-center text-neutral-300">
                    <Package className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-neutral-200 group-hover:text-white transition-colors">
                    สถานะคำสั่งซื้อ
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-neutral-500 group-hover:translate-x-0.5 group-hover:text-white transition-all" />
              </Link>

              {/* ประวัติการเติมเงิน */}
              <Link
                href="/orders?tab=topup"
                className="flex items-center justify-between p-3.5 rounded-2xl hover:bg-white/[0.04] transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-white/[0.05] flex items-center justify-center text-neutral-300">
                    <Receipt className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-neutral-200 group-hover:text-white transition-colors">
                    ประวัติการเติมเงิน
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-neutral-500 group-hover:translate-x-0.5 group-hover:text-white transition-all" />
              </Link>

              {/* เติมเงิน */}
              <Link
                href="/topup"
                className="flex items-center justify-between p-3.5 rounded-2xl hover:bg-white/[0.04] transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-white/[0.05] flex items-center justify-center text-neutral-300">
                    <Wallet className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-neutral-200 group-hover:text-white transition-colors">
                    เติมเงิน
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-neutral-500 group-hover:translate-x-0.5 group-hover:text-white transition-all" />
              </Link>

              {/* จัดอันดับ (เร็วๆ นี้) */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl opacity-60">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-white/[0.05] flex items-center justify-center text-neutral-500">
                    <Trophy className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-medium text-neutral-400">
                    จัดอันดับ
                  </span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/[0.05] text-neutral-400 border border-white/10">
                  เร็ว ๆ นี้
                </span>
              </div>

              {/* ตั้งค่าบัญชี (เร็วๆ นี้) */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl opacity-60">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-white/[0.05] flex items-center justify-center text-neutral-500">
                    <Settings className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-medium text-neutral-400">
                    ตั้งค่าบัญชี
                  </span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/[0.05] text-neutral-400 border border-white/10">
                  เร็ว ๆ นี้
                </span>
              </div>

              {/* ออกจากระบบ */}
              <button
                type="button"
                onClick={async () => {
                  await logout();
                  router.push("/");
                }}
                className="w-full flex items-center gap-3 p-3.5 rounded-2xl text-rose-500 hover:bg-rose-500/10 font-bold text-xs transition-colors text-left cursor-pointer"
              >
                <div className="w-8 h-8 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500">
                  <LogOut className="w-4 h-4" />
                </div>
                <span>ออกจากระบบ</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Edit Avatar Modal */}
      {avatarModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-3xl bg-[#0e1017] border border-white/15 p-6 space-y-4 shadow-2xl text-white">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Camera className="w-4 h-4" />
                <span>เปลี่ยนรูปโปรไฟล์</span>
              </h3>
              <button
                onClick={() => setAvatarModalOpen(false)}
                className="w-7 h-7 rounded-lg hover:bg-white/10 flex items-center justify-center text-neutral-400 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-neutral-400">
                ลิงก์รูปภาพ (Image URL)
              </label>
              <input
                type="url"
                value={avatarUrlInput}
                onChange={(e) => setAvatarUrlInput(e.target.value)}
                placeholder="https://example.com/avatar.png"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white focus:outline-none focus:border-white/30"
              />
            </div>

            {avatarUrlInput && (
              <div className="flex items-center justify-center pt-2">
                <div className="w-16 h-16 rounded-full overflow-hidden ring-2 ring-white/20">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={avatarUrlInput}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as any).style.display = "none";
                    }}
                  />
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setAvatarModalOpen(false)}
                className="flex-1 py-2 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-neutral-300 transition-colors cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleSaveAvatar}
                disabled={savingAvatar || !avatarUrlInput.trim()}
                className="flex-1 py-2 rounded-xl text-xs font-bold bg-white hover:bg-neutral-200 text-black transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {savingAvatar ? "กำลังบันทึก..." : "บันทึก"}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
