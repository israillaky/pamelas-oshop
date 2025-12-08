/**
 * Safely obtain an AudioContext constructor (standard or vendor-prefixed).
 */
export function getAudioContextConstructor():
  | (new () => AudioContext)
  | null {
  // Standard global constructor
  if (typeof AudioContext !== "undefined") {
    return AudioContext;
  }

  // Vendor-prefixed on window (now typed via window-audio.d.ts)
  if (typeof window.webkitAudioContext === "function") {
    return window.webkitAudioContext;
  }

  return null;
}

/**
 * Simple beep sound (short success beep).
 */
export function playBeep(): void {
  const Ctor = getAudioContextConstructor();
  if (!Ctor) return;

  const ctx = new Ctor();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "sine";
  osc.frequency.value = 880; // A5
  gain.gain.value = 0.05;

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();

  setTimeout(() => {
    osc.stop();
    ctx.close();
  }, 120);
}
