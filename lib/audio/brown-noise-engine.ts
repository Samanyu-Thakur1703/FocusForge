import { getAudioContextConstructor } from "@/lib/audio/browser-audio";

export class BrownNoiseEngine {
  private audioContext: AudioContext | null = null;
  private source: AudioBufferSourceNode | null = null;
  private gainNode: GainNode | null = null;

  get isPlaying() {
    return this.source !== null;
  }

  async start(volume: number) {
    if (this.isPlaying) {
      this.setVolume(volume);
      return;
    }

    const AudioContextConstructor = getAudioContextConstructor();

    if (!AudioContextConstructor) {
      throw new Error("Web Audio API is not available in this browser.");
    }

    this.audioContext = this.audioContext ?? new AudioContextConstructor();

    if (this.audioContext.state === "suspended") {
      await this.audioContext.resume();
    }

    this.gainNode = this.audioContext.createGain();
    this.gainNode.gain.value = clampVolume(volume);
    this.gainNode.connect(this.audioContext.destination);

    this.source = this.audioContext.createBufferSource();
    this.source.buffer = createBrownNoiseBuffer(this.audioContext);
    this.source.loop = true;
    this.source.connect(this.gainNode);
    this.source.start();
    this.source.onended = () => {
      this.source = null;
    };
  }

  stop() {
    if (this.source) {
      this.source.stop();
      this.source.disconnect();
      this.source = null;
    }

    if (this.gainNode) {
      this.gainNode.disconnect();
      this.gainNode = null;
    }
  }

  setVolume(volume: number) {
    if (this.gainNode) {
      this.gainNode.gain.value = clampVolume(volume);
    }
  }
}

export function clampVolume(volume: number) {
  return Math.min(1, Math.max(0, volume));
}

function createBrownNoiseBuffer(audioContext: AudioContext) {
  const bufferSize = audioContext.sampleRate * 2;
  const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
  const output = buffer.getChannelData(0);
  let lastOut = 0;

  for (let index = 0; index < bufferSize; index += 1) {
    const white = Math.random() * 2 - 1;
    output[index] = (lastOut + 0.02 * white) / 1.02;
    lastOut = output[index];
    output[index] *= 3.5;
  }

  return buffer;
}
