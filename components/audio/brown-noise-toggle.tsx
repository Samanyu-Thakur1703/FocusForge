"use client";

import { useAudio } from "@/hooks/use-audio";

export function BrownNoiseToggle() {
  const audio = useAudio();

  return (
    <section className="space-y-3 rounded-md border p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold">Brown Noise</h2>
          <p className="text-sm">{audio.enabled ? "Playing" : "Stopped"}</p>
        </div>
        <button
          type="button"
          onClick={audio.enabled ? audio.stop : audio.start}
          className="rounded-md border px-4 py-2"
        >
          {audio.enabled ? "Stop" : "Start"}
        </button>
      </div>

      <label className="block space-y-2">
        <span>Volume</span>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={audio.volume}
          onChange={(event) => audio.setVolume(event.currentTarget.valueAsNumber)}
          className="w-full"
        />
      </label>

      <button type="button" onClick={audio.toggleMuted} className="rounded-md border px-4 py-2">
        {audio.muted ? "Unmute" : "Mute"}
      </button>
    </section>
  );
}
