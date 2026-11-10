"use client";

import React, { useState } from "react";
import { copyToClipboard } from "@/lib/clipboard";
import { Copy, Check, ShieldCheck, ExternalLink, Layers } from "lucide-react";

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

  // Split lines into raw items without any invasive credential parsing
  const rawItems = (deliveredData || "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const items = rawItems.length > 0 ? rawItems : [deliveredData || ""];
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
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
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
                <Check className="w-3.5 h-3.5 text-emerald-400" />
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
        {items.map((rawText, index) => {
          const itemKey = `item-${index}`;
          const isItemCopied = copiedKey === itemKey;
          const isUrl = rawText.startsWith("http://") || rawText.startsWith("https://");

          return (
            <div
              key={index}
              className="p-3 sm:p-3.5 rounded-2xl bg-neutral-950/90 border border-white/[0.08] hover:border-white/20 transition-all space-y-2 shadow-md group relative"
            >
              {/* Item Header (for multiple items) */}
              {isMultiple && (
                <div className="flex items-center justify-between gap-2 text-[11px]">
                  <span className="font-mono px-2 py-0.5 rounded-md bg-white/10 border border-white/15 text-neutral-200 font-bold">
                    ชิ้นที่ #{index + 1}
                  </span>
                  <span className="text-neutral-500 text-[10px]">
                    คลิกปุ่มเพื่อคัดลอก หรือใช้เมาส์ลากคลุมข้อความได้อิสระ
                  </span>
                </div>
              )}

              {/* Raw Content Display + Action Buttons */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="flex-1 p-3 rounded-xl bg-neutral-900/90 border border-white/[0.06] text-white font-mono text-xs sm:text-sm leading-relaxed whitespace-pre-wrap break-all select-text cursor-text">
                  {rawText}
                </div>

                <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                  {isUrl && (
                    <a
                      href={rawText}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-neutral-200 hover:text-white text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 border border-white/10"
                      title="เปิดลิงก์ในแท็บใหม่"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>เปิดลิงก์</span>
                    </a>
                  )}

                  <button
                    type="button"
                    onClick={() =>
                      handleCopy(
                        itemKey,
                        rawText,
                        isMultiple ? `ชิ้นที่ #${index + 1}` : "ข้อมูลสินค้า"
                      )
                    }
                    className="px-4 py-2.5 rounded-xl bg-white hover:bg-neutral-200 text-black text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 shadow-sm"
                    title="คัดลอกข้อความทั้งหมด"
                  >
                    {isItemCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
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
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-[11px] text-neutral-500 flex items-center justify-between pt-1">
        <span>* สามารถใช้เมาส์ลากคลุมข้อความเพื่อคัดลอกเฉพาะส่วนได้ตามต้องการ</span>
        <span className="font-mono text-[10px] text-neutral-400">JIPAN SECURE VAULT</span>
      </div>
    </div>
  );
}
