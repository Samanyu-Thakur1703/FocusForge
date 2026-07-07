"use client";

import { useEffect, useMemo } from "react";
import { AudioService } from "@/features/audio/service";
import { useAudioStore } from "@/stores/audio-store";

const audioService = new AudioService();

export function useAudio() {
  const enabled = useAudioStore((state) => state.enabled);
  const volume = useAudioStore((state) => state.volume);
  const muted = useAudioStore((state) => state.muted);
  const setEnabled = useAudioStore((state) => state.setEnabled);
  const setVolume = useAudioStore((state) => state.setVolume);
  const toggleMuted = useAudioStore((state) => state.toggleMuted);
  const effectiveVolume = muted ? 0 : volume;

  useEffect(() => {
    if (!enabled) {
      audioService.stopBrownNoise();
      return;
    }

    void audioService.startBrownNoise(effectiveVolume).catch(() => {
      setEnabled(false);
    });

    return undefined;
  }, [effectiveVolume, enabled, setEnabled]);

  useEffect(() => {
    if (enabled) {
      audioService.setVolume(effectiveVolume);
    }
  }, [effectiveVolume, enabled]);

  return useMemo(
    () => ({
      enabled,
      muted,
      volume,
      effectiveVolume,
      start: () => setEnabled(true),
      stop: () => setEnabled(false),
      setVolume,
      toggleMuted
    }),
    [effectiveVolume, enabled, muted, setEnabled, setVolume, toggleMuted, volume]
  );
}
