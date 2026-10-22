export interface TruemoneyRedeemResult {
  success: boolean;
  amount: number;
  voucherCode: string;
  ownerName?: string;
  message: string;
  raw?: unknown;
}

/**
 * Extracts voucher hash from a gift link or raw voucher code
 * e.g. https://gift.truemoney.com/campaign/?v=1234567890abcdef -> 1234567890abcdef
 */
export function extractVoucherCode(input: string): string {
  if (!input) return "";
  const trimmed = input.trim();

  // Try extracting from query param ?v=
  const matchParam = trimmed.match(/[?&]v=([a-zA-Z0-9]+)/);
  if (matchParam && matchParam[1]) {
    return matchParam[1];
  }

  // Try extracting from /vouchers/{hash}
  const matchPath = trimmed.match(/\/vouchers\/([a-zA-Z0-9]+)/);
  if (matchPath && matchPath[1]) {
    return matchPath[1];
  }

  // If raw alphanumeric hash
  const cleanHash = trimmed.replace(/[^a-zA-Z0-9]/g, "");
  return cleanHash;
}

/**
 * Format Thai phone number (e.g. 0812345678)
 */
export function cleanPhoneNumber(phone: string): string {
  return phone.replace(/[^0-9]/g, "");
}

/**
 * Redeems a TrueMoney Gift Voucher (ซองอั่งเปา) to the merchant's mobile number
 */
export async function redeemTrueMoneyVoucher(
  voucherInput: string,
  targetPhoneNumber: string
): Promise<TruemoneyRedeemResult> {
  const voucherCode = extractVoucherCode(voucherInput);
  const mobile = cleanPhoneNumber(targetPhoneNumber);

  if (!voucherCode || voucherCode.length < 8) {
    return {
      success: false,
      amount: 0,
      voucherCode: "",
      message: "ลิงก์ซองของขวัญ TrueMoney หรือโค้ดไม่ถูกต้อง",
    };
  }

  if (!mobile || mobile.length < 10) {
    return {
      success: false,
      amount: 0,
      voucherCode,
      message: "เบอร์โทรศัพท์สำหรับรับเงิน TrueMoney ไม่ถูกต้อง (ต้องเป็นเบอร์ 10 หลัก)",
    };
  }

  try {
    const url = `https://gift.truemoney.com/campaign/vouchers/${voucherCode}/redeem`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent":
          "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148",
      },
      body: JSON.stringify({
        mobile,
        voucher_hash: voucherCode,
      }),
    });

    const resJson = await response.json();

    if (resJson?.status?.code === "SUCCESS") {
      const amountStr =
        resJson.data?.my_ticket?.amount_baht ||
        resJson.data?.voucher?.redeemed_amount_baht ||
        resJson.data?.voucher?.amount_baht ||
        "0";

      const amount = parseFloat(amountStr);
      const ownerName = resJson.data?.owner_profile?.full_name || "ลูกค้า";

      return {
        success: true,
        amount,
        voucherCode,
        ownerName,
        message: "รับเงินจากซองของขวัญสำเร็จ!",
        raw: resJson,
      };
    }

    // Map TrueMoney error messages to Thai
    const code = resJson?.status?.code || "ERROR";
    let message = "ไม่สามารถรับซองของขวัญได้";

    switch (code) {
      case "VOUCHER_OUT_OF_STOCK":
        message = "ซองของขวัญนี้ถูกรับไปหมดแล้ว (ซองหมด)";
        break;
      case "TARGET_USER_REDEEMED":
        message = "เบอร์ร้านค้านี้เคยรับซองของขวัญนี้ไปแล้ว ไม่สามารถรับซ้ำได้";
        break;
      case "VOUCHER_NOT_FOUND":
        message = "ไม่พบซองของขวัญนี้ในระบบ หรือลิงก์ไม่ถูกต้อง";
        break;
      case "CANNOT_GET_OWN_VOUCHER":
        message = "ไม่สามารถรับซองของขวัญที่สร้างจากเบอร์เดียวกันได้";
        break;
      case "VOUCHER_EXPIRED":
        message = "ซองของขวัญนี้หมดอายุแล้ว (อายุซอง 72 ชั่วโมง)";
        break;
      default:
        message = resJson?.status?.message || "ระบบ TrueMoney ปฏิเสธการทำรายการ";
        break;
    }

    return {
      success: false,
      amount: 0,
      voucherCode,
      message,
      raw: resJson,
    };
  } catch (err: unknown) {
    const error = err as Error;
    return {
      success: false,
      amount: 0,
      voucherCode,
      message: `เกิดข้อผิดพลาดในการเชื่อมต่อกับ TrueMoney: ${error.message}`,
    };
  }
}
