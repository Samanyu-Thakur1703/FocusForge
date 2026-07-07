import { create } from "zustand";

type AudioStore = {
  enabled: boolean;
  volume: number;
  muted: boolean;
  setEnabled: (enabled: boolean) => void;
  setVolume: (volume: number) => void;
  setMuted: (muted: boolean) => void;
  toggleMuted: () => void;
};

export const useAudioStore = create<AudioStore>((set) => ({
  enabled: false,
  volume: 0.35,
  muted: false,
  setEnabled: (enabled) => set({ enabled }),
  setVolume: (volume) => set({ volume: Math.min(1, Math.max(0, volume)) }),
  setMuted: (muted) => set({ muted }),
  toggleMuted: () => set((state) => ({ muted: !state.muted }))
}));
