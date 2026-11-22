// audio.js — every sound is a tiny synthesised blip made with WebAudio:
// no audio files, nothing to download. The context only starts after the
// player's first key or click, as browsers require.

export class SoundBank {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  // Start the audio context on the first gesture. Safe to call any time.
  unlock() {
    if (!this.ctx) {
      try {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      } catch {
        this.ctx = null;
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
  }

  // One short note: a sine or triangle blip that slides a little in pitch.
  blip(freq, duration, type = 'sine', volume = 0.12, slideTo = null) {
    if (!this.ctx || this.muted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (slideTo !== null) osc.frequency.exponentialRampToValueAtTime(slideTo, now + duration);
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + duration);
  }

  pickup() {
    this.blip(880, 0.09, 'sine', 0.12);
    setTimeout(() => this.blip(1320, 0.12, 'sine', 0.1), 70);
  }

  vault() {
    [523, 659, 784, 1046].forEach((freq, i) => {
      setTimeout(() => this.blip(freq, 0.16, 'triangle', 0.12), i * 90);
    });
  }

  coin() {
    this.blip(1568, 0.07, 'triangle', 0.08, 2093);
  }

  // A soft tick while Vera is spotted; the caller throttles how often it fires.
  alarmTick() {
    this.blip(220, 0.06, 'square', 0.05, 180);
  }

  caught() {
    this.blip(392, 0.22, 'sawtooth', 0.1, 196);
    setTimeout(() => this.blip(196, 0.4, 'sawtooth', 0.1, 98), 180);
  }

  win() {
    [523, 659, 784, 1046, 1318].forEach((freq, i) => {
      setTimeout(() => this.blip(freq, 0.2, 'triangle', 0.11), i * 110);
    });
  }
}
