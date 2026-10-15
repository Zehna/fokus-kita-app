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
;(function snd(){var cur="brown";window.addEventListener("DOMContentLoaded",function(){setTimeout(function(){var sel=document.getElementById("ambientSelect");if(sel){sel.onchange=function(e){cur=e.target.value;if(typeof isAmbientPlaying!=="undefined"&&isAmbientPlaying){window.toggleAmbientSound();window.toggleAmbientSound()}}}},1000)});window.toggleAmbientSound=function(){var btn=document.getElementById("toggleAmbientBtn");if(typeof isAmbientPlaying!=="undefined"&&isAmbientPlaying){if(ambientSource){try{ambientSource.stop()}catch(e){}}isAmbientPlaying=false;if(btn)btn.textContent="Suara Fokus: Mati";return}if(!ambientCtx){ambientCtx=new(window.AudioContext||window.webkitAudioContext)()}var sr=ambientCtx.sampleRate,len=sr*3,buf=ambientCtx.createBuffer(1,len,sr),d=buf.getChannelData(0);if(cur==="white"){for(var i=0;i<len;i++)d[i]=(Math.random()*2-1)*0.07}else if(cur==="pink"){var b0=0,b1=0,b2=0,b3=0,b4=0,b5=0;for(var j=0;j<len;j++){var w=Math.random()*2-1;b0=0.99886*b0+w*0.0555;b1=0.99332*b1+w*0.075;b2=0.969*b2+w*0.1538;b3=0.8665*b3+w*0.3104;b4=0.55*b4+w*0.5329;b5=-0.7616*b5-w*0.0168;d[j]=(b0+b1+b2+b3+b4+b5)*0.035}}else{var last=0;for(var k=0;k<len;k++){var wh=Math.random()*2-1;last=(last+0.02*wh)/1.02;d[k]=last*0.16}}ambientSource=ambientCtx.createBufferSource();ambientSource.buffer=buf;ambientSource.loop=true;var flt=ambientCtx.createBiquadFilter();flt.type="lowpass";flt.frequency.value=cur==="white"?1800:(cur==="pink"?1000:700);ambientSource.connect(flt);flt.connect(ambientCtx.destination);ambientSource.start();isAmbientPlaying=true;if(btn)btn.textContent="Suara: Aktif ("+cur.toUpperCase()+")"}})();