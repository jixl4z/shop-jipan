"use client";

import React, { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AuthModal from "@/components/AuthModal";
import TopupModal from "@/components/TopupModal";
import BuyModal from "@/components/BuyModal";
import {
  Headphones,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
  MessageSquare,
  Clock,
  CheckCircle2,
  FileText,
  Copy,
  Check,
  ArrowRight,
} from "lucide-react";
import { useStore } from "@/context/StoreContext";

export default function SupportPage() {
  const { setting, addToast } = useStore();
  const [orderQuery, setOrderQuery] = useState("");
  const [copiedClaimTemplate, setCopiedClaimTemplate] = useState(false);

  const claimTemplate = `📌 [แบบฟอร์มแจ้งปัญหา / เคลมสินค้า - JIPAN STORE]
- เลขที่คำสั่งซื้อ: ${orderQuery || "ORD-XXXXX"}
- สินค้าที่พบปัญหา: 
- อาการที่พบ (เช่น รหัสไม่ถูกต้อง / หมดอายุ): 
- รูปภาพ / คลิปหลักฐาน: (แนบไฟล์ในแชท)`;

  const handleCopyClaim = () => {
    navigator.clipboard.writeText(claimTemplate);
    setCopiedClaimTemplate(true);
    addToast("คัดลอกแบบฟอร์มเคลมสินค้าแล้ว! สามารถนำไปส่งแอดมินได้ทันที", "success");
    setTimeout(() => setCopiedClaimTemplate(false), 2500);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col selection:bg-white selection:text-black">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-12">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-neutral-400">
          <Link href="/" className="hover:text-white transition-colors">
            หน้าแรก
          </Link>
          <span>/</span>
          <span className="text-white font-medium">ศูนย์ช่วยเหลือและเคลมสินค้า (Support & Warranty)</span>
        </div>

        {/* Hero Section */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>รับประกันคุณภาพสินค้า 100% ดูแลตลอดอายุการใช้งาน</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            ศูนย์ช่วยเหลือและเคลมสินค้า
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 font-light leading-relaxed">
            หากพบปัญหาสินค้าใช้งานไม่ได้ รหัสไม่ถูกต้อง หรือมีข้อสงสัย
            เรามีทีมงานพร้อมตรวจสอบและเปลี่ยนสินค้าชิ้นใหม่ให้ทันทีตลอด 24 ชม.
          </p>
        </div>

        {/* Contact Channels Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Discord Card */}
          <div className="p-6 rounded-3xl bg-neutral-900/70 border border-neutral-800 space-y-4 hover:border-violet-500/40 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-violet-600/20 text-violet-400 border border-violet-500/30 flex items-center justify-center font-bold text-xl">
                💬
              </div>
              <div>
                <h3 className="font-bold text-lg text-white">Discord Community & Ticket</h3>
                <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                  เปิดห้อง Ticket ส่วนตัวเพื่อแจ้งปัญหากับทีมงานโดยตรง ระบบเก็บประวัติชัดเจน รวดเร็วและปลอดภัย
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs text-neutral-400">
                <Clock className="w-3.5 h-3.5 text-violet-400" />
                <span>เฉลี่ยตอบกลับ: ภายใน 2-10 นาที</span>
              </div>
            </div>
            {setting?.contactDiscord ? (
              <a
                href={setting.contactDiscord}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs transition-colors shadow-lg shadow-violet-600/20"
              >
                <span>เปิด Discord Ticket เคลมสินค้า</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            ) : (
              <div className="text-xs text-neutral-500 italic">ยังไม่ได้ตั้งค่าลิงก์ Discord</div>
            )}
          </div>

          {/* LINE Card */}
          <div className="p-6 rounded-3xl bg-neutral-900/70 border border-neutral-800 space-y-4 hover:border-emerald-500/40 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-xl">
                📱
              </div>
              <div>
                <h3 className="font-bold text-lg text-white">LINE Official Account</h3>
                <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                  ทักแชทแอดมินทาง LINE ได้โดยตรง สะดวกสำหรับผู้ใช้งานบนมือถือ ส่งหลักฐานรูปภาพและวิดีโอได้ทันที
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs text-neutral-400">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                <span>เฉลี่ยตอบกลับ: ภายใน 5-15 นาที</span>
              </div>
            </div>
            {setting?.contactLine ? (
              <a
                href={setting.contactLine}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow-lg shadow-emerald-600/20"
              >
                <span>ทักแชท LINE Official</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            ) : (
              <div className="text-xs text-neutral-500 italic">ยังไม่ได้ตั้งค่าลิงก์ LINE</div>
            )}
          </div>
        </div>

        {/* Claim Form Generator */}
        <div className="p-6 sm:p-8 rounded-3xl bg-neutral-900/80 border border-neutral-800 space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-400" />
                <span>ตัวช่วยสร้างแบบฟอร์มเคลมสินค้า (Claim Form Assistant)</span>
              </h3>
              <p className="text-xs text-neutral-400">
                กรอกเลขที่ออเดอร์เพื่อสร้างข้อความสำหรับส่งแอดมินในคลิกเดียว
              </p>
            </div>
            <Link
              href="/orders"
              className="text-xs font-semibold text-neutral-300 hover:text-white flex items-center gap-1.5"
            >
              <span>ดูเลขออเดอร์ในหน้าคลัง</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-medium text-neutral-300">
              เลขที่คำสั่งซื้อของคุณ (Order Number):
            </label>
            <input
              type="text"
              value={orderQuery}
              onChange={(e) => setOrderQuery(e.target.value)}
              placeholder="เช่น ORD-172935291..."
              className="w-full px-4 py-3 rounded-2xl bg-neutral-950 border border-neutral-800 text-white font-mono text-sm focus:outline-none focus:border-neutral-500"
            />
          </div>

          <div className="space-y-2">
            <div className="text-xs font-medium text-neutral-400">
              ตัวอย่างข้อความที่จะคัดลอก:
            </div>
            <pre className="p-4 rounded-2xl bg-neutral-950 border border-neutral-850 text-neutral-300 font-mono text-xs whitespace-pre-wrap leading-relaxed select-all">
              {claimTemplate}
            </pre>
          </div>

          <button
            onClick={handleCopyClaim}
            className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 rounded-2xl bg-white text-black font-bold text-xs hover:bg-neutral-200 transition-colors shadow-lg cursor-pointer"
          >
            {copiedClaimTemplate ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span>คัดลอกแบบฟอร์มเรียบร้อยแล้ว</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>คัดลอกแบบฟอร์มเคลมสินค้า</span>
              </>
            )}
          </button>
        </div>

        {/* Policy Terms */}
        <div className="p-6 sm:p-8 rounded-3xl bg-neutral-900/60 border border-neutral-800 space-y-4">
          <h3 className="font-bold text-base text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span>เงื่อนไขและนโยบายการรับประกันสินค้า (Warranty Terms)</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-neutral-400 leading-relaxed font-light">
            <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-850 space-y-2">
              <div className="font-semibold text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>กรณีที่อยู่ในเงื่อนไขการเคลม</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-[11px] text-neutral-400">
                <li>รหัสโค้ดไม่ถูกต้องหรือซ้ำกับในระบบตั้งแต่ได้รับ</li>
                <li>ไอดีเข้าใช้งานไม่ได้ / รหัสผ่านไม่ตรง</li>
                <li>แพ็กเกจพรีเมียมหลุดก่อนกำหนดระยะเวลารับประกัน</li>
                <li>สินค้าหมดสภาพการใช้งานโดยไม่ได้เกิดจากการละเมิดกฎของผู้ให้บริการ</li>
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-850 space-y-2">
              <div className="font-semibold text-rose-400 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-rose-400" />
                <span>กรณีที่ไม่อยู่ในเงื่อนไขการเคลม</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-[11px] text-neutral-400">
                <li>ลูกค้านำรหัสไปเผยแพร่หรือแชร์ต่อให้บุคคลอื่น</li>
                <li>การใช้งานโปรแกรมช่วยเล่น, โปรแกรมดัดแปลง หรือผิดกฎของเกม</li>
                <li>การเปลี่ยนข้อมูลหลักของบัญชี (เช่น อีเมล, รหัสกู้คืน) หากสินค้าระบุห้ามเปลี่ยน</li>
                <li>เกินระยะเวลารับประกันที่ระบุไว้ในรายละเอียดสินค้า</li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      <AuthModal />
      <TopupModal />
      <BuyModal />
    </div>
  );
}
