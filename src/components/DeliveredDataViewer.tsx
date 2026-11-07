"use client";

import React, { useState } from "react";
import { copyToClipboard, parseDeliveredItems, ParsedItem } from "@/lib/clipboard";
import { Copy, Check, ShieldCheck, Key, User, Layers } from "lucide-react";

interface DeliveredDataViewerProps {
  deliveredData: string;
  quantity?: number;
  className?: string;
  onCopiedToast?: (msg: string) => void;
}

export default function DeliveredDataViewer({
  deliveredData,
  quantity = 1,
  className = "",
  onCopiedToast,
}: DeliveredDataViewerProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const items: ParsedItem[] = parseDeliveredItems(deliveredData);
  const isMultiple = items.length > 1 || quantity > 1;

  const handleCopy = async (key: string, text: string, label: string) => {
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopiedKey(key);
      if (onCopiedToast) {
        onCopiedToast(`คัดลอก ${label} เรียบร้อยแล้ว`);
      }
      setTimeout(() => {
        setCopiedKey((curr) => (curr === key ? null : curr));
      }, 2000);
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Top Header Controls */}
      <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-white/[0.08]">
        <div className="flex items-center gap-2 text-xs font-semibold text-neutral-300">
          <ShieldCheck className="w-4 h-4 text-white" />
          <span>
            ข้อมูลสินค้าที่ได้รับ {isMultiple ? `(${items.length} รายการ)` : ""}
          </span>
        </div>

        {/* Copy All Button (Especially useful when buying multiple items) */}
        {isMultiple && (
          <button
            type="button"
            onClick={() => handleCopy("all", deliveredData, "ข้อมูลทั้งหมด")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-95"
            title="คัดลอกข้อมูลสินค้าทุกชิ้นในคำสั่งซื้อนี้"
          >
            {copiedKey === "all" ? (
              <>
                <Check className="w-3.5 h-3.5 text-white" />
                <span>คัดลอกทั้งหมดแล้ว</span>
              </>
            ) : (
              <>
                <Layers className="w-3.5 h-3.5" />
                <span>คัดลอกทั้งหมด ({items.length})</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Item Cards List */}
      <div className="space-y-2.5">
        {items.map((item, index) => {
          const itemKey = `item-${index}`;
          const isItemCopied = copiedKey === itemKey;
          const userKey = `user-${index}`;
          const isUserCopied = copiedKey === userKey;
          const passKey = `pass-${index}`;
          const isPassCopied = copiedKey === passKey;

          return (
            <div
              key={index}
              className="p-3.5 sm:p-4 rounded-2xl bg-neutral-950/90 border border-white/[0.08] hover:border-white/20 transition-all space-y-2.5 shadow-md group relative"
            >
              {/* Item Header (for multiple items) */}
              {isMultiple && (
                <div className="flex items-center justify-between gap-2 text-[11px]">
                  <span className="font-mono px-2 py-0.5 rounded-md bg-white/10 border border-white/15 text-neutral-200 font-bold">
                    ชิ้นที่ #{index + 1}
                  </span>
                  <span className="text-neutral-500 text-[10px]">
                    คลิกปุ่มเพื่อคัดลอก หรือลากคลุมข้อความได้อิสระ
                  </span>
                </div>
              )}

              {/* Formatted Credential Mode (If line is user:pass or user|pass) */}
              {item.isCredential && item.username && item.password ? (
                <div className="space-y-2">
                  {/* Account / Username Row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-xl bg-neutral-900/80 border border-white/[0.05]">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <User className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                      <span className="text-[11px] text-neutral-400 shrink-0">บัญชี/อีเมล:</span>
                      <span className="font-mono text-xs sm:text-sm text-white select-text truncate font-medium">
                        {item.username}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(userKey, item.username!, "อีเมล/ไอดี")}
                      className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-neutral-200 hover:text-white text-[11px] font-semibold transition-all flex items-center justify-center gap-1 cursor-pointer shrink-0 active:scale-95"
                    >
                      {isUserCopied ? (
                        <>
                          <Check className="w-3 h-3 text-white" />
                          <span>คัดลอกแล้ว</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>คัดลอกเมล</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Password Row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-xl bg-neutral-900/80 border border-white/[0.05]">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <Key className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                      <span className="text-[11px] text-neutral-400 shrink-0">รหัสผ่าน:</span>
                      <span className="font-mono text-xs sm:text-sm text-white select-text truncate font-medium">
                        {item.password}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(passKey, item.password!, "รหัสผ่าน")}
                      className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-neutral-200 hover:text-white text-[11px] font-semibold transition-all flex items-center justify-center gap-1 cursor-pointer shrink-0 active:scale-95"
                    >
                      {isPassCopied ? (
                        <>
                          <Check className="w-3 h-3 text-white" />
                          <span>คัดลอกแล้ว</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>คัดลอกรหัส</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Quick Copy Full Row */}
                  <div className="flex justify-end pt-0.5">
                    <button
                      type="button"
                      onClick={() => handleCopy(itemKey, item.raw, `ชิ้นที่ #${index + 1}`)}
                      className="text-[11px] text-neutral-400 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer py-0.5 px-1"
                    >
                      {isItemCopied ? (
                        <>
                          <Check className="w-3 h-3 text-white" />
                          <span className="text-white font-medium">คัดลอกทั้งแถวแล้ว</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>คัดลอกทั้งแถว (เมล:รหัส)</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                /* Raw text/key display (NO select-all, completely natural select-text!) */
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div
                    onClick={() => handleCopy(itemKey, item.raw, isMultiple ? `ชิ้นที่ #${index + 1}` : "ข้อมูลสินค้า")}
                    className="flex-1 p-3 rounded-xl bg-neutral-900/90 border border-white/[0.06] hover:border-white/20 text-white font-mono text-xs sm:text-sm leading-relaxed whitespace-pre-wrap break-all select-text cursor-pointer transition-colors"
                    title="คลิกเพื่อคัดลอก หรือลากเมาส์คลุมข้อความเฉพาะส่วนที่ต้องการได้อิสระ"
                  >
                    {item.raw}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopy(itemKey, item.raw, isMultiple ? `ชิ้นที่ #${index + 1}` : "ข้อมูลสินค้า")}
                    className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white text-white hover:text-black text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0 active:scale-95 shadow-sm"
                  >
                    {isItemCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>คัดลอกแล้ว</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>คัดลอก</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="text-[11px] text-neutral-500 flex items-center justify-between pt-1">
        <span>* สามารถใช้เมาส์หรือนิ้วลากคลุมเพื่อก๊อปปี้เฉพาะส่วนที่ต้องการได้อิสระ</span>
        <span className="font-mono text-[10px] text-neutral-400">JIPAN SECURE VAULT</span>
      </div>
    </div>
  );
}
