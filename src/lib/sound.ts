import confetti from "canvas-confetti";

/**
 * Plays a high-fidelity melodic success chime using the Web Audio API
 * and an optional spoken announcement in Thai.
 */
export function playSuccessChime(customMessage?: string) {
  if (typeof window === "undefined") return;

  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (AudioCtx) {
      const ctx = new AudioCtx();

      // Ensure audio context is running (handles browser autoplay policies)
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      // 4-note melodic ascending chime: C5 -> E5 -> G5 -> C6
      const notes = [
        { freq: 523.25, time: 0.0, dur: 0.35, gain: 0.22 },
        { freq: 659.25, time: 0.09, dur: 0.35, gain: 0.24 },
        { freq: 783.99, time: 0.18, dur: 0.4, gain: 0.26 },
        { freq: 1046.5, time: 0.28, dur: 0.7, gain: 0.3 },
      ];

      notes.forEach(({ freq, time, dur, gain: targetGain }) => {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();

        // Use sine + small triangle blend for bell/chime acoustic warmth
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + time);

        gainNode.gain.setValueAtTime(0.0001, ctx.currentTime + time);
        gainNode.gain.exponentialRampToValueAtTime(
          targetGain,
          ctx.currentTime + time + 0.02
        );
        gainNode.gain.exponentialRampToValueAtTime(
          0.0001,
          ctx.currentTime + time + dur
        );

        osc.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc.start(ctx.currentTime + time);
        osc.stop(ctx.currentTime + time + dur + 0.05);
      });
    }

    // Voice announcement in Thai via SpeechSynthesis
    if ("speechSynthesis" in window) {
      const message = customMessage || "เข้าสู่ระบบสำเร็จเรียบร้อยแล้วค่ะ";
      setTimeout(() => {
        try {
          window.speechSynthesis.cancel(); // cancel any pending speech
          const utterance = new SpeechSynthesisUtterance(message);
          utterance.lang = "th-TH";
          utterance.rate = 1.05;
          utterance.pitch = 1.1;
          utterance.volume = 1;
          window.speechSynthesis.speak(utterance);
        } catch {
          // Ignore speech synthesis errors if browser blocks it
        }
      }, 250);
    }
  } catch (e) {
    console.warn("Audio chime playback error:", e);
  }
}

/**
 * Triggers login success celebration: Melodic Chime + Thai voice confirmation
 */
export function triggerLoginSuccess() {
  playSuccessChime("เข้าสู่ระบบสำเร็จเรียบร้อยแล้วค่ะ");
}

/**
 * Triggers full celebration: Melodic Chime + Confetti burst + Thai voice confirmation
 */
export function triggerRegisterSuccess() {
  playSuccessChime("สมัครสมาชิกสำเร็จเรียบร้อยแล้วค่ะ");

  try {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#ff334b", "#ffffff", "#38bdf8", "#34d399", "#fbbf24"],
    });
  } catch {
    // Ignore confetti errors
  }
}
