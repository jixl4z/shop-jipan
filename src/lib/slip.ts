import { prisma } from "./prisma";

export interface SlipVerificationResult {
  success: boolean;
  amount: number;
  transRef: string;
  senderName?: string;
  bank?: string;
  message?: string;
  raw?: unknown;
}

/**
 * Verify slip via configured provider (SlipOK, EasySlip, OpenSlipCheck, or Simulation)
 */
export async function verifySlip(
  slipBase64OrUrl: string,
  expectedAmount?: number
): Promise<SlipVerificationResult> {
  const setting = await prisma.shopSetting.findUnique({
    where: { id: "default" },
  });

  const provider = setting?.slipProvider || "slipok";
  const apiKey = setting?.slipApiKey || process.env.SLIPOK_API_KEY || "";
  const branchId = setting?.slipApiBranch || process.env.SLIPOK_BRANCH_ID || "";

  // 1. Simulation Mode (Only if explicitly configured by Admin in DB)
  if (provider === "simulation") {
    const safeExpected =
      typeof expectedAmount === "number" &&
      Number.isFinite(expectedAmount) &&
      expectedAmount > 0 &&
      expectedAmount <= 100000
        ? expectedAmount
        : 100;
    const simulatedRef = `SIM-${Date.now()}-${Math.floor(Math.random() * 9000 + 1000)}`;

    return {
      success: true,
      amount: safeExpected,
      transRef: simulatedRef,
      senderName: "ผู้ทดสอบระบบ (จำลอง)",
      bank: "ธนาคารกสิกรไทย",
      message: "ตรวจสอบสลิปผ่านสำเร็จ (โหมดทดสอบ)",
      raw: { mode: "simulation", verifiedAt: new Date().toISOString() },
    };
  }

  // 2. SlipOK Provider (Official V1.13 Guide)
  if (provider === "slipok") {
    if (!apiKey || !branchId) {
      return {
        success: false,
        amount: 0,
        transRef: "",
        message: "ระบบยังไม่ได้ตั้งค่า SlipOK API Key หรือ Branch ID กรุณาติดต่อแอดมิน",
      };
    }

    try {
      const url = `https://api.slipok.com/api/line/apikey/${encodeURIComponent(branchId.trim())}`;

      // Clean base64
      const base64Data = slipBase64OrUrl.replace(/^data:image\/\w+;base64,/, "");

      const payload: Record<string, unknown> = {
        files: base64Data,
        log: true,
      };

      if (
        typeof expectedAmount === "number" &&
        Number.isFinite(expectedAmount) &&
        expectedAmount > 0
      ) {
        payload.amount = expectedAmount;
      }

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "x-authorization": apiKey.trim(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const resJson = await response.json();

      if (!response.ok || !resJson.success) {
        let errorMsg = resJson.message || "สลิปไม่ถูกต้อง หรือไม่พบข้อมูลในระบบธนาคาร";
        const code = resJson.code;

        switch (code) {
          case 1000:
            errorMsg = "กรุณาแนบรูปภาพสลิปให้ถูกต้อง";
            break;
          case 1001:
            errorMsg = "ไม่พบข้อมูลสาขา SlipOK กรุณาตรวจสอบ Branch ID ในระบบหลังบ้าน";
            break;
          case 1002:
            errorMsg = "API Key ของ SlipOK ไม่ถูกต้อง";
            break;
          case 1003:
          case 1004:
            errorMsg = "โควต้าแพ็กเกจของ SlipOK หมดแล้ว กรุณาติดต่อแอดมิน";
            break;
          case 1006:
            errorMsg = "รูปภาพไม่ถูกต้อง ไม่ใช่รูปภาพสลิป";
            break;
          case 1007:
            errorMsg = "รูปภาพนี้ไม่มี QR Code หรือระบบอ่าน QR Code ไม่ได้";
            break;
          case 1008:
            errorMsg = "QR Code ดังกล่าวไม่ใช่ QR สำหรับการตรวจสอบการชำระเงิน";
            break;
          case 1010:
            errorMsg = "สลิปจากธนาคารปลายทางอยู่ในช่วงดีเลย์ กรุณารอสักครู่แล้วลองใหม่อีกครั้ง";
            break;
          case 1011:
            errorMsg = "QR Code หมดอายุ หรือไม่มีรายการโอนนี้อยู่จริง";
            break;
          case 1012:
            errorMsg = "สลิปซ้ำ! สลิปนี้เคยส่งเข้ามาในระบบแล้ว ไม่สามารถใช้ซ้ำได้";
            break;
          case 1013:
            errorMsg = `ยอดเงินในสลิปไม่ตรงกับยอดที่ระบุ (สลิปนี้มียอด ฿${resJson.data?.amount || "?"})`;
            break;
          case 1014:
            errorMsg = "บัญชีผู้รับเงินในสลิป ไม่ตรงกับบัญชีของทางร้าน";
            break;
        }

        return {
          success: false,
          amount: 0,
          transRef: "",
          message: errorMsg,
          raw: resJson,
        };
      }

      const slipData = resJson.data;
      // SECURITY: Never fall back to client-provided expectedAmount for actual credit!
      const verifiedAmount = Number(slipData?.amount);
      const transRef = String(slipData?.transRef || "").trim();

      if (!Number.isFinite(verifiedAmount) || verifiedAmount <= 0 || !transRef) {
        return {
          success: false,
          amount: 0,
          transRef: "",
          message: "ข้อมูลยอดเงินหรือรหัสอ้างอิงสลิปจากธนาคารไม่สมบูรณ์",
        };
      }

      const senderName =
        slipData?.sender?.displayName || slipData?.sender?.name || "ผู้โอน";
      const bank = slipData?.sendingBank || "ธนาคาร";

      return {
        success: true,
        amount: verifiedAmount,
        transRef,
        senderName,
        bank,
        message: "ตรวจสอบสลิปผ่านสำเร็จ",
        raw: resJson,
      };
    } catch (err: unknown) {
      console.error("[SlipOK Verification Error]:", err);
      return {
        success: false,
        amount: 0,
        transRef: "",
        message: "เกิดข้อผิดพลาดในการเชื่อมต่อระบบตรวจสอบสลิป กรุณาลองใหม่อีกครั้ง",
      };
    }
  }

  return {
    success: false,
    amount: 0,
    transRef: "",
    message: "ไม่รองรับผู้ให้บริการตรวจสลิปนี้",
  };
}
