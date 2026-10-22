"use client";

import React, { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

export default function FAQSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: "เติมเงินผ่านสลิปพร้อมเพย์แล้ว เงินจะเข้าเมื่อไหร่?",
      a: "ระบบของเราใช้ระบบตรวจสอบสลิปอัตโนมัติ (Automated Slip Verification) เมื่อคุณอัปโหลดสลิปที่โอนถูกต้อง ยอดเงินจะเข้ากระเป๋าตังค์ของคุณทันทีภายใน 1 นาที ตลอด 24 ชั่วโมงครับ",
    },
    {
      q: "หลังจากกดสั่งซื้อแล้ว จะได้รับสินค้าอย่างไร?",
      a: "เมื่อกดสั่งซื้อสำเร็จ ระบบจะดึงรหัสสินค้าดิจิทัล (เช่น Serial Key, บัญชี, พาสเวิร์ด หรือลิงก์ดาวน์โหลด) มาแสดงบนหน้าจอทันที พร้อมปุ่มคัดลอก และข้อมูลนี้จะถูกบันทึกไว้ในเมนู 'คลังของฉัน' ตลอดเวลาครับ",
    },
    {
      q: "ระบบสลิปตรวจสอบอย่างไร มั่นใจได้อย่างไรว่าปลอดภัย?",
      a: "ระบบตรวจสอบข้อมูลอ้างอิงของสลิป (Reference Number / Bank Transaction Hash) กับเซิร์ฟเวอร์ผู้ให้บริการตรวจสลิป และมีการป้องกันการใช้สลิปซ้ำ (Duplicate Prevention) 100% ข้อมูลบัญชีและยอดเงินของลูกค้าจึงถูกต้องและปลอดภัยสูงสุดครับ",
    },
    {
      q: "หากพบปัญหา สินค้าใช้งานไม่ได้ หรือมีข้อสงสัย ต้องทำอย่างไร?",
      a: "คุณสามารถติดต่อทีมงานแอดมินได้โดยตรงผ่าน LINE Official หรือ Discord ของทางร้าน โดยแจ้งเลขออเดอร์หรือชื่อผู้ใช้ ทีมงานพร้อมช่วยเหลือตลอดเวลาครับ",
    },
  ];

  return (
    <section id="faq" className="py-12 bg-neutral-950 border-t border-neutral-850/80">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-300 text-xs font-medium mb-2">
            <HelpCircle className="w-3.5 h-3.5 text-neutral-400" />
            <span>คำถามที่พบบ่อย</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            มีข้อสงสัยเกี่ยวกับการใช้งาน?
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            คำตอบสำหรับคำถามยอดฮิตเกี่ยวกับการเติมเงินและการสั่งซื้อ
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((f, i) => {
            const isOpen = openIdx === i;
            return (
              <div
                key={i}
                className="rounded-2xl bg-neutral-900/60 border border-neutral-800/80 overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenIdx(isOpen ? null : i)}
                  className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-left cursor-pointer hover:bg-neutral-850/40 transition-colors"
                >
                  <span className="font-semibold text-sm sm:text-base text-white">
                    {f.q}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-neutral-400 shrink-0 transition-transform duration-300 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs sm:text-sm text-neutral-400 leading-relaxed border-t border-neutral-800/40 pt-3">
                    {f.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
