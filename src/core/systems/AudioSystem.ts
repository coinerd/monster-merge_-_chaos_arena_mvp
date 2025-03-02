import { System } from '../../ecs/System';
import { AudioComponent } from '../components/AudioComponent';

export class AudioSystem extends System {
  private audioContext = new AudioContext();
  private sounds = new Map<string, AudioBuffer>();

  async loadSound(name: string, url: string): Promise<void> {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
    this.sounds.set(name, audioBuffer);
  }

  update(deltaTime: number): void {
    this.entities.forEach(entity => {
      const audio = entity.getComponent(AudioComponent);
      if (audio && audio.shouldPlay) {
        this.playSound(audio.soundName);
        audio.shouldPlay = false;
      }
    });
  }

  private playSound(name: string): void {
    const source = this.audioContext.createBufferSource();
    source.buffer = this.sounds.get(name);
    source.connect(this.audioContext.destination);
    source.start();
  }
}
