import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const setting = await prisma.shopSetting.findUnique({
      where: { id: "default" },
    });

    if (!setting) {
      return NextResponse.json({
        setting: {
          shopName: "JIPAN STORE",
          shopSlogan: "ศูนย์รวมสินค้าดิจิทัลและไอดีเกมอัตโนมัติ 24 ชม.",
          shopNotice: "ยินดีต้อนรับสู่ร้านค้า! เติมเงินผ่านสลิปพร้อมเพย์ เงินเข้าทันที",
          themeColor: "monochrome",
          themeMode: "dark",
          promptPayNumber: "0812345678",
          promptPayName: "พร้อมเพย์ร้านค้า",
          contactDiscord: "",
          contactFacebook: "",
          contactLine: "",
        },
      });
    }

    let parsedBanners: string[] = [];
    try {
      const parsed = JSON.parse(setting.bannerUrls || "[]");
      if (Array.isArray(parsed)) parsedBanners = parsed;
    } catch {
      parsedBanners = [];
    }

    // Return safe public settings (NEVER leak private API keys or OAuth client secrets)
    const publicSetting = {
      shopName: setting.shopName,
      shopSlogan: setting.shopSlogan,
      shopNotice: setting.shopNotice,
      logoUrl: setting.logoUrl,
      bannerUrls: parsedBanners,
      themeColor: setting.themeColor,
      themeMode: setting.themeMode,
      promptPayNumber: setting.promptPayNumber,
      promptPayName: setting.promptPayName,
      truemoneyNumber: setting.truemoneyNumber,
      turnstileEnabled: setting.turnstileEnabled,
      turnstileSiteKey: setting.turnstileSiteKey,
      contactDiscord: setting.contactDiscord,
      contactFacebook: setting.contactFacebook,
      contactLine: setting.contactLine,
      discordServerId: setting.discordServerId || "",
      popupEnabled: setting.popupEnabled,
      popupTitle: setting.popupTitle || "ข่าวสารและกิจกรรม",
      popupMediaUrl: setting.popupMediaUrl || "",
      popupMediaType: setting.popupMediaType || "auto",
      popupLink: setting.popupLink || "",
      popupLinkText: setting.popupLinkText || "เปิดลิงก์",
    };

    return NextResponse.json(
      { setting: publicSetting },
      {
        headers: {
          "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=600",
        },
      }
    );
  } catch (err: unknown) {
    console.error("[Public Settings Error]:", err);
    return NextResponse.json({ error: "ไม่สามารถโหลดข้อมูลการตั้งค่าร้านค้าได้" }, { status: 500 });
  }
}
