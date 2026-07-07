import { describe, expect, it } from "vitest";
import { clampVolume } from "@/lib/audio/brown-noise-engine";
import { isBrowserAudioAvailable } from "@/lib/audio/browser-audio";
import { useAudioStore } from "@/stores/audio-store";

describe("audio foundation", () => {
  it("reports unavailable browser audio in node", () => {
    expect(isBrowserAudioAvailable()).toBe(false);
  });

  it("tracks audio enabled state", () => {
    useAudioStore.getState().setEnabled(false);
    useAudioStore.getState().setEnabled(true);

    expect(useAudioStore.getState().enabled).toBe(true);
  });

  it("clamps volume changes", () => {
    useAudioStore.getState().setVolume(2);
    expect(useAudioStore.getState().volume).toBe(1);

    useAudioStore.getState().setVolume(-1);
    expect(useAudioStore.getState().volume).toBe(0);
  });

  it("toggles mute state", () => {
    useAudioStore.getState().setMuted(false);
    useAudioStore.getState().toggleMuted();

    expect(useAudioStore.getState().muted).toBe(true);
  });

  it("clamps engine volume values", () => {
    expect(clampVolume(2)).toBe(1);
    expect(clampVolume(-1)).toBe(0);
    expect(clampVolume(0.4)).toBe(0.4);
  });
});
