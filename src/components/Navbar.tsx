"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
} from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const {
    user,
    setting,
    openAuth,
    openTopup,
    logout,
    themeMode,
    toggleThemeMode,
    addToast,
  } = useStore();

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
      <header className="sticky top-0 z-40 px-4 sm:px-6 pt-3 sm:pt-4">
        <div className="max-w-6xl mx-auto rounded-2xl border border-white/[0.08] bg-[#0c0d12]/85 backdrop-blur-xl px-4 sm:px-6 h-16 flex items-center justify-between shadow-2xl shadow-black/50">
          {/* Brand Logo & Name */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-neutral-800 to-neutral-700 border border-neutral-700 flex items-center justify-center font-black text-white text-base shadow-md group-hover:scale-105 transition-transform overflow-hidden shrink-0">
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
              <span className="font-bold text-sm sm:text-base tracking-wide text-white truncate max-w-[130px] sm:max-w-none">
                {setting?.shopName || "JIPAN STORE"}
              </span>
              <span className="hidden sm:inline-flex items-center text-[10px] px-2 py-0.5 rounded-md font-mono uppercase tracking-wider bg-white/[0.06] text-neutral-300 border border-white/10">
                Auto 24h
              </span>
            </div>
          </Link>

          {/* Center Nav links (Desktop) */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/"
              className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                pathname === "/"
                  ? "bg-white/[0.08] text-white font-semibold"
                  : "text-neutral-400 hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              หน้าแรก
            </Link>
            <Link
              href="/categories"
              className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                pathname?.startsWith("/categories")
                  ? "bg-white/[0.08] text-white font-semibold"
                  : "text-neutral-400 hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              หมวดหมู่
            </Link>

            {/* Extra Features Dropdown (GenzX Inspired) */}
            <div className="relative">
              <button
                onClick={() => setIsExtraMenuOpen(!isExtraMenuOpen)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-sm font-medium transition-all duration-150 cursor-pointer ${
                  isExtraMenuOpen ||
                  ["/reviews", "/news", "/orders", "/topup", "/docs"].some((p) =>
                    pathname?.startsWith(p)
                  )
                    ? "bg-white/[0.08] text-white font-semibold"
                    : "text-neutral-400 hover:text-white hover:bg-white/[0.04]"
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
                      onClick={() => {
                        setIsExtraMenuOpen(false);
                        openTopup();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-neutral-300 hover:text-white hover:bg-white/[0.06] transition-colors text-left cursor-pointer"
                    >
                      <Wallet className="w-4 h-4 text-emerald-400 shrink-0" />
                      <div>
                        <div className="font-semibold text-white">เติมเงินอัตโนมัติ</div>
                        <div className="text-[10px] text-neutral-500">
                          พร้อมเพย์ & ทรูวอเล็ท 24 ชม.
                        </div>
                      </div>
                    </button>

                    <Link
                      href="/orders"
                      onClick={() => setIsExtraMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-neutral-300 hover:text-white hover:bg-white/[0.06] transition-colors"
                    >
                      <Package className="w-4 h-4 text-cyan-400 shrink-0" />
                      <div>
                        <div className="font-semibold text-white">คลังสินค้าของฉัน</div>
                        <div className="text-[10px] text-neutral-500">
                          เช็คโค้ด & รหัสคำสั่งซื้อ
                        </div>
                      </div>
                    </Link>

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
                      <Newspaper className="w-4 h-4 text-rose-400 shrink-0" />
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

          {/* Right Action Utilities */}
          <div className="flex items-center gap-2">
            {/* Quick Search Command Button */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.08] hover:border-white/15 text-neutral-400 hover:text-white transition-all cursor-pointer text-xs"
              title="ค้นหาสินค้า (Ctrl + K)"
            >
              <Search className="w-3.5 h-3.5 text-neutral-400" />
              <span className="hidden xl:inline text-neutral-400">ค้นหา...</span>
              <kbd className="hidden sm:inline-flex items-center gap-0.5 text-[10px] font-mono text-neutral-400 bg-white/[0.06] px-1.5 py-0.5 rounded border border-white/10">
                ⌘K
              </kbd>
            </button>

            {/* Theme Mode Toggle (Dark / Light with Circular Wipe Animation) */}
            <button
              onClick={(e) => toggleThemeMode(e)}
              className="w-8 h-8 rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.08] hover:border-white/15 flex items-center justify-center text-neutral-300 hover:text-white transition-all cursor-pointer text-xs group shrink-0"
              title={themeMode === "dark" ? "เปลี่ยนเป็นโหมดสว่าง (Light Mode)" : "เปลี่ยนเป็นโหมดมืด (Dark Mode)"}
              aria-label="เปลี่ยนโหมดสี"
            >
              {themeMode === "dark" ? (
                <Sun className="w-4 h-4 text-amber-400 group-hover:rotate-45 transition-transform duration-300" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-400 group-hover:-rotate-12 transition-transform duration-300" />
              )}
            </button>

            {/* Quick Contact Shortcut Button */}
            <button
              onClick={() => setIsContactOpen(true)}
              className="hidden min-[480px]:flex items-center justify-center w-8 h-8 rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.08] hover:border-white/15 text-neutral-400 hover:text-white transition-all cursor-pointer"
              title="ติดต่อทีมงาน / แจ้งปัญหา"
            >
              <Headphones className="w-3.5 h-3.5" />
            </button>

            {/* User Profile & Top-up CTA */}
            {user ? (
              <div className="flex items-center gap-2">
                {/* Direct Top-up Action Button */}
                <button
                  onClick={openTopup}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] border border-white/15 text-white text-xs font-medium transition-all cursor-pointer"
                  title="เติมเงินเข้าบัญชี"
                >
                  <Plus className="w-3.5 h-3.5 text-white" />
                  <span>เติมเงิน</span>
                </button>

                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 pl-1.5 pr-2.5 sm:pr-3 py-1 rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.08] hover:border-white/15 transition-all text-neutral-200 cursor-pointer group"
                  >
                    <div className="w-7 h-7 rounded-lg bg-neutral-800 border border-neutral-700 flex items-center justify-center overflow-hidden shrink-0">
                      <span className="font-bold text-xs text-white">
                        {user.username.slice(0, 1).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-xs font-medium text-white max-w-[80px] sm:max-w-[110px] truncate hidden min-[370px]:inline">
                      {user.username}
                    </span>
                    <span className="text-xs font-mono font-bold text-white px-2 py-0.5 rounded-md bg-white/[0.06] border border-white/10">
                      ฿{user.balance.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-neutral-400 group-hover:text-white transition-colors" />
                  </button>

                {/* Dropdown Menu Card */}
                {isUserMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 mt-3 w-72 rounded-2xl bg-neutral-900/95 backdrop-blur-2xl border border-neutral-800 p-4 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
                      {/* Profile Card Header */}
                      <div className="flex items-center justify-between pb-3.5 border-b border-neutral-800/90">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-neutral-800 to-neutral-700 border-2 border-neutral-700 flex items-center justify-center font-bold text-white text-sm shrink-0">
                            {user.username.slice(0, 1).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-sm text-white truncate">
                              {user.username}
                            </div>
                            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-neutral-800 border border-neutral-700/80 text-[10px] text-neutral-300 font-medium mt-0.5">
                              <UserIcon className="w-2.5 h-2.5" />
                              <span>{user.role === "ADMIN" ? "ADMIN" : "MEMBER"}</span>
                            </div>
                          </div>
                        </div>

                        {/* Balance */}
                        <div className="text-right shrink-0">
                          <div className="text-[10px] text-neutral-400">ยอดเงิน</div>
                          <div className="font-bold text-sm text-white font-mono">
                            ฿{user.balance.toFixed(2)}
                          </div>
                        </div>
                      </div>

                      {/* Dropdown Items List */}
                      <div className="pt-2 space-y-0.5 text-xs text-neutral-300 font-medium">
                        {user.role === "ADMIN" && (
                          <Link
                            href="/admin"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-2xl bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-colors font-semibold mb-1"
                          >
                            <ShieldCheck className="w-4 h-4 shrink-0" />
                            <span>แผงควบคุมแอดมิน</span>
                          </Link>
                        )}

                        <button
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            setIsProfileOpen(true);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-2xl hover:bg-neutral-800 hover:text-white transition-colors text-left cursor-pointer"
                        >
                          <UserCog className="w-4 h-4 text-neutral-400" />
                          <span>จัดการโปรไฟล์</span>
                        </button>

                        <Link
                          href="/orders"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-3 px-3 py-2 rounded-2xl hover:bg-neutral-800 hover:text-white transition-colors"
                        >
                          <Package className="w-4 h-4 text-neutral-400" />
                          <span>สถานะคำสั่งซื้อ (คลังของฉัน)</span>
                        </Link>

                        <button
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            setIsSupportOpen(true);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-2xl hover:bg-neutral-800 hover:text-white transition-colors text-left cursor-pointer"
                        >
                          <Headphones className="w-4 h-4 text-neutral-400" />
                          <span>ช่วยเหลือ & เคลมสินค้า</span>
                        </button>

                        <Link
                          href="/topup"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-3 px-3 py-2 rounded-2xl hover:bg-neutral-800 hover:text-white transition-colors"
                        >
                          <Wallet className="w-4 h-4 text-emerald-400" />
                          <span>เติมเงิน</span>
                        </Link>

                        <Link
                          href="/topup#history"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-3 px-3 py-2 rounded-2xl hover:bg-neutral-800 hover:text-white transition-colors"
                        >
                          <Receipt className="w-4 h-4 text-neutral-400" />
                          <span>ประวัติการเติมเงิน</span>
                        </Link>

                        <button
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            setIsGuideOpen(true);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-2xl hover:bg-neutral-800 hover:text-white transition-colors text-left cursor-pointer"
                        >
                          <BookOpen className="w-4 h-4 text-neutral-400" />
                          <span>คู่มือการใช้งาน</span>
                        </button>

                        <button
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            setIsContactOpen(true);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-2xl hover:bg-neutral-800 hover:text-white transition-colors text-left cursor-pointer"
                        >
                          <PhoneCall className="w-4 h-4 text-neutral-400" />
                          <span>ติดต่อเรา</span>
                        </button>

                        <div className="border-t border-neutral-800/80 my-1 pt-1">
                          <button
                            onClick={() => {
                              setIsUserMenuOpen(false);
                              logout();
                            }}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-2xl hover:bg-rose-500/10 text-rose-400 font-semibold transition-colors text-left cursor-pointer"
                          >
                            <LogOut className="w-4 h-4 shrink-0" />
                            <span>ออกจากระบบ</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openAuth("login")}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-medium text-neutral-300 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
                >
                  เข้าสู่ระบบ
                </button>
                <button
                  onClick={() => openAuth("register")}
                  className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-white text-black hover:bg-neutral-200 transition-all cursor-pointer shadow-md active:scale-95 btn-shine"
                >
                  สมัครสมาชิก
                </button>
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
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-neutral-800 border border-neutral-700 flex items-center justify-center font-bold text-white text-xs shrink-0">
                    {user.username.slice(0, 1).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-white text-xs truncate">{user.username}</div>
                    <div className="text-[10px] text-neutral-400">
                      ยอดเงิน: <strong className="text-white font-mono">฿{user.balance.toFixed(2)}</strong>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    openTopup();
                  }}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 cursor-pointer shadow-sm bg-white text-black hover:bg-neutral-200"
                >
                  + เติมเงิน
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 p-1">
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    openAuth("login");
                  }}
                  className="w-full py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-white font-medium text-xs text-center transition-colors cursor-pointer"
                >
                  เข้าสู่ระบบ
                </button>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    openAuth("register");
                  }}
                  className="w-full py-2.5 rounded-xl font-bold text-xs text-center cursor-pointer shadow-md bg-white text-black hover:bg-neutral-200"
                >
                  สมัครสมาชิกฟรี
                </button>
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
              <Link
                href="/topup"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3.5 py-2.5 rounded-xl hover:bg-white/[0.06] text-neutral-200 flex items-center gap-2.5 font-medium"
              >
                <Wallet className="w-4 h-4 text-white" />
                <span>เติมเงินเข้ากระเป๋า</span>
              </Link>
              <Link
                href="/orders"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3.5 py-2.5 rounded-xl hover:bg-white/[0.06] text-neutral-200 flex items-center gap-2.5 font-medium"
              >
                <Package className="w-4 h-4 text-neutral-400" />
                <span>คลังสินค้าของฉัน (คำสั่งซื้อ)</span>
              </Link>
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
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-rose-500/10 text-rose-400 font-semibold text-xs hover:bg-rose-500/20 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>ออกจากระบบ</span>
                </button>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Popups & Modals */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
      <SupportModal isOpen={isSupportOpen} onClose={() => setIsSupportOpen(false)} />
      <GuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
      <ContactModal isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />
    </>
  );
}
