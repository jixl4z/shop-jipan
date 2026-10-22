import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isValidDiscordWebhookUrl } from "@/lib/discord";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const setting = await prisma.shopSetting.findUnique({
      where: { id: "default" },
    });

    return NextResponse.json({ setting });
  } catch (err: unknown) {
    console.error("[Admin Settings GET Error]:", err);
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการดึงข้อมูลตั้งค่า" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const data = await req.json();

    if (
      data.discordWebhookUrl &&
      typeof data.discordWebhookUrl === "string" &&
      data.discordWebhookUrl.trim() !== "" &&
      !isValidDiscordWebhookUrl(data.discordWebhookUrl)
    ) {
      return NextResponse.json(
        {
          error:
            "รูปแบบ Discord Webhook URL ไม่ถูกต้อง (ต้องขึ้นต้นด้วย https://discord.com/api/webhooks/...)",
        },
        { status: 400 }
      );
    }

    const allowedProviders = ["slipok", "easyslip", "openslipcheck", "simulation"];
    const safeProvider =
      data.slipProvider && allowedProviders.includes(data.slipProvider)
        ? data.slipProvider
        : undefined;

    const updated = await prisma.shopSetting.upsert({
      where: { id: "default" },
      update: {
        shopName: data.shopName,
        shopSlogan: data.shopSlogan,
        shopNotice: data.shopNotice,
        logoUrl: data.logoUrl,
        bannerUrls: data.bannerUrls
          ? typeof data.bannerUrls === "string"
            ? data.bannerUrls
            : JSON.stringify(data.bannerUrls)
          : undefined,
        themeColor: data.themeColor,
        themeMode: data.themeMode,
        promptPayNumber: data.promptPayNumber,
        promptPayName: data.promptPayName,
        truemoneyNumber: data.truemoneyNumber,
        slipApiKey: data.slipApiKey,
        slipApiBranch: data.slipApiBranch,
        slipProvider: safeProvider,
        turnstileEnabled:
          data.turnstileEnabled !== undefined ? !!data.turnstileEnabled : undefined,
        turnstileSiteKey: data.turnstileSiteKey,
        turnstileSecretKey: data.turnstileSecretKey,
        discordWebhookUrl: data.discordWebhookUrl,
        discordClientId: data.discordClientId,
        discordClientSecret: data.discordClientSecret,
        googleClientId: data.googleClientId,
        googleClientSecret: data.googleClientSecret,
        contactDiscord: data.contactDiscord,
        contactFacebook: data.contactFacebook,
        contactLine: data.contactLine,
      },
      create: {
        id: "default",
        shopName: data.shopName || "JIPAN STORE",
        shopSlogan: data.shopSlogan || "ร้านค้าอัตโนมัติ 24 ชม.",
        shopNotice: data.shopNotice || "",
        themeColor: data.themeColor || "monochrome",
        promptPayNumber: data.promptPayNumber || "0812345678",
        promptPayName: data.promptPayName || "พร้อมเพย์ร้านค้า",
        truemoneyNumber: data.truemoneyNumber || "",
        slipProvider: safeProvider || "slipok",
        slipApiKey: data.slipApiKey || process.env.SLIPOK_API_KEY || "",
        slipApiBranch: data.slipApiBranch || process.env.SLIPOK_BRANCH_ID || "",
        turnstileEnabled: !!data.turnstileEnabled,
        turnstileSiteKey: data.turnstileSiteKey || "",
        turnstileSecretKey: data.turnstileSecretKey || "",
        discordWebhookUrl: data.discordWebhookUrl || "",
        discordClientId: data.discordClientId || "",
        discordClientSecret: data.discordClientSecret || "",
        googleClientId: data.googleClientId || "",
        googleClientSecret: data.googleClientSecret || "",
      },
    });

    return NextResponse.json({ success: true, setting: updated });
  } catch (err: unknown) {
    console.error("[Admin Settings PUT Error]:", err);
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการบันทึกการตั้งค่า" }, { status: 500 });
  }
}
