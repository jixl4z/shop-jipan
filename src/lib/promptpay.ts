/**
 * Generates an EMVCo QR code string for PromptPay (Phone number or National ID / Tax ID)
 */
function crc16(data: string): string {
  let crc = 0xffff;
  for (let i = 0; i < data.length; i++) {
    crc ^= data.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ 0x1021) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

function f(id: string, value: string): string {
  const len = value.length.toString().padStart(2, "0");
  return `${id}${len}${value}`;
}

export function generatePromptPayPayload(target: string, amount?: number): string {
  // Clean phone number (e.g. 0812345678 -> 0066812345678)
  const clean = target.replace(/[^0-9]/g, "");
  let formattedTarget = clean;
  if (clean.length === 10 && clean.startsWith("0")) {
    formattedTarget = `0066${clean.substring(1)}`;
  }

  const targetType = formattedTarget.length >= 13 ? "02" : "01";

  // PromptPay Sub-fields
  const aid = f("00", "A000000677010111");
  const biller = f(targetType, formattedTarget);
  const merchantAccountInfo = f("29", `${aid}${biller}`);

  let payload =
    f("00", "01") + // Payload Format Indicator
    f("01", amount ? "12" : "11") + // Point of Initiation (12 = Dynamic, 11 = Static)
    merchantAccountInfo +
    f("53", "764") + // Currency code THB
    f("58", "TH"); // Country code

  if (amount && amount > 0) {
    payload += f("54", amount.toFixed(2));
  }

  payload += "6304";
  const checksum = crc16(payload);
  return `${payload}${checksum}`;
}

export function getPromptPayQrUrl(target: string, amount?: number): string {
  const payload = generatePromptPayPayload(target, amount);
  return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
    payload
  )}`;
}
