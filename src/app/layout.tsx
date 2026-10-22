import type { Metadata } from "next";
import "./globals.css";
import { StoreProvider } from "@/context/StoreContext";
import FloatingChat from "@/components/FloatingChat";

export const metadata: Metadata = {
  title: "JIPAN STORE — ศูนย์รวมสินค้าดิจิทัลและบริการไอดีเกมระบบอัตโนมัติ 24 ชม.",
  description:
    "เว็บขายสินค้าดิจิทัล บัตรเติมเงิน ไอดีเกม และแอปพรีเมียม สแกนจ่ายด้วยสลิปพร้อมเพย์ ระบบตรวจสอบยอดเงินอัตโนมัติ รับของทันที 24 ชั่วโมง",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;600;700;800&family=Prompt:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-neutral-950 text-neutral-100 min-h-screen antialiased">
        <StoreProvider>
          {children}
          <FloatingChat />
        </StoreProvider>
      </body>
    </html>
  );
}
