"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useStore } from "@/context/StoreContext";
import { THEMES, ThemeColor } from "@/lib/theme";
import SearchModal from "./SearchModal";
import { ProfileModal, SupportModal, GuideModal, ContactModal } from "./ExtraModals";
import {
  Wallet,
  User as UserIcon,
  LogOut,
  ShoppingBag,
  ShieldCheck,
  Palette,
  ChevronDown,
  Home,
  Layers,
  Sparkles,
  Search,
  UserCog,
  Package,
  Headphones,
  Receipt,
  BookOpen,
  PhoneCall,
  Menu,
  X,
  Star,
  Newspaper,
  Zap,
  Check,
  Plus,
  Sun,
  Moon,
  ArrowRight,
  Clock,
  CreditCard,
  Bell,
  MessageCircle,
} from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const {
    user,
    setting,
    logout,
    themeMode,
    toggleThemeMode,
    addToast,
  } = useStore();

  const handleProtectedNavigation = (targetUrl: string, featureName: string) => {
    if (!user) {
      addToast(`กรุณาเข้าสู่ระบบก่อนใช้งานเมนู ${featureName}`, "info");
      router.push(`/login?redirect=${encodeURIComponent(targetUrl)}`);
    } else {
      router.push(targetUrl);
    }
  };

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isExtraMenuOpen, setIsExtraMenuOpen] = useState(false);

  // Modals state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);

  // Global Ctrl+K / Cmd+K shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      {/* Edge-to-Edge Full-Width Header (genzxshop reference) */}
      <header className="sticky top-0 z-40 w-full border-b border-white/[0.08] bg-[#060608]/95 backdrop-blur-2xl">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Logo & Name */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center font-black text-white text-base shadow-md group-hover:scale-105 transition-transform overflow-hidden shrink-0">
              {setting?.logoUrl && setting.logoUrl !== "/logo.png" ? (
                <img
                  src={setting.logoUrl}
                  alt={setting.shopName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Zap className="w-4 h-4 text-white" />
              )}
            </div>
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-extrabold text-sm sm:text-base tracking-wide text-white truncate">
                {setting?.shopName || "JIPAN STORE"}
              </span>
            </div>
          </Link>

          {/* Center Nav links (Desktop) - Exact genzxshop order */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            <Link
              href="/"
              className={`relative px-3.5 py-2 text-xs font-semibold transition-all duration-150 flex items-center gap-1.5 ${
                pathname === "/"
                  ? "text-white font-bold"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>หน้าหลัก</span>
              {pathname === "/" && (
                <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-white rounded-full" />
              )}
            </Link>

            <Link
              href="/categories"
              className={`relative px-3.5 py-2 text-xs font-semibold transition-all duration-150 flex items-center gap-1.5 ${
                pathname?.startsWith("/categories")
                  ? "text-white font-bold"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>ร้านค้า</span>
              {pathname?.startsWith("/categories") && (
                <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-white rounded-full" />
              )}
            </Link>

            <button
              type="button"
              onClick={() => handleProtectedNavigation("/topup", "เติมเงิน")}
              className={`relative px-3.5 py-2 text-xs font-semibold transition-all duration-150 flex items-center gap-1.5 cursor-pointer ${
                pathname?.startsWith("/topup")
                  ? "text-white font-bold"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>เติมเงิน</span>
              {pathname?.startsWith("/topup") && (
                <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-white rounded-full" />
              )}
            </button>

            <button
              type="button"
              onClick={() => handleProtectedNavigation("/orders", "ประวัติการสั่งซื้อ")}
              className={`relative px-3.5 py-2 text-xs font-semibold transition-all duration-150 flex items-center gap-1.5 cursor-pointer ${
                pathname?.startsWith("/orders")
                  ? "text-white font-bold"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>ประวัติการสั่งซื้อ</span>
              {pathname?.startsWith("/orders") && (
                <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-white rounded-full" />
              )}
            </button>

            {/* Extra Features Dropdown (GenzX Inspired) */}
            <div className="relative">
              <button
                onClick={() => setIsExtraMenuOpen(!isExtraMenuOpen)}
                className={`flex items-center gap-1 px-3 py-2 text-xs font-semibold transition-all duration-150 cursor-pointer ${
                  isExtraMenuOpen ||
                  ["/reviews", "/news", "/docs"].some((p) => pathname?.startsWith(p))
                    ? "text-white font-bold"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                <span>ฟังก์ชั่นเสริม</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-neutral-400 transition-transform duration-200 ${
                    isExtraMenuOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isExtraMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsExtraMenuOpen(false)}
                  />
                  <div className="absolute left-0 mt-2.5 w-64 rounded-2xl bg-[#0e1017]/95 backdrop-blur-2xl border border-white/10 p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 space-y-0.5">
                    <button
                      type="button"
                      onClick={() => {
                        setIsExtraMenuOpen(false);
                        handleProtectedNavigation("/topup", "เติมเงิน");
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-neutral-300 hover:text-white hover:bg-white/[0.06] transition-colors text-left cursor-pointer"
                    >
                      <Wallet className="w-4 h-4 text-emerald-400 shrink-0" />
                      <div>
                        <div className="font-semibold text-white">เติมเงินอัตโนมัติ</div>
                        <div className="text-[10px] text-neutral-500">
                          พร้อมเพย์ & ทรูวอเล็ท & โค้ด 24 ชม.
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsExtraMenuOpen(false);
                        handleProtectedNavigation("/orders", "คลังสินค้า");
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-neutral-300 hover:text-white hover:bg-white/[0.06] transition-colors text-left cursor-pointer"
                    >
                      <Package className="w-4 h-4 text-neutral-300 shrink-0" />
                      <div>
                        <div className="font-semibold text-white">คลังสินค้าของฉัน</div>
                        <div className="text-[10px] text-neutral-500">
                          เช็คโค้ด & รหัสคำสั่งซื้อ
                        </div>
                      </div>
                    </button>

                    <Link
                      href="/reviews"
                      onClick={() => setIsExtraMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-neutral-300 hover:text-white hover:bg-white/[0.06] transition-colors"
                    >
                      <Star className="w-4 h-4 text-amber-400 shrink-0" />
                      <div>
                        <div className="font-semibold text-white">รีวิวจากลูกค้า</div>
                        <div className="text-[10px] text-neutral-500">
                          คะแนนความพึงพอใจ 5 ดาว
                        </div>
                      </div>
                    </Link>

                    <Link
                      href="/news"
                      onClick={() => setIsExtraMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-neutral-300 hover:text-white hover:bg-white/[0.06] transition-colors"
                    >
                      <Newspaper className="w-4 h-4 text-neutral-300 shrink-0" />
                      <div>
                        <div className="font-semibold text-white">ข่าวสาร & โปรโมชั่น</div>
                        <div className="text-[10px] text-neutral-500">อัปเดตกิจกรรมล่าสุด</div>
                      </div>
                    </Link>

                    <div className="border-t border-white/[0.08] my-1" />

                    <button
                      onClick={() => {
                        setIsExtraMenuOpen(false);
                        setIsGuideOpen(true);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-neutral-300 hover:text-white hover:bg-white/[0.06] transition-colors text-left cursor-pointer"
                    >
                      <BookOpen className="w-4 h-4 text-neutral-400 shrink-0" />
                      <span>คู่มือการใช้งาน</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsExtraMenuOpen(false);
                        setIsContactOpen(true);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-neutral-300 hover:text-white hover:bg-white/[0.06] transition-colors text-left cursor-pointer"
                    >
                      <PhoneCall className="w-4 h-4 text-neutral-400 shrink-0" />
                      <span>ติดต่อสอบถามทีมงาน</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </nav>

          {/* Right Action Utilities (genzxshop reference) */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Contact / Chat Button */}
            <button
              onClick={() => setIsContactOpen(true)}
              className="w-9 h-9 rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.08] hover:border-white/15 flex items-center justify-center text-neutral-300 hover:text-white transition-all cursor-pointer text-xs"
              title="ติดต่อทีมงาน"
            >
              <MessageCircle className="w-4 h-4 text-neutral-400" />
            </button>

            {/* Quick Search Button */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="w-9 h-9 rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.08] hover:border-white/15 flex items-center justify-center text-neutral-300 hover:text-white transition-all cursor-pointer text-xs"
              title="ค้นหาสินค้า (Ctrl + K)"
            >
              <Search className="w-4 h-4 text-neutral-400" />
            </button>

            {/* Theme Mode Toggle */}
            <button
              onClick={(e) => toggleThemeMode(e)}
              className="w-9 h-9 rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.08] hover:border-white/15 flex items-center justify-center text-neutral-300 hover:text-white transition-all cursor-pointer text-xs group shrink-0"
              title={themeMode === "dark" ? "เปลี่ยนเป็นโหมดสว่าง" : "เปลี่ยนเป็นโหมดมืด"}
            >
              {themeMode === "dark" ? (
                <Sun className="w-4 h-4 text-amber-400 group-hover:rotate-45 transition-transform duration-300" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-400 group-hover:-rotate-12 transition-transform duration-300" />
              )}
            </button>

            {/* User Profile Or Auth Buttons */}
            {user ? (
              <div className="flex items-center gap-2">
                <div className="relative">
                  {/* User pill in Navbar (Reference GenZX style: username + balance on left, avatar on right) */}
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2.5 cursor-pointer group text-right select-none pl-2"
                  >
                    <div className="hidden sm:flex flex-col items-end leading-tight">
                      <span className="text-xs font-bold text-white max-w-[120px] truncate group-hover:text-neutral-350 transition-colors">
                        {user.username}
                      </span>
                      <span className="text-xs font-extrabold font-mono text-neutral-100">
                        ฿{user.balance.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div className="w-9 h-9 rounded-full ring-2 ring-white/20 group-hover:ring-white/40 bg-white/10 border border-white/20 flex items-center justify-center text-white font-bold text-xs shadow-md shrink-0 overflow-hidden transition-all">
                      {user.avatar ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={user.avatar}
                          alt={user.username}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        user.username.slice(0, 1).toUpperCase()
                      )}
                    </div>
                  </button>

                  {/* Dropdown Menu Card (Exact match to genzxshop reference) */}
                  {isUserMenuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsUserMenuOpen(false)}
                      />
                      <div className="absolute right-0 mt-3 w-80 rounded-3xl bg-[#12131a]/98 backdrop-blur-2xl border border-white/10 p-4 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 space-y-3">
                        {/* Profile Header (Avatar + Username + Role) */}
                        <div className="flex items-center gap-3 px-1 pt-1">
                          <div className="w-12 h-12 rounded-full ring-2 ring-white/10 bg-white/10 border border-white/20 flex items-center justify-center font-extrabold text-white text-base shadow-md shrink-0 overflow-hidden">
                            {user.avatar ? (
                              /* eslint-disable-next-line @next/next/no-img-element */
                              <img
                                src={user.avatar}
                                alt={user.username}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              user.username.slice(0, 1).toUpperCase()
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="font-extrabold text-base text-white truncate tracking-tight">
                              {user.username}
                            </div>
                            <div className="text-xs text-neutral-400 font-light">
                              {user.role === "ADMIN" ? "ผู้ดูแลระบบ (ADMIN)" : "สมาชิก"}
                            </div>
                          </div>
                        </div>

                        {/* 2-Column Stats Grid (ยอดเงินคงเหลือ + แต้มสะสม) */}
                        <div className="grid grid-cols-2 gap-2.5">
                          {/* Balance Card */}
                          <div className="rounded-2xl bg-[#0c0d12] border border-white/5 p-3 space-y-0.5">
                            <div className="text-[11px] text-neutral-400 font-light">
                              ยอดเงินคงเหลือ
                            </div>
                            <div className="font-extrabold text-sm font-mono text-white">
                              {user.balance.toFixed(2)}{" "}
                              <span className="text-xs font-normal text-neutral-400">
                                บาท
                              </span>
                            </div>
                          </div>

                          {/* Points Card */}
                          <div className="rounded-2xl bg-[#0c0d12] border border-white/5 p-3 space-y-0.5">
                            <div className="text-[11px] text-neutral-400 font-light flex items-center gap-1">
                              <Star className="w-3 h-3 text-neutral-300 fill-neutral-300" />
                              <span>แต้มสะสม</span>
                            </div>
                            <div className="font-extrabold text-sm font-mono text-white">
                              {Math.floor(user.balance)}{" "}
                              <span className="text-xs font-normal text-neutral-400">
                                แต้ม
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Divider */}
                        <div className="border-t border-white/[0.08]" />

                        {/* Menu Items List - Grouped & Clean (genzxshop reference) */}
                        <div className="space-y-1 text-xs font-medium">
                          {/* Admin Dashboard (if admin) */}
                          {user.role === "ADMIN" && (
                            <Link
                              href="/admin"
                              onClick={() => setIsUserMenuOpen(false)}
                              className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 font-bold transition-colors mb-1.5"
                            >
                              <ShieldCheck className="w-4 h-4 shrink-0" />
                              <span>แผงควบคุมแอดมิน</span>
                            </Link>
                          )}

                          {/* Group 1: Store & Topup */}
                          <Link
                            href="/"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-neutral-300 hover:text-white hover:bg-white/[0.06] transition-colors"
                          >
                            <ShoppingBag className="w-4 h-4 text-neutral-400 shrink-0" />
                            <span>ร้านค้า</span>
                          </Link>

                          <Link
                            href="/topup"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-neutral-300 hover:text-white hover:bg-white/[0.06] transition-colors text-left cursor-pointer"
                          >
                            <Wallet className="w-4 h-4 text-neutral-400 shrink-0" />
                            <span>เติมเงิน</span>
                          </Link>

                          {/* Divider */}
                          <div className="border-t border-white/[0.08] my-1" />

                          {/* Group 2: History */}
                          <Link
                            href="/orders"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-neutral-300 hover:text-white hover:bg-white/[0.06] transition-colors"
                          >
                            <Clock className="w-4 h-4 text-neutral-400 shrink-0" />
                            <span>ประวัติสั่งซื้อ</span>
                          </Link>

                          <Link
                            href="/topup#history"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-neutral-300 hover:text-white hover:bg-white/[0.06] transition-colors"
                          >
                            <CreditCard className="w-4 h-4 text-neutral-400 shrink-0" />
                            <span>ประวัติเติมเงิน</span>
                          </Link>

                          {/* Divider */}
                          <div className="border-t border-white/[0.08] my-1" />

                          {/* Group 3: Profile & Logout */}
                          <Link
                            href="/account"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-neutral-300 hover:text-white hover:bg-white/[0.06] transition-colors text-left cursor-pointer"
                          >
                            <UserIcon className="w-4 h-4 text-neutral-400 shrink-0" />
                            <span>บัญชีของฉัน</span>
                          </Link>

                          <button
                            onClick={() => {
                              setIsUserMenuOpen(false);
                              logout();
                            }}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-neutral-400 hover:text-white hover:bg-white/[0.06] font-bold transition-colors text-left cursor-pointer mt-1"
                          >
                            <LogOut className="w-4 h-4 text-neutral-400 shrink-0" />
                            <span>ออกจากระบบ</span>
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
          ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/register"
                  className="px-3.5 py-1.5 rounded-xl text-xs font-medium text-neutral-300 hover:text-white bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 transition-colors"
                >
                  สมัครสมาชิก
                </Link>
                <Link
                  href="/login"
                  className="px-4 py-1.5 rounded-xl text-xs font-bold bg-white hover:bg-neutral-200 text-black transition-all shadow-md shadow-white/10 active:scale-95 flex items-center gap-1.5"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                  <span>เข้าสู่ระบบ</span>
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden w-8 h-8 sm:w-9 sm:h-9 rounded-xl border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] flex items-center justify-center text-neutral-300 hover:text-white cursor-pointer shrink-0"
              aria-label="เมนูหลัก"
            >
              {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden max-w-6xl mx-auto mt-2 rounded-2xl border border-white/[0.08] bg-[#0c0d12]/95 backdrop-blur-xl p-3.5 shadow-2xl flex flex-col gap-2.5 text-xs animate-in fade-in slide-in-from-top-2 duration-150">
            {/* User Profile / Auth Area in Mobile Drawer */}
            {user ? (
              <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-between">
                <Link
                  href="/account"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 min-w-0 flex-1 hover:opacity-90 transition-opacity"
                >
                  <div className="w-9 h-9 rounded-xl bg-neutral-800 border border-neutral-700 flex items-center justify-center font-bold text-white text-xs shrink-0 overflow-hidden">
                    {user.avatar ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
                    ) : (
                      user.username.slice(0, 1).toUpperCase()
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-white text-xs truncate">{user.username}</div>
                    <div className="text-[10px] text-neutral-400">
                      ยอดเงิน: <strong className="text-white font-mono">฿{user.balance.toFixed(2)}</strong>
                    </div>
                  </div>
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleProtectedNavigation("/topup", "เติมเงิน");
                  }}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 cursor-pointer shadow-sm bg-white text-black hover:bg-neutral-200"
                >
                  + เติมเงิน
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 p-1">
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-white font-medium text-xs text-center transition-colors"
                >
                  เข้าสู่ระบบ
                </Link>
                <Link
                  href="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full py-2.5 rounded-xl font-bold text-xs text-center shadow-md bg-white hover:bg-neutral-200 text-black"
                >
                  สมัครสมาชิกฟรี
                </Link>
              </div>
            )}

            {/* Navigation Links */}
            <div className="space-y-0.5">
              <Link
                href="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3.5 py-2.5 rounded-xl hover:bg-white/[0.06] text-neutral-200 flex items-center gap-2.5 font-medium"
              >
                <Home className="w-4 h-4 text-neutral-400" />
                <span>หน้าแรก</span>
              </Link>
              <Link
                href="/categories"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3.5 py-2.5 rounded-xl hover:bg-white/[0.06] text-neutral-200 flex items-center gap-2.5 font-medium"
              >
                <Layers className="w-4 h-4 text-neutral-400" />
                <span>หมวดหมู่สินค้า</span>
              </Link>
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleProtectedNavigation("/topup", "เติมเงิน");
                }}
                className="w-full text-left px-3.5 py-2.5 rounded-xl hover:bg-white/[0.06] text-neutral-200 flex items-center gap-2.5 font-medium cursor-pointer"
              >
                <Wallet className="w-4 h-4 text-white" />
                <span>เติมเงินเข้ากระเป๋า</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleProtectedNavigation("/orders", "ประวัติคำสั่งซื้อ");
                }}
                className="w-full text-left px-3.5 py-2.5 rounded-xl hover:bg-white/[0.06] text-neutral-200 flex items-center gap-2.5 font-medium cursor-pointer"
              >
                <Package className="w-4 h-4 text-neutral-400" />
                <span>คลังสินค้าของฉัน (คำสั่งซื้อ)</span>
              </button>
              <Link
                href="/reviews"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3.5 py-2.5 rounded-xl hover:bg-white/[0.06] text-neutral-200 flex items-center gap-2.5 font-medium"
              >
                <Star className="w-4 h-4 text-neutral-400" />
                <span>รีวิวจากลูกค้า</span>
              </Link>
              <Link
                href="/news"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3.5 py-2.5 rounded-xl hover:bg-white/[0.06] text-neutral-200 flex items-center gap-2.5 font-medium"
              >
                <Newspaper className="w-4 h-4 text-neutral-400" />
                <span>ข่าวสาร & โปรโมชั่น</span>
              </Link>
              <Link
                href="/docs"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3.5 py-2.5 rounded-xl hover:bg-white/[0.06] text-neutral-200 flex items-center gap-2.5 font-medium"
              >
                <BookOpen className="w-4 h-4 text-neutral-400" />
                <span>คู่มือการใช้งาน</span>
              </Link>
              <Link
                href="/support"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3.5 py-2.5 rounded-xl hover:bg-white/[0.06] text-neutral-200 flex items-center gap-2.5 font-medium"
              >
                <Headphones className="w-4 h-4 text-neutral-400" />
                <span>ศูนย์ช่วยเหลือ & เคลม</span>
              </Link>
            </div>

            {/* Theme Toggle row in Mobile Drawer */}
            <div className="pt-2 border-t border-white/[0.08]">
              <button
                onClick={(e) => toggleThemeMode(e)}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs font-medium text-neutral-200 cursor-pointer hover:bg-white/[0.06] transition-colors"
              >
                <div className="flex items-center gap-2">
                  {themeMode === "dark" ? (
                    <Sun className="w-4 h-4 text-amber-400" />
                  ) : (
                    <Moon className="w-4 h-4 text-indigo-400" />
                  )}
                  <span>โทนสีเว็บไซต์ ({themeMode === "dark" ? "โหมดมืด" : "โหมดสว่าง"})</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/[0.08] border border-white/10 text-neutral-300">
                  {themeMode === "dark" ? "สลับเป็นโหมดสว่าง ☀️" : "สลับเป็นโหมดมืด 🌙"}
                </span>
              </button>
            </div>

            {/* Logout button in mobile drawer if logged in */}
            {user && (
              <div className="pt-1">
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-white/[0.06] text-neutral-300 font-semibold text-xs hover:bg-white/[0.1] transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>ออกจากระบบ</span>
                </button>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Top Scrolling Marquee Announcement Bar (Edge-to-Edge genzxshop reference) */}
      <div className="w-full bg-[#0a0a0d] border-b border-white/[0.06] py-2 overflow-hidden flex items-center select-none relative z-20">
        <div className="animate-marquee flex items-center whitespace-nowrap">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="flex items-center gap-2 mr-16 shrink-0">
              <Bell className="w-3.5 h-3.5 text-neutral-400 fill-neutral-400 shrink-0" />
              <span suppressHydrationWarning className="text-xs text-neutral-300 font-normal tracking-wide">
                {setting?.shopNotice || "เติมเงินซื้อสินค้าแล้ว ไม่มีนโยบาย คืนเงินทุกกรณี"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Popups & Modals */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
      <SupportModal isOpen={isSupportOpen} onClose={() => setIsSupportOpen(false)} />
      <GuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
      <ContactModal isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />
    </>
  );
}
