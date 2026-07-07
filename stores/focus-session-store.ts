import { create } from "zustand";

type FocusSessionStore = {
  activeSessionId: string | null;
  elapsedSeconds: number;
  isRunning: boolean;
  setActiveSessionId: (activeSessionId: string | null) => void;
  setElapsedSeconds: (elapsedSeconds: number) => void;
  setIsRunning: (isRunning: boolean) => void;
  reset: () => void;
};

export const useFocusSessionStore = create<FocusSessionStore>((set) => ({
  activeSessionId: null,
  elapsedSeconds: 0,
  isRunning: false,
  setActiveSessionId: (activeSessionId) => set({ activeSessionId }),
  setElapsedSeconds: (elapsedSeconds) => set({ elapsedSeconds }),
  setIsRunning: (isRunning) => set({ isRunning }),
  reset: () => set({ activeSessionId: null, elapsedSeconds: 0, isRunning: false })
}));
