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

// === AMBIENT V2.1 ===
let ambCtx = null, ambSrc = null, ambPlay = false;
window.toggleAmbientSound = function() {
  const btn = document.getElementById("toggleAmbientBtn");
  if (ambPlay) {
    if (ambSrc) { try { ambSrc.stop(); } catch(e){} }
    ambPlay = false;
    if (btn) btn.textContent = "🌧️ Suara Fokus: Mati";
    return;
  }
  if (!ambCtx) ambCtx = new (window.AudioContext || window.webkitAudioContext)();
  const buf = ambCtx.createBuffer(1, ambCtx.sampleRate * 3, ambCtx.sampleRate);
  const data = buf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < data.length; i++) {
    last = (last + (0.02 * (Math.random() * 2 - 1))) / 1.02;
    data[i] = last * 0.15;
  }
  ambSrc = ambCtx.createBufferSource();
  ambSrc.buffer = buf;
  ambSrc.loop = true;
  const filter = ambCtx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 800;
  ambSrc.connect(filter);
  filter.connect(ambCtx.destination);
  ambSrc.start();
  ambPlay = true;
  if (btn) btn.textContent = "🌧️ Suara Fokus: Aktif";
};
