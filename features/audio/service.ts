import { BrownNoiseEngine, clampVolume } from "@/lib/audio/brown-noise-engine";

export class AudioService {
  constructor(private readonly engine: BrownNoiseEngine = sharedBrownNoiseEngine) {}

  async startBrownNoise(volume: number) {
    await this.engine.start(clampVolume(volume));
  }

  stopBrownNoise() {
    this.engine.stop();
  }

  setVolume(volume: number) {
    this.engine.setVolume(clampVolume(volume));
  }
}

const sharedBrownNoiseEngine = new BrownNoiseEngine();
