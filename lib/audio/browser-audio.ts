export function isBrowserAudioAvailable() {
  return typeof window !== "undefined" && getAudioContextConstructor() !== null;
}

export function getAudioContextConstructor() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.AudioContext ?? window.webkitAudioContext ?? null;
}

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}
