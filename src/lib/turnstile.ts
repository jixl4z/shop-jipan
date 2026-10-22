import { prisma } from "./prisma";

export async function verifyTurnstileToken(
  token?: string,
  remoteIp?: string
): Promise<{ success: boolean; message?: string }> {
  const setting = await prisma.shopSetting.findUnique({
    where: { id: "default" },
    select: {
      turnstileEnabled: true,
      turnstileSecretKey: true,
    },
  });

  // If Turnstile verification is not enabled or no secret key is set, allow pass-through
  if (!setting?.turnstileEnabled || !setting.turnstileSecretKey?.trim()) {
    return { success: true };
  }

  if (!token) {
    return {
      success: false,
      message: "กรุณายืนยันตัวตนความปลอดภัย Cloudflare Turnstile (ไม่พบโทเค็น)",
    };
  }

  try {
    const formData = new URLSearchParams();
    formData.append("secret", setting.turnstileSecretKey);
    formData.append("response", token);
    if (remoteIp) {
      formData.append("remoteip", remoteIp);
    }

    const res = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const data = await res.json();

    if (data.success) {
      return { success: true };
    }

    return {
      success: false,
      message: "การยืนยันตัวตน Cloudflare Turnstile ล้มเหลว โปรดลองใหม่อีกครั้ง",
    };
  } catch (err: unknown) {
    const error = err as Error;
    return {
      success: false,
      message: `เกิดข้อผิดพลาดในการตรวจสอบ Cloudflare: ${error.message}`,
    };
  }
}
