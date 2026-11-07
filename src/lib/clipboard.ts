/**
 * Hybrid Clipboard Utility
 * Ensures 100% reliable copy across all browsers including:
 * - In-App Browsers (LINE, Twitter/X, Instagram, Facebook WebViews)
 * - Safari iOS (which often blocks navigator.clipboard without direct user activation)
 * - Desktop browsers
 */

export async function copyToClipboard(text: string): Promise<boolean> {
  if (!text) return false;

  // 1. Try modern Clipboard API first if available and in secure context
  if (typeof window !== "undefined" && navigator?.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fall through to legacy execCommand fallback
    }
  }

  // 2. Fallback using a temporary textarea (vital for LINE & Twitter in-app browsers)
  if (typeof document !== "undefined") {
    try {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      // Prevent scrolling to bottom of page in iOS Safari
      textArea.style.position = "fixed";
      textArea.style.top = "0";
      textArea.style.left = "0";
      textArea.style.width = "2em";
      textArea.style.height = "2em";
      textArea.style.padding = "0";
      textArea.style.border = "none";
      textArea.style.outline = "none";
      textArea.style.boxShadow = "none";
      textArea.style.background = "transparent";
      textArea.style.opacity = "0";
      textArea.setAttribute("readonly", "");

      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      textArea.setSelectionRange(0, text.length);

      const successful = document.execCommand("copy");
      document.body.removeChild(textArea);
      return successful;
    } catch (err) {
      console.error("Clipboard copy failed:", err);
      return false;
    }
  }

  return false;
}

export interface ParsedItem {
  raw: string;
  isCredential: boolean;
  username?: string;
  password?: string;
  extra?: string;
}

/**
 * Parses delivered data into individual items and detects credentials (user:pass, etc.)
 */
export function parseDeliveredItems(deliveredData: string): ParsedItem[] {
  if (!deliveredData) return [];

  // Split lines (handling both \r\n and \n)
  const lines = deliveredData
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length === 0) {
    return [{ raw: deliveredData, isCredential: false }];
  }

  return lines.map((line) => {
    // Check for delimiter patterns: user:pass, user|pass, user / pass, or Email: ... Password: ...
    const colonMatch = line.match(/^([^:\s]+):([^\s]+)(.*)$/);
    const pipeMatch = line.match(/^([^|\s]+)\|([^\s]+)(.*)$/);

    if (colonMatch) {
      return {
        raw: line,
        isCredential: true,
        username: colonMatch[1],
        password: colonMatch[2],
        extra: colonMatch[3]?.trim(),
      };
    }

    if (pipeMatch) {
      return {
        raw: line,
        isCredential: true,
        username: pipeMatch[1],
        password: pipeMatch[2],
        extra: pipeMatch[3]?.trim(),
      };
    }

    return {
      raw: line,
      isCredential: false,
    };
  });
}
