"use client";

import React, { useEffect, useState } from "react";
import { Settings, Save, CheckCircle2, Shield, QrCode, Palette, Bell, Loader2 } from "lucide-react";
import { THEMES, ThemeColor } from "@/lib/theme";
import { useStore } from "@/context/StoreContext";

export default function AdminSettingsPage() {
  const { refreshSetting, setThemeColor } = useStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const [shopName, setShopName] = useState("");
  const [shopSlogan, setShopSlogan] = useState("");
  const [shopNotice, setShopNotice] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [bannerUrlsText, setBannerUrlsText] = useState("");
  const [themeColorState, setThemeColorState] = useState<ThemeColor>("monochrome");
  const [promptPayNumber, setPromptPayNumber] = useState("");
  const [promptPayName, setPromptPayName] = useState("");
  const [truemoneyNumber, setTruemoneyNumber] = useState("");
  const [slipProvider, setSlipProvider] = useState("slipok");
  const [slipApiKey, setSlipApiKey] = useState("");
  const [slipApiBranch, setSlipApiBranch] = useState("");
  const [contactDiscord, setContactDiscord] = useState("");
  const [contactFacebook, setContactFacebook] = useState("");
  const [contactLine, setContactLine] = useState("");
  const [turnstileEnabled, setTurnstileEnabled] = useState(false);
  const [turnstileSiteKey, setTurnstileSiteKey] = useState("");
  const [turnstileSecretKey, setTurnstileSecretKey] = useState("");
  const [discordWebhookUrl, setDiscordWebhookUrl] = useState("");
  const [discordClientId, setDiscordClientId] = useState("");
  const [discordClientSecret, setDiscordClientSecret] = useState("");
  const [googleClientId, setGoogleClientId] = useState("");
  const [googleClientSecret, setGoogleClientSecret] = useState("");

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.setting) {
          const s = data.setting;
          setShopName(s.shopName || "");
          setShopSlogan(s.shopSlogan || "");
          setShopNotice(s.shopNotice || "");
          setLogoUrl(s.logoUrl && s.logoUrl !== "/logo.png" ? s.logoUrl : "");
          try {
            const parsedBanners = JSON.parse(s.bannerUrls || "[]");
            if (Array.isArray(parsedBanners)) {
              setBannerUrlsText(parsedBanners.join("\n"));
            }
          } catch {
            setBannerUrlsText("");
          }
          setThemeColorState((s.themeColor as ThemeColor) || "monochrome");
          setPromptPayNumber(s.promptPayNumber || "");
          setPromptPayName(s.promptPayName || "");
          setTruemoneyNumber(s.truemoneyNumber || "");
          setSlipProvider(s.slipProvider || "slipok");
          setSlipApiKey(s.slipApiKey || "");
          setSlipApiBranch(s.slipApiBranch || "");
          setContactDiscord(s.contactDiscord || "");
          setContactFacebook(s.contactFacebook || "");
          setContactLine(s.contactLine || "");
          setTurnstileEnabled(!!s.turnstileEnabled);
          setTurnstileSiteKey(s.turnstileSiteKey || "");
          setTurnstileSecretKey(s.turnstileSecretKey || "");
          setDiscordWebhookUrl(s.discordWebhookUrl || "");
          setDiscordClientId(s.discordClientId || "");
          setDiscordClientSecret(s.discordClientSecret || "");
          setGoogleClientId(s.googleClientId || "");
          setGoogleClientSecret(s.googleClientSecret || "");
        }
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg("");

    try {
      const bannerList = bannerUrlsText
        .split("\n")
        .map((u) => u.trim())
        .filter((u) => u.length > 0);

      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shopName,
          shopSlogan,
          shopNotice,
          logoUrl: logoUrl.trim() || "/logo.png",
          bannerUrls: JSON.stringify(bannerList),
          themeColor: themeColorState,
          promptPayNumber,
          promptPayName,
          truemoneyNumber,
          slipProvider,
          slipApiKey,
          slipApiBranch,
          contactDiscord,
          contactFacebook,
          contactLine,
          turnstileEnabled,
          turnstileSiteKey,
          turnstileSecretKey,
          discordWebhookUrl,
          discordClientId,
          discordClientSecret,
          googleClientId,
          googleClientSecret,
        }),
      });

      const resData = await res.json();
      if (res.ok) {
        setSuccessMsg("บันทึกการตั้งค่าร้านค้าเรียบร้อยแล้ว!");
        setThemeColor(themeColorState);
        await refreshSetting();
        setTimeout(() => setSuccessMsg(""), 3500);
      } else {
        alert(resData.error || "บันทึกไม่สำเร็จ");
      }
    } catch {
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3 text-neutral-400 text-xs">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
        <span>กำลังโหลดการตั้งค่า...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          ตั้งค่าร้านค้า & ระบบชำระเงิน
        </h1>
        <p className="text-xs text-neutral-400 mt-0.5">
          ปรับแต่งข้อมูลร้านค้า, โลโก้, แบนเนอร์, สีธีม, หมายเลขพร้อมเพย์ และ API ตรวจสลิปอัตโนมัติ
        </p>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        {/* General Store Info */}
        <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4">
          <h2 className="font-bold text-sm text-white flex items-center gap-2">
            <Settings className="w-4 h-4 text-neutral-400" />
            <span>ข้อมูลพื้นฐานของร้านค้า & แบนเนอร์</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-neutral-300 font-medium mb-1.5">
                ชื่อร้านค้า (Shop Name)
              </label>
              <input
                type="text"
                required
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                placeholder="เช่น JIPAN STORE"
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-neutral-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-neutral-300 font-medium mb-1.5">
                สโลแกนร้านค้า
              </label>
              <input
                type="text"
                value={shopSlogan}
                onChange={(e) => setShopSlogan(e.target.value)}
                placeholder="เช่น ระบบอัตโนมัติ 24 ชม. สลิปเข้าทันที"
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-neutral-500 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-neutral-300 font-medium mb-1.5">
              ข้อความประกาศหน้าเว็บ (Notice Bar)
            </label>
            <input
              type="text"
              value={shopNotice}
              onChange={(e) => setShopNotice(e.target.value)}
              placeholder="เช่น เปิดร้านใหม่ ลดสูงสุด 30% ทุกหมวดหมู่..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-neutral-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-neutral-300 font-medium mb-1.5">
              ลิงก์รูปภาพโลโก้ร้านค้า (Logo Image URL - เว้นว่างเพื่อใช้ไอคอน ⚡ เริ่มต้น)
            </label>
            <input
              type="text"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="เช่น https://.../logo.png หรือ /logo.png"
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono focus:outline-none focus:border-neutral-500 text-xs"
            />
          </div>

          <div>
            <label className="block text-neutral-300 font-medium mb-1.5">
              ลิงก์รูปภาพแบนเนอร์สไลด์หน้าแรก (1 ลิงก์ต่อ 1 บรรทัด - เว้นว่างเพื่อใช้แบนเนอร์เริ่มต้น)
            </label>
            <textarea
              rows={3}
              value={bannerUrlsText}
              onChange={(e) => setBannerUrlsText(e.target.value)}
              placeholder={"https://images.unsplash.com/photo-1550745165-9bc0b252726f\nhttps://images.unsplash.com/photo-1542751371-adc38448a05e"}
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono focus:outline-none focus:border-neutral-500 text-xs"
            />
          </div>
        </div>

        {/* Theme Color Customization */}
        <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4">
          <h2 className="font-bold text-sm text-white flex items-center gap-2">
            <Palette className="w-4 h-4 text-neutral-400" />
            <span>ปรับแต่งโทนสีร้านค้า (Theme Color)</span>
          </h2>
          <p className="text-[11px] text-neutral-400">
            เลือกธีมสีหลักสำหรับปุ่ม การ์ด และเอฟเฟกต์แสงทั่วทั้งเว็บไซต์
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {(Object.keys(THEMES) as ThemeColor[]).map((key) => {
              const t = THEMES[key];
              const isSelected = themeColorState === key;
              return (
                <div
                  key={key}
                  onClick={() => setThemeColorState(key)}
                  className={`p-3 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-all ${
                    isSelected
                      ? "bg-neutral-800 border-white shadow-lg"
                      : "bg-neutral-950 border-neutral-800 hover:border-neutral-700"
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-full border border-neutral-700 shrink-0 ${
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
                  <div className="truncate font-medium text-white">{t.label}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* PromptPay & Slip Verification Settings */}
        <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4">
          <h2 className="font-bold text-sm text-white flex items-center gap-2">
            <QrCode className="w-4 h-4 text-emerald-400" />
            <span>ตั้งค่าบัญชีธนาคาร / พร้อมเพย์ & ระบบตรวจสลิป (Payment & Slip API)</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-neutral-300 font-medium mb-1.5">
                เลขที่บัญชีธนาคาร (ทีเอ็มบีธนชาต) หรือ หมายเลขพร้อมเพย์ *
              </label>
              <input
                type="text"
                required
                value={promptPayNumber}
                onChange={(e) => setPromptPayNumber(e.target.value)}
                placeholder="เช่น 9247611867"
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono focus:outline-none focus:border-neutral-500 text-sm"
              />
              <p className="text-[11px] text-neutral-500 mt-1">
                *หากใส่เลขบัญชีทีเอ็มบีธนชาต ระบบจะแสดงเป็นการโอนธนาคาร ttb พร้อมปุ่มคัดลอกเลขบัญชีให้อัตโนมัติ
              </p>
            </div>

            <div>
              <label className="block text-neutral-300 font-medium mb-1.5">
                ชื่อบัญชีผู้รับเงิน *
              </label>
              <input
                type="text"
                required
                value={promptPayName}
                onChange={(e) => setPromptPayName(e.target.value)}
                placeholder="เช่น จิรกิจ ปานศรี"
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-neutral-500 text-sm"
              />
              <p className="text-[11px] text-neutral-500 mt-1">
                *ชื่อบัญชีที่ปรากฏในแอปธนาคาร เพื่อให้ลูกค้าตรวจสอบก่อนกดยืนยันโอน
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-neutral-800/80">
            <label className="block text-neutral-300 font-medium mb-1.5">
              เบอร์โทรศัพท์ TrueMoney Wallet สำหรับรับซองของขวัญ (ซองอั่งเปา) *
            </label>
            <input
              type="text"
              value={truemoneyNumber}
              onChange={(e) => setTruemoneyNumber(e.target.value)}
              placeholder="เช่น 0812345678 (เบอร์ Wallet ของร้านค้า)"
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono focus:outline-none focus:border-neutral-500 text-sm"
            />
            <p className="text-[11px] text-neutral-500 mt-1">
              *เมื่อลูกค้าส่งลิงก์ซองของขวัญ TrueMoney ระบบจะยิง API รับเงินเข้าเบอร์นี้อัตโนมัติทันที
            </p>
          </div>

          <div className="pt-2 border-t border-neutral-800/80">
            <label className="block text-neutral-300 font-medium mb-1.5">
              ผู้ให้บริการตรวจสลิป (Slip Verification Provider)
            </label>
            <select
              value={slipProvider}
              onChange={(e) => setSlipProvider(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-neutral-500 text-sm mb-3"
            >
              <option value="simulation">
                โหมดทดสอบจำลอง (Simulation Mode - ไม่ต้องใส่ API Key ทดสอบได้ทันที)
              </option>
              <option value="slipok">SlipOK (แนะนำสำหรับไทย - api.slipok.com)</option>
              <option value="easyslip">EasySlip (developer.easyslip.com)</option>
              <option value="openslipcheck">OpenSlipCheck (api.openslipcheck.com)</option>
            </select>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-neutral-300 font-medium mb-1.5">
                  API Key ของผู้ให้บริการตรวจสลิป
                </label>
                <input
                  type="password"
                  value={slipApiKey}
                  onChange={(e) => setSlipApiKey(e.target.value)}
                  placeholder="เช่น slp_live_xxxxxxxx..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono focus:outline-none focus:border-neutral-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-neutral-300 font-medium mb-1.5">
                  Branch ID / รหัสสาขา (ถ้ามี เช่น สำหรับ SlipOK)
                </label>
                <input
                  type="text"
                  value={slipApiBranch}
                  onChange={(e) => setSlipApiBranch(e.target.value)}
                  placeholder="เช่น 1459"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono focus:outline-none focus:border-neutral-500 text-sm"
                />
              </div>
            </div>
            <p className="text-[11px] text-neutral-500 mt-2">
              *หากยังไม่มี API Key สามารถเลือก &quot;โหมดทดสอบจำลอง (Simulation)&quot; เพื่อทดลองอัปโหลดสลิปและให้เงินเข้ากระเป๋าได้ทันที
            </p>
          </div>
        </div>

        {/* Contact Links */}
        <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4">
          <h2 className="font-bold text-sm text-white">ช่องทางติดต่อร้านค้า (Contact Links)</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-neutral-300 font-medium mb-1">LINE Official Link</label>
              <input
                type="text"
                value={contactLine}
                onChange={(e) => setContactLine(e.target.value)}
                placeholder="https://line.me/ti/p/..."
                className="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-neutral-500"
              />
            </div>
            <div>
              <label className="block text-neutral-300 font-medium mb-1">Discord Invite Link</label>
              <input
                type="text"
                value={contactDiscord}
                onChange={(e) => setContactDiscord(e.target.value)}
                placeholder="https://discord.gg/..."
                className="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-neutral-500"
              />
            </div>
            <div>
              <label className="block text-neutral-300 font-medium mb-1">Facebook Fanpage</label>
              <input
                type="text"
                value={contactFacebook}
                onChange={(e) => setContactFacebook(e.target.value)}
                placeholder="https://facebook.com/..."
                className="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-neutral-500"
              />
            </div>
          </div>
        </div>

        {/* Cloudflare Turnstile Protection */}
        <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-sm text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-cyan-400" />
              <span>ระบบป้องกันบอท Cloudflare Turnstile</span>
            </h2>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={turnstileEnabled}
                onChange={(e) => setTurnstileEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
              <span className="ml-2.5 text-xs text-neutral-300">
                {turnstileEnabled ? "เปิดใช้งาน (Active)" : "ปิดการใช้งาน"}
              </span>
            </label>
          </div>
          <p className="text-[11px] text-neutral-400">
            ระบบตรวจสอบผู้ใช้งานอัจฉริยะจาก Cloudflare (CAPTCHA แบบไม่รบกวนผู้ใช้) ป้องกันการสมัครสแปมและยิง Login จากบอท
          </p>

          {turnstileEnabled && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-neutral-800">
              <div>
                <label className="block text-neutral-300 font-medium mb-1.5">
                  Turnstile Site Key (ฝั่ง Client)
                </label>
                <input
                  type="text"
                  value={turnstileSiteKey}
                  onChange={(e) => setTurnstileSiteKey(e.target.value)}
                  placeholder="0x4AAAAAA..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono focus:outline-none focus:border-cyan-500 text-xs"
                />
              </div>
              <div>
                <label className="block text-neutral-300 font-medium mb-1.5">
                  Turnstile Secret Key (ฝั่ง Server)
                </label>
                <input
                  type="password"
                  value={turnstileSecretKey}
                  onChange={(e) => setTurnstileSecretKey(e.target.value)}
                  placeholder="0x4AAAAAA..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono focus:outline-none focus:border-cyan-500 text-xs"
                />
              </div>
            </div>
          )}
        </div>

        {/* Discord Webhook Notification */}
        <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4">
          <h2 className="font-bold text-sm text-white flex items-center gap-2">
            <Bell className="w-4 h-4 text-violet-400" />
            <span>การแจ้งเตือน Discord Webhook (แจ้งเตือนยอดเงิน & คำสั่งซื้อ)</span>
          </h2>
          <p className="text-[11px] text-neutral-400">
            แจ้งเตือนแอดมินทันทีผ่านห้อง Discord เมื่อมีลูกค้าเติมเงินสำเร็จ หรือเมื่อมีการสั่งซื้อสินค้า
          </p>
          <div>
            <label className="block text-neutral-300 font-medium mb-1.5">
              Discord Webhook URL
            </label>
            <input
              type="text"
              value={discordWebhookUrl}
              onChange={(e) => setDiscordWebhookUrl(e.target.value)}
              placeholder="https://discord.com/api/webhooks/..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono focus:outline-none focus:border-violet-500 text-xs"
            />
            <p className="text-[11px] text-neutral-500 mt-1">
              *ปล่อยว่างไว้หากยังไม่ต้องการแจ้งเตือนเข้า Discord
            </p>
          </div>
        </div>

        {/* Discord & Google OAuth Login Settings */}
        <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4">
          <div>
            <h2 className="font-bold text-sm text-white flex items-center gap-2">
              <span className="text-base">🔑</span>
              <span>ตั้งค่าเข้าสู่ระบบด้วย Discord & Google (OAuth 2.0 Social Login)</span>
            </h2>
            <p className="text-[11px] text-neutral-400 mt-1">
              ให้ลูกค้ากดปุ่มเดียวเพื่อสมัครหรือเข้าสู่ระบบผ่านบัญชี Discord หรือ Google ได้ทันที (ฟรี ไม่มีค่าใช้จ่าย)
            </p>
          </div>

          {/* Discord OAuth */}
          <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800/80 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="font-bold text-xs text-[#5865F2] flex items-center gap-1.5">
                <span>💬</span>
                <span>Discord OAuth 2.0 Configuration</span>
              </span>
              <div className="flex items-center gap-2 bg-neutral-900 px-2.5 py-1 rounded-lg border border-neutral-800 text-[11px] font-mono text-neutral-300">
                <span className="text-neutral-500">Redirect URI:</span>
                <span className="text-amber-300">
                  {typeof window !== "undefined" ? window.location.origin : "https://โดเมนของคุณ"}/api/auth/discord/callback
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const uri = `${window.location.origin}/api/auth/discord/callback`;
                    navigator.clipboard.writeText(uri);
                    alert("คัดลอก Redirect URI แล้ว:\n" + uri);
                  }}
                  className="ml-1 text-[10px] px-1.5 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-white cursor-pointer"
                >
                  คัดลอก
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-neutral-300 font-medium mb-1">
                  Discord Client ID
                </label>
                <input
                  type="text"
                  value={discordClientId}
                  onChange={(e) => setDiscordClientId(e.target.value)}
                  placeholder="เช่น 123456789012345678"
                  className="w-full px-3.5 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-white font-mono focus:outline-none focus:border-[#5865F2] text-xs"
                />
              </div>
              <div>
                <label className="block text-neutral-300 font-medium mb-1">
                  Discord Client Secret
                </label>
                <input
                  type="password"
                  value={discordClientSecret}
                  onChange={(e) => setDiscordClientSecret(e.target.value)}
                  placeholder="••••••••••••••••••••"
                  className="w-full px-3.5 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-white font-mono focus:outline-none focus:border-[#5865F2] text-xs"
                />
              </div>
            </div>
          </div>

          {/* Google OAuth */}
          <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800/80 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="font-bold text-xs text-[#4285F4] flex items-center gap-1.5">
                <span>🌐</span>
                <span>Google OAuth 2.0 Configuration</span>
              </span>
              <div className="flex items-center gap-2 bg-neutral-900 px-2.5 py-1 rounded-lg border border-neutral-800 text-[11px] font-mono text-neutral-300">
                <span className="text-neutral-500">Redirect URI:</span>
                <span className="text-amber-300">
                  {typeof window !== "undefined" ? window.location.origin : "https://โดเมนของคุณ"}/api/auth/google/callback
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const uri = `${window.location.origin}/api/auth/google/callback`;
                    navigator.clipboard.writeText(uri);
                    alert("คัดลอก Redirect URI แล้ว:\n" + uri);
                  }}
                  className="ml-1 text-[10px] px-1.5 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-white cursor-pointer"
                >
                  คัดลอก
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-neutral-300 font-medium mb-1">
                  Google Client ID
                </label>
                <input
                  type="text"
                  value={googleClientId}
                  onChange={(e) => setGoogleClientId(e.target.value)}
                  placeholder="xxx.apps.googleusercontent.com"
                  className="w-full px-3.5 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-white font-mono focus:outline-none focus:border-[#4285F4] text-xs"
                />
              </div>
              <div>
                <label className="block text-neutral-300 font-medium mb-1">
                  Google Client Secret
                </label>
                <input
                  type="password"
                  value={googleClientSecret}
                  onChange={(e) => setGoogleClientSecret(e.target.value)}
                  placeholder="••••••••••••••••••••"
                  className="w-full px-3.5 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-white font-mono focus:outline-none focus:border-[#4285F4] text-xs"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-3 rounded-2xl bg-white text-black font-bold text-sm flex items-center justify-center gap-2 hover:bg-neutral-200 transition-all shadow-xl cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? "กำลังบันทึกข้อมูล..." : "บันทึกการตั้งค่าทั้งหมด"}</span>
        </button>
      </form>
    </div>
  );
}
