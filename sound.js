// Modul Efek Suara Web Audio API (v2.0)
window.FokusAudio = {
  playTone(freq, duration, type = "sine") {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {}
  },
  playSuccess() {
    this.playTone(587.33, 0.15, "triangle");
    setTimeout(() => this.playTone(880, 0.25, "triangle"), 120);
  },
  playAlarm() {
    this.playTone(523.25, 0.2, "sine");
    setTimeout(() => this.playTone(659.25, 0.2, "sine"), 200);
    setTimeout(() => this.playTone(783.99, 0.35, "sine"), 400);
  }
};
