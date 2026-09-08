// High-tech procedural Web Audio Sound FX generator
export interface SpeechProgressEvent {
  text: string;
  charIndex: number;
  charLength?: number;
  isSpeaking: boolean;
  elapsedTime?: number;
}

class SoundSystem {
  private ctx: AudioContext | null = null;
  private soundEnabled: boolean = true;
  private ambientOsc: OscillatorNode | null = null;
  private ambientGain: GainNode | null = null;
  private speechListeners: Set<(event: SpeechProgressEvent) => void> = new Set();

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
    if (!enabled && this.ambientGain) {
      this.ambientGain.gain.linearRampToValueAtTime(0, (this.ctx?.currentTime || 0) + 0.5);
    }
  }

  public isEnabled(): boolean {
    return this.soundEnabled;
  }

  // JARVIS activation chime
  public playActivationChime() {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sine';
    osc2.type = 'triangle';

    osc1.frequency.setValueAtTime(523.25, t); // C5
    osc1.frequency.exponentialRampToValueAtTime(783.99, t + 0.12); // G5
    osc1.frequency.exponentialRampToValueAtTime(1046.5, t + 0.25); // C6

    osc2.frequency.setValueAtTime(261.63, t); // C4
    osc2.frequency.exponentialRampToValueAtTime(392.0, t + 0.15);

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.18, t + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.6);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start(t);
    osc2.start(t);
    osc1.stop(t + 0.65);
    osc2.stop(t + 0.65);
  }

  // Sci-fi HUD click / tick
  public playHudTick() {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1800, t);
    osc.frequency.exponentialRampToValueAtTime(800, t + 0.05);

    gain.gain.setValueAtTime(0.1, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.06);
  }

  // Skill execution confirmation sound
  public playConfirmation() {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const freqs = [440, 554.37, 659.25, 880]; // A major chord
    freqs.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + idx * 0.04);

      gain.gain.setValueAtTime(0.001, t + idx * 0.04);
      gain.gain.linearRampToValueAtTime(0.08, t + idx * 0.04 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t + idx * 0.04);
      osc.stop(t + 0.5);
    });
  }

  // Computing blip
  public playComputingBlip() {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    const freq = 1200 + Math.random() * 800;
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, t);

    gain.gain.setValueAtTime(0.04, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.035);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.04);
  }

  // Phone: Dialing tone sequence
  public playPhoneDial() {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    // Dual-tone multi-frequency simulation (DTMF)
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.frequency.setValueAtTime(697, t);
    osc2.frequency.setValueAtTime(1209, t);

    gain.gain.setValueAtTime(0.08, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start(t);
    osc2.start(t);
    osc1.stop(t + 0.25);
    osc2.stop(t + 0.25);
  }

  // Phone: Ringing locator beacon
  public playPhoneRinging() {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const freqs = [440, 480];
    freqs.forEach((freq) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.12, t + 0.05);
      gain.gain.setValueAtTime(0.12, t + 0.5);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.8);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.85);
    });
  }

  // Phone: Call Hangup
  public playPhoneHangup() {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(425, t);
    osc.frequency.setValueAtTime(350, t + 0.12);

    gain.gain.setValueAtTime(0.09, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.3);
  }

  // Phone: SMS transmission alert
  public playSmsNotification() {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const notes = [587.33, 880, 1174.66]; // D5, A5, D6
    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + idx * 0.06);

      gain.gain.setValueAtTime(0.001, t + idx * 0.06);
      gain.gain.linearRampToValueAtTime(0.1, t + idx * 0.06 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + idx * 0.06 + 0.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t + idx * 0.06);
      osc.stop(t + idx * 0.06 + 0.22);
    });
  }

  // Phone: Flashlight toggle click
  public playTorchClick() {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(2400, t);
    osc.frequency.exponentialRampToValueAtTime(600, t + 0.04);

    gain.gain.setValueAtTime(0.08, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.05);
  }

  // Phone: Alarm chime
  public playAlarmSound() {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const freqs = [880, 1046.5, 1318.5]; // A5, C6, E6
    freqs.forEach((freq, i) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + i * 0.08);

      gain.gain.setValueAtTime(0.001, t + i * 0.08);
      gain.gain.linearRampToValueAtTime(0.14, t + i * 0.08 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.08 + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t + i * 0.08);
      osc.stop(t + i * 0.08 + 0.38);
    });
  }

  // Register callback for synchronized speech progression
  public onSpeechProgress(listener: (event: SpeechProgressEvent) => void): () => void {
    this.speechListeners.add(listener);
    return () => {
      this.speechListeners.delete(listener);
    };
  }

  public notifySpeechProgress(event: SpeechProgressEvent) {
    this.speechListeners.forEach((fn) => {
      try {
        fn(event);
      } catch (err) {
        console.warn('[SoundSystem] speech progress listener error:', err);
      }
    });
  }

  // Subtle holographic data keystroke click for typewriter effect
  public playSoftTypeTick() {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1400 + Math.random() * 300, t);
      gain.gain.setValueAtTime(0.005, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.015);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.016);
    } catch {
      // ignore
    }
  }

  // Speech synthesis (JARVIS Voice) with Real-Time Boundary Telemetry
  public speak(
    text: string,
    onStart?: () => void,
    onEnd?: () => void,
    onBoundary?: (charIndex: number) => void
  ) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      onStart?.();
      this.notifySpeechProgress({ text, charIndex: 0, isSpeaking: true });
      const duration = Math.max(1500, text.length * 55);
      setTimeout(() => {
        this.notifySpeechProgress({ text, charIndex: text.length, isSpeaking: false });
        onEnd?.();
      }, duration);
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();

    // Prefer British English voice for authentic JARVIS sound
    const jarvisVoice = voices.find(
      (v) =>
        v.lang.includes('en-GB') ||
        v.name.includes('Daniel') ||
        v.name.includes('George') ||
        v.name.includes('Oliver') ||
        v.name.includes('British') ||
        v.name.includes('UK')
    ) || voices.find((v) => v.lang.startsWith('en'));

    if (jarvisVoice) {
      utterance.voice = jarvisVoice;
    }

    utterance.rate = 1.02; // Calm, deliberate
    utterance.pitch = 0.95; // Slightly deeper, dignified

    utterance.onstart = () => {
      this.notifySpeechProgress({
        text,
        charIndex: 0,
        isSpeaking: true,
      });
      onStart?.();
    };

    utterance.onboundary = (event) => {
      const idx = typeof event.charIndex === 'number' ? event.charIndex : 0;
      onBoundary?.(idx);
      this.notifySpeechProgress({
        text,
        charIndex: idx,
        charLength: (event as any).charLength,
        isSpeaking: true,
        elapsedTime: (event as any).elapsedTime,
      });
    };

    utterance.onend = () => {
      this.notifySpeechProgress({
        text,
        charIndex: text.length,
        isSpeaking: false,
      });
      onEnd?.();
    };

    utterance.onerror = () => {
      this.notifySpeechProgress({
        text,
        charIndex: text.length,
        isSpeaking: false,
      });
      onEnd?.();
    };

    window.speechSynthesis.speak(utterance);
  }

  public stopSpeaking() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      this.notifySpeechProgress({ text: '', charIndex: 0, isSpeaking: false });
    }
  }
}

export const sfx = new SoundSystem();
