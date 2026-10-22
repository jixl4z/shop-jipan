"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { ThemeColor, THEMES, ThemeConfig } from "@/lib/theme";

export interface UserSession {
  id: string;
  username: string;
  email?: string | null;
  role: string;
  balance: number;
}

export interface PublicSetting {
  shopName: string;
  shopSlogan: string;
  shopNotice: string;
  logoUrl?: string;
  bannerUrls: string[];
  themeColor: string;
  themeMode: string;
  promptPayNumber: string;
  promptPayName: string;
  truemoneyNumber?: string;
  turnstileEnabled?: boolean;
  turnstileSiteKey?: string;
  contactDiscord?: string;
  contactFacebook?: string;
  contactLine?: string;
}

interface ToastMessage {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

interface StoreContextType {
  user: UserSession | null;
  loadingUser: boolean;
  refreshUser: (initialUser?: UserSession | null) => Promise<void>;
  setting: PublicSetting | null;
  refreshSetting: () => Promise<void>;
  themeColor: ThemeColor;
  setThemeColor: (color: ThemeColor) => void;
  currentTheme: ThemeConfig;
  
  // Modals
  isAuthOpen: boolean;
  authTab: "login" | "register";
  openAuth: (tab?: "login" | "register") => void;
  closeAuth: () => void;

  isTopupOpen: boolean;
  openTopup: () => void;
  closeTopup: () => void;

  isMyOrdersOpen: boolean;
  openMyOrders: () => void;
  closeMyOrders: () => void;

  buyingProduct: any | null;
  openBuyModal: (product: any) => void;
  closeBuyModal: () => void;

  // Toast
  toasts: ToastMessage[];
  addToast: (message: string, type?: "success" | "error" | "info") => void;
  removeToast: (id: string) => void;

  logout: () => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [setting, setSetting] = useState<PublicSetting | null>(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem("jipan_shop_setting");
        if (cached) return JSON.parse(cached);
      } catch {}
    }
    return null;
  });
  const [themeColor, setThemeColorState] = useState<ThemeColor>("monochrome");

  // Modals
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState<"login" | "register">("login");
  const [isTopupOpen, setIsTopupOpen] = useState(false);
  const [isMyOrdersOpen, setIsMyOrdersOpen] = useState(false);
  const [buyingProduct, setBuyingProduct] = useState<any | null>(null);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (message: string, type: "success" | "error" | "info" = "info") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const refreshUser = async (initialUser?: UserSession | null) => {
    if (initialUser !== undefined) {
      setUser(initialUser);
      setLoadingUser(false);
      return;
    }
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        if (data && data.user) {
          setUser(data.user);
        }
      }
    } catch {
      // Do not wipe user session on temporary network drop or worker reload
    } finally {
      setLoadingUser(false);
    }
  };

  const refreshSetting = async () => {
    try {
      const res = await fetch("/api/settings");
      if (res.ok) {
        const data = await res.json();
        if (data.setting) {
          setSetting(data.setting);
          try {
            localStorage.setItem("jipan_shop_setting", JSON.stringify(data.setting));
          } catch {}
          // Sync theme if not overridden locally
          const savedTheme = localStorage.getItem("jipan_theme") as ThemeColor;
          if (savedTheme && THEMES[savedTheme]) {
            setThemeColorState(savedTheme);
          } else if (THEMES[data.setting.themeColor as ThemeColor]) {
            setThemeColorState(data.setting.themeColor as ThemeColor);
          }
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const setThemeColor = (color: ThemeColor) => {
    setThemeColorState(color);
    localStorage.setItem("jipan_theme", color);
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      addToast("ออกจากระบบเรียบร้อยแล้ว", "info");
    } catch {
      addToast("เกิดข้อผิดพลาดในการออกจากระบบ", "error");
    }
  };

  useEffect(() => {
    refreshUser();
    refreshSetting();
  }, []);

  const openAuth = (tab: "login" | "register" = "login") => {
    setAuthTab(tab);
    setIsAuthOpen(true);
  };
  const closeAuth = () => setIsAuthOpen(false);

  const openTopup = () => {
    if (!user) {
      openAuth("login");
      addToast("กรุณาเข้าสู่ระบบก่อนทำการเติมเงิน", "info");
      return;
    }
    setIsTopupOpen(true);
  };
  const closeTopup = () => setIsTopupOpen(false);

  const openMyOrders = () => {
    if (!user) {
      openAuth("login");
      addToast("กรุณาเข้าสู่ระบบก่อนดูประวัติการสั่งซื้อ", "info");
      return;
    }
    setIsMyOrdersOpen(true);
  };
  const closeMyOrders = () => setIsMyOrdersOpen(false);

  const openBuyModal = (prod: any) => {
    setBuyingProduct(prod);
  };
  const closeBuyModal = () => setBuyingProduct(null);

  const currentTheme = THEMES[themeColor] || THEMES.monochrome;

  return (
    <StoreContext.Provider
      value={{
        user,
        loadingUser,
        refreshUser,
        setting,
        refreshSetting,
        themeColor,
        setThemeColor,
        currentTheme,
        isAuthOpen,
        authTab,
        openAuth,
        closeAuth,
        isTopupOpen,
        openTopup,
        closeTopup,
        isMyOrdersOpen,
        openMyOrders,
        closeMyOrders,
        buyingProduct,
        openBuyModal,
        closeBuyModal,
        toasts,
        addToast,
        removeToast,
        logout,
      }}
    >
      {children}

      {/* Floating Toast Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            onClick={() => removeToast(t.id)}
            className={`pointer-events-auto px-4 py-3 rounded-xl shadow-2xl border text-sm flex items-center gap-3 backdrop-blur-md transition-all cursor-pointer ${
              t.type === "success"
                ? "bg-emerald-950/90 border-emerald-500/40 text-emerald-200"
                : t.type === "error"
                ? "bg-rose-950/90 border-rose-500/40 text-rose-200"
                : "bg-neutral-900/90 border-neutral-700 text-neutral-100"
            }`}
          >
            <span>{t.type === "success" ? "✅" : t.type === "error" ? "❌" : "ℹ️"}</span>
            <span className="flex-1 font-medium">{t.message}</span>
          </div>
        ))}
      </div>
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
}
