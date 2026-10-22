import { prisma } from "./prisma";

const DISCORD_WEBHOOK_REGEX =
  /^https:\/\/(ptb\.|canary\.)?discord(app)?\.com\/api\/webhooks\/\d+\/[\w-]+$/;

export function isValidDiscordWebhookUrl(url: string): boolean {
  return DISCORD_WEBHOOK_REGEX.test(url.trim());
}

export async function sendDiscordNotification(payload: {
  title: string;
  description: string;
  color?: number; // e.g. 0x10b981 for green, 0x3b82f6 for blue
  fields?: Array<{ name: string; value: string; inline?: boolean }>;
}) {
  try {
    const setting = await prisma.shopSetting.findUnique({
      where: { id: "default" },
      select: { discordWebhookUrl: true, shopName: true },
    });

    const webhookUrl = setting?.discordWebhookUrl?.trim() || "";
    if (!webhookUrl) return;

    // SSRF Protection: Strictly allow only official Discord Webhook URLs
    if (!isValidDiscordWebhookUrl(webhookUrl)) {
      console.warn("[Security] Blocked invalid Discord webhook URL:", webhookUrl);
      return;
    }

    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: setting?.shopName || "JIPAN STORE Bot",
        embeds: [
          {
            title: payload.title,
            description: payload.description,
            color: payload.color || 0x10b981,
            fields: payload.fields || [],
            footer: {
              text: `${setting?.shopName || "JIPAN STORE"} • Automated Notification`,
            },
            timestamp: new Date().toISOString(),
          },
        ],
      }),
    });
  } catch (err) {
    console.error("Failed to send Discord webhook:", err);
  }
}
