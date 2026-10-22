"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
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
} from "lucide-react";

export default function Navbar() {
  const {
    user,
    setting,
    openAuth,
    openTopup,
    logout,
    themeColor,
    setThemeColor,
    currentTheme,
    addToast,
  } = useStore();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
      <header className="sticky top-0 z-40 px-3 pt-3">
        <div className="max-w-5xl mx-auto rounded-full border border-neutral-800/80 bg-neutral-900/85 backdrop-blur-xl px-3.5 sm:px-5 h-14 flex items-center justify-between shadow-2xl shadow-black/40">
          {/* Brand Logo & Name */}
          <Link href="/" className="flex items-center gap-2 group shrink-0">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-neutral-800 to-neutral-700 border border-neutral-700 flex items-center justify-center font-black text-white text-sm sm:text-base shadow-md group-hover:scale-105 transition-transform overflow-hidden shrink-0">
              {setting?.logoUrl && setting.logoUrl !== "/logo.png" ? (
                <img
                  src={setting.logoUrl}
                  alt={setting.shopName}
                  className="w-full h-full object-cover"
                />
              ) : (
                "⚡"
              )}
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
              <span className="font-bold text-xs sm:text-base tracking-wide text-white truncate max-w-[120px] sm:max-w-none">
                {setting?.shopName || "JIPAN STORE"}
              </span>
              <span className={`hidden sm:inline-block text-[10px] px-2 py-0.5 rounded-full font-mono uppercase tracking-wider border ${currentTheme.badgeBg}`}>
                Auto 24h
              </span>
            </div>
          </Link>

          {/* Center Nav links (Desktop) */}
          <nav className="hidden md:flex items-center gap-1 text-xs font-medium">
            <Link
              href="/"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-neutral-300 hover:text-white hover:bg-neutral-800/60 transition-colors"
            >
              <Home className="w-3.5 h-3.5" />
              <span>หน้าแรก</span>
            </Link>
            <Link
              href="/categories"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-neutral-300 hover:text-white hover:bg-neutral-800/60 transition-colors"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>หมวดหมู่</span>
            </Link>
            <Link
              href="/products"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-neutral-300 hover:text-white hover:bg-neutral-800/60 transition-colors"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>สินค้า</span>
            </Link>
            <Link
              href="/reviews"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-neutral-300 hover:text-white hover:bg-neutral-800/60 transition-colors"
            >
              <Star className="w-3.5 h-3.5 text-white/80" />
              <span>รีวิว</span>
            </Link>
            <Link
              href="/news"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-neutral-300 hover:text-white hover:bg-neutral-800/60 transition-colors"
            >
              <Newspaper className="w-3.5 h-3.5 text-white/80" />
              <span>ข่าวสาร</span>
            </Link>
            <Link
              href="/topup"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-neutral-300 hover:text-white hover:bg-neutral-800/60 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-white/80" />
              <span>เติมเงิน</span>
            </Link>
          </nav>

          {/* Right Action Utilities */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Quick Search Button */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
              title="ค้นหาสินค้า (Ctrl + K)"
            >
              <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            {/* Theme Switcher Dropdown (Desktop Only) */}
            <div className="relative hidden sm:block">
              <button
                onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
                className="w-9 h-9 rounded-full border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                title="เปลี่ยนสีธีมร้านค้า"
              >
                <Palette className="w-4 h-4" />
              </button>

              {isThemeMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsThemeMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-3 w-56 rounded-3xl bg-neutral-900 border border-neutral-800 p-2 shadow-2xl z-50">
                    <div className="text-xs font-semibold px-3 py-2 text-neutral-400">
                      เลือกสีธีมร้านค้า
                    </div>
                    {(Object.keys(THEMES) as ThemeColor[]).map((key) => {
                      const t = THEMES[key];
                      const isSelected = themeColor === key;
                      return (
                        <button
                          key={key}
                          onClick={() => {
                            setThemeColor(key);
                            setIsThemeMenuOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-2xl text-xs font-medium transition-colors ${
                            isSelected
                              ? "bg-neutral-800 text-white font-semibold"
                              : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-3.5 h-3.5 rounded-full border border-neutral-700 ${
                                key === "monochrome"
                                  ? "bg-white"
                                  : key === "purple"
                                  ? "bg-violet-500"
                                  : key === "emerald"
                                  ? "bg-emerald-500"
                                  : key === "blue"
                                  ? "bg-cyan-500"
                                  : key === "crimson"
                                  ? "bg-rose-500"
                                  : "bg-amber-400"
                              }`}
                            />
                            <span>{t.label}</span>
                          </div>
                          {isSelected && <span>✓</span>}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            {/* User Profile Pill & Dropdown (Or Auth Buttons) */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-1.5 sm:gap-2 pl-1 sm:pl-1.5 pr-2 sm:pr-3 py-1 rounded-full border border-neutral-800 bg-neutral-900/90 hover:bg-neutral-800 transition-all text-neutral-200 cursor-pointer group"
                >
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gradient-to-tr from-neutral-700 to-neutral-600 border border-neutral-600 flex items-center justify-center overflow-hidden shrink-0">
                    <span className="font-bold text-[10px] sm:text-xs text-white">
                      {user.username.slice(0, 1).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-white max-w-[60px] sm:max-w-[100px] truncate hidden min-[370px]:inline">
                    {user.username}
                  </span>
                  <span className="text-[10px] sm:text-xs font-mono font-bold text-emerald-400">
                    ฿{user.balance.toFixed(0)}
                  </span>
                  <ChevronDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-neutral-400 group-hover:text-white transition-colors" />
                </button>

                {/* Dropdown Menu Card (Matching User Screenshot!) */}
                {isUserMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 mt-3 w-72 rounded-3xl bg-neutral-900/95 backdrop-blur-2xl border border-neutral-800 p-4 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
                      {/* Profile Card Header */}
                      <div className="flex items-center justify-between pb-3.5 border-b border-neutral-800/90">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-neutral-800 to-neutral-700 border-2 border-neutral-700 flex items-center justify-center font-bold text-white text-sm shrink-0">
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
            ) : (
              <div className="flex items-center gap-1 sm:gap-2">
                <button
                  onClick={() => openAuth("login")}
                  className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-medium text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
                >
                  เข้าสู่ระบบ
                </button>
                <button
                  onClick={() => openAuth("register")}
                  className={`hidden sm:inline-block px-3.5 py-1.5 rounded-full text-xs font-semibold cursor-pointer shadow-md transition-all ${currentTheme.accent}`}
                >
                  สมัครสมาชิก
                </button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-neutral-800 bg-neutral-900 flex items-center justify-center text-neutral-300 hover:text-white cursor-pointer shrink-0"
              aria-label="เมนูหลัก"
            >
              {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden max-w-5xl mx-auto mt-2 rounded-3xl border border-neutral-800 bg-neutral-900/95 backdrop-blur-xl p-3 shadow-2xl flex flex-col gap-2 text-xs animate-in fade-in slide-in-from-top-2 duration-150">
            {/* User Profile / Auth Area in Mobile Drawer */}
            {user ? (
              <div className="p-3 rounded-2xl bg-neutral-950 border border-neutral-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center font-bold text-white text-xs shrink-0">
                    {user.username.slice(0, 1).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-white text-xs truncate">{user.username}</div>
                    <div className="text-[10px] text-neutral-400">
                      ยอดเงิน: <strong className="text-emerald-400 font-mono">฿{user.balance.toFixed(2)}</strong>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    openTopup();
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 cursor-pointer shadow-sm ${currentTheme.accent}`}
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
                  className="w-full py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-semibold text-xs text-center transition-colors cursor-pointer"
                >
                  เข้าสู่ระบบ
                </button>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    openAuth("register");
                  }}
                  className={`w-full py-2.5 rounded-xl font-bold text-xs text-center cursor-pointer shadow-md ${currentTheme.accent}`}
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
                className="px-3.5 py-2 rounded-xl hover:bg-neutral-800 text-neutral-200 flex items-center gap-2.5 font-medium"
              >
                <Home className="w-4 h-4 text-neutral-400" />
                <span>หน้าแรก</span>
              </Link>
              <Link
                href="/categories"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3.5 py-2 rounded-xl hover:bg-neutral-800 text-neutral-200 flex items-center gap-2.5 font-medium"
              >
                <Layers className="w-4 h-4 text-neutral-400" />
                <span>หมวดหมู่สินค้า</span>
              </Link>
              <Link
                href="/products"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3.5 py-2 rounded-xl hover:bg-neutral-800 text-neutral-200 flex items-center gap-2.5 font-medium"
              >
                <ShoppingBag className="w-4 h-4 text-neutral-400" />
                <span>สินค้าทั้งหมด</span>
              </Link>
              <Link
                href="/topup"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3.5 py-2 rounded-xl hover:bg-neutral-800 text-neutral-200 flex items-center gap-2.5 font-medium"
              >
                <Wallet className="w-4 h-4 text-emerald-400" />
                <span>เติมเงินเข้ากระเป๋า</span>
              </Link>
              <Link
                href="/orders"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3.5 py-2 rounded-xl hover:bg-neutral-800 text-neutral-200 flex items-center gap-2.5 font-medium"
              >
                <Package className="w-4 h-4 text-emerald-400" />
                <span>คลังสินค้าของฉัน (คำสั่งซื้อ)</span>
              </Link>
              <Link
                href="/reviews"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3.5 py-2 rounded-xl hover:bg-neutral-800 text-neutral-200 flex items-center gap-2.5 font-medium"
              >
                <Star className="w-4 h-4 text-amber-400" />
                <span>รีวิวจากลูกค้า</span>
              </Link>
              <Link
                href="/news"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3.5 py-2 rounded-xl hover:bg-neutral-800 text-neutral-200 flex items-center gap-2.5 font-medium"
              >
                <Newspaper className="w-4 h-4 text-cyan-400" />
                <span>ข่าวสาร & โปรโมชั่น</span>
              </Link>
              <Link
                href="/docs"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3.5 py-2 rounded-xl hover:bg-neutral-800 text-neutral-200 flex items-center gap-2.5 font-medium"
              >
                <BookOpen className="w-4 h-4 text-neutral-400" />
                <span>คู่มือการใช้งาน</span>
              </Link>
              <Link
                href="/support"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3.5 py-2 rounded-xl hover:bg-neutral-800 text-neutral-200 flex items-center gap-2.5 font-medium"
              >
                <Headphones className="w-4 h-4 text-neutral-400" />
                <span>ศูนย์ช่วยเหลือ & เคลม</span>
              </Link>
            </div>

            {/* Theme Picker in Mobile Drawer */}
            <div className="p-2.5 rounded-2xl bg-neutral-950 border border-neutral-800/80">
              <div className="text-[11px] text-neutral-400 font-medium mb-2 px-1 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-neutral-400" />
                <span>เลือกสีธีมร้านค้า</span>
              </div>
              <div className="flex items-center justify-between gap-1 px-1">
                {(Object.keys(THEMES) as ThemeColor[]).map((key) => {
                  const isSelected = themeColor === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setThemeColor(key)}
                      className={`flex-1 py-1.5 rounded-xl border flex items-center justify-center transition-all ${
                        isSelected
                          ? "border-white bg-neutral-800 shadow"
                          : "border-neutral-800 bg-neutral-900"
                      }`}
                      title={THEMES[key].label}
                    >
                      <span
                        className={`w-3.5 h-3.5 rounded-full ${
                          key === "monochrome"
                            ? "bg-white"
                            : key === "purple"
                            ? "bg-violet-500"
                            : key === "emerald"
                            ? "bg-emerald-500"
                            : key === "blue"
                            ? "bg-cyan-500"
                            : key === "crimson"
                            ? "bg-rose-500"
                            : "bg-amber-400"
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
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
