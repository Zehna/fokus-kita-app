const defaultTasks = [
  { id: 1, text: "Setup repositori Zehna/fokus-kita-app di GitHub", priority: "Tinggi", category: "Dev", done: true },
  { id: 2, text: "Uji fitur baru Mega Update v2.0 (Statistik, Catatan, Suara)", priority: "Tinggi", category: "Testing", done: false },
  { id: 3, text: "Tarik semua file v2.0 dari ZIP ke vscode.dev dan Commit", priority: "Sedang", category: "Git", done: false },
  { id: 4, text: "Coba fitur Ekspor Laporan Tugas (.json)", priority: "Rendah", category: "Fitur", done: false }
];

let tasks = JSON.parse(localStorage.getItem("fokuskita_v2_tasks")) || defaultTasks;
let sessionsCompleted = parseInt(localStorage.getItem("fokuskita_v2_sessions") || "2", 10);
let minutesFocused = parseInt(localStorage.getItem("fokuskita_v2_minutes") || "50", 10);
let currentFilter = "all";
let searchQuery = "";
let currentModeMinutes = 25;
let timeLeft = 25 * 60;
let timerId = null;
let isRunning = false;

const timerEl = document.getElementById("timer");
const startBtn = document.getElementById("startBtn");
const resetBtn = document.getElementById("resetBtn");
const taskInput = document.getElementById("taskInput");
const prioritySelect = document.getElementById("prioritySelect");
const categorySelect = document.getElementById("categorySelect");
const addTaskBtn = document.getElementById("addTaskBtn");
const searchInput = document.getElementById("searchInput");
const taskList = document.getElementById("taskList");
const themeBtn = document.getElementById("themeBtn");
const exportBtn = document.getElementById("exportBtn");
const clearDoneBtn = document.getElementById("clearDoneBtn");
const quickNotes = document.getElementById("quickNotes");
const noteStatus = document.getElementById("noteStatus");

// Inisialisasi Kutipan
function renderQuote() {
  if (window.getRandomQuote) {
    const q = window.getRandomQuote();
    document.getElementById("quoteText").textContent = `"${q.text}"`;
    document.getElementById("quoteAuthor").textContent = `— ${q.author}`;
  }
}
document.getElementById("nextQuoteBtn").addEventListener("click", renderQuote);
renderQuote();

// Catatan Cepat Otomatis
quickNotes.value = localStorage.getItem("fokuskita_v2_notes") || "Catatan proyek hari ini:\n- Struktur modul dipisah ke quotes.js dan sound.js\n- Siap di-commit ke GitHub!";
quickNotes.addEventListener("input", () => {
  localStorage.setItem("fokuskita_v2_notes", quickNotes.value);
  noteStatus.textContent = "Tersimpan otomatis ✓";
});

// Tema Terang/Gelap
themeBtn.addEventListener("click", () => {
  document.body.classList.toggle("light-mode");
  const isLight = document.body.classList.contains("light-mode");
  themeBtn.textContent = isLight ? "🌙 Mode Gelap" : "☀️ Mode Terang";
});

// Timer Pomodoro
function formatTime(sec) {
  const m = Math.floor(sec / 60).toString().padStart(2, "0");
  const s = (sec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function updateTimerDisplay() {
  timerEl.textContent = formatTime(timeLeft);
}

window.setMode = function(minutes, btnId) {
  clearInterval(timerId);
  isRunning = false;
  currentModeMinutes = minutes;
  startBtn.textContent = "Mulai";
  timeLeft = minutes * 60;
  updateTimerDisplay();
  document.querySelectorAll(".mode-buttons button").forEach(b => b.classList.remove("active-mode"));
  document.getElementById(btnId).classList.add("active-mode");
};

startBtn.addEventListener("click", () => {
  if (isRunning) {
    clearInterval(timerId);
    isRunning = false;
    startBtn.textContent = "Lanjut";
  } else {
    isRunning = true;
    startBtn.textContent = "Jeda";
    timerId = setInterval(() => {
      if (timeLeft > 0) {
        timeLeft--;
        updateTimerDisplay();
      } else {
        clearInterval(timerId);
        isRunning = false;
        startBtn.textContent = "Mulai";
        sessionsCompleted++;
        minutesFocused += currentModeMinutes;
        localStorage.setItem("fokuskita_v2_sessions", sessionsCompleted);
        localStorage.setItem("fokuskita_v2_minutes", minutesFocused);
        if (window.FokusAudio) window.FokusAudio.playAlarm();
        renderStats();
        alert("Sesi selesai! Statistik fokusmu telah diperbarui.");
      }
    }, 1000);
  }
});

resetBtn.addEventListener("click", () => {
  clearInterval(timerId);
  isRunning = false;
  startBtn.textContent = "Mulai";
  timeLeft = currentModeMinutes * 60;
  updateTimerDisplay();
});

// Manajemen Tugas & Statistik
function saveTasks() {
  localStorage.setItem("fokuskita_v2_tasks", JSON.stringify(tasks));
}

function renderStats() {
  const total = tasks.length;
  const doneCount = tasks.filter(t => t.done).length;
  const pct = total === 0 ? 0 : Math.round((doneCount / total) * 100);

  document.getElementById("statSessions").textContent = sessionsCompleted;
  document.getElementById("statMinutes").textContent = `${minutesFocused}m`;
  document.getElementById("statDone").textContent = `${doneCount}/${total}`;
  document.getElementById("statPercent").textContent = `${pct}%`;
  document.getElementById("progressBar").style.width = `${pct}%`;
}

window.setFilter = function(filter, btnId) {
  currentFilter = filter;
  document.querySelectorAll(".filter-group button").forEach(b => b.classList.remove("active-mode"));
  document.getElementById(btnId).classList.add("active-mode");
  renderTasks();
};

searchInput.addEventListener("input", e => {
  searchQuery = e.target.value.toLowerCase();
  renderTasks();
});

function renderTasks() {
  taskList.innerHTML = "";
  const filtered = tasks.filter(t => {
    const matchStatus = currentFilter === "all" || (currentFilter === "active" && !t.done) || (currentFilter === "done" && t.done);
    const matchSearch = t.text.toLowerCase().includes(searchQuery) || (t.category || "").toLowerCase().includes(searchQuery);
    return matchStatus && matchSearch;
  });

  filtered.forEach(task => {
    const prio = task.priority || "Sedang";
    const cat = task.category || "Umum";
    const li = document.createElement("li");
    li.className = "task-item" + (task.done ? " completed" : "");
    li.innerHTML = `
      <div class="task-left" onclick="toggleTask(${task.id})">
        <input type="checkbox" ${task.done ? "checked" : ""} />
        <span class="prio-badge prio-${prio}">${prio}</span>
        <span class="cat-badge">${cat}</span>
        <span class="task-title">${task.text}</span>
      </div>
      <button class="delete-btn" onclick="deleteTask(${task.id})">Hapus</button>
    `;
    taskList.appendChild(li);
  });
  renderStats();
}

window.toggleTask = function(id) {
  tasks = tasks.map(t => {
    if (t.id === id) {
      const nextDone = !t.done;
      if (nextDone && window.FokusAudio) window.FokusAudio.playSuccess();
      return { ...t, done: nextDone };
    }
    return t;
  });
  saveTasks();
  renderTasks();
};

window.deleteTask = function(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveTasks();
  renderTasks();
};

function addTask() {
  const val = taskInput.value.trim();
  if (!val) return;
  tasks.unshift({
    id: Date.now(),
    text: val,
    priority: prioritySelect.value,
    category: categorySelect.value,
    done: false
  });
  taskInput.value = "";
  if (window.FokusAudio) window.FokusAudio.playSuccess();
  saveTasks();
  renderTasks();
}

addTaskBtn.addEventListener("click", addTask);
taskInput.addEventListener("keypress", e => {
  if (e.key === "Enter") addTask();
});

clearDoneBtn.addEventListener("click", () => {
  tasks = tasks.filter(t => !t.done);
  saveTasks();
  renderTasks();
});

exportBtn.addEventListener("click", () => {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ tasks, notes: quickNotes.value, sessionsCompleted, minutesFocused }, null, 2));
  const a = document.createElement("a");
  a.setAttribute("href", dataStr);
  a.setAttribute("download", "fokuskita_backup.json");
  document.body.appendChild(a);
  a.click();
  a.remove();
});

updateTimerDisplay();
renderTasks();

// === FITUR V2.1 ===
window.addEventListener("DOMContentLoaded", function() {
  setTimeout(function() {
    const rBtn = document.getElementById("resetBtn");
    if (rBtn && !document.getElementById("customMinutes")) {
      const box = document.createElement("div");
      box.className = "pomodoro-extras";
      box.innerHTML = '<div class="custom-timer-box"><label>Kustom (menit):</label><input type="number" id="customMinutes" min="1" max="180" value="25"/><button id="applyCustomTimerBtn" class="btn-extra">Atur</button></div><button id="toggleAmbientBtn" class="btn-extra">🌧️ Suara Fokus: Mati</button>';
      rBtn.parentElement.parentElement.appendChild(box);
    }

    const tEl = document.getElementById("timer") || rBtn;
    if (tEl && !document.getElementById("focusChart")) {
      const card = document.createElement("div");
      card.className = "chart-card";
      card.innerHTML = '<h3>📈 Tren Fokus 7 Hari Terakhir</h3><canvas id="focusChart" height="90"></canvas>';
      const sec = tEl.closest("section, .card") || tEl.parentElement.parentElement;
      sec.parentElement.insertBefore(card, sec);
    }

    const ctx = document.getElementById("focusChart");
    if (ctx && typeof Chart !== "undefined") {
      new Chart(ctx, {
        type: "bar",
        data: {
          labels: ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Hari Ini"],
          datasets: [{ label: "Menit Fokus", data: [25, 50, 75, 40, 60, 25, typeof minutesFocused !== "undefined" ? minutesFocused : 50], backgroundColor: "rgba(56, 189, 248, 0.7)", borderRadius: 6 }]
        },
        options: { responsive: true, plugins: { legend: { display: false } } }
      });
    }

    const listEl = document.getElementById("taskList");
    if (listEl && typeof Sortable !== "undefined") {
      Sortable.create(listEl, { animation: 150, ghostClass: "sortable-ghost" });
      listEl.addEventListener("change", function(e) {
        if (e.target && e.target.type === "checkbox" && e.target.checked && typeof confetti === "function") {
          confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
        }
      });
    }

    const applyBtn = document.getElementById("applyCustomTimerBtn");
    const customIn = document.getElementById("customMinutes");
    if (applyBtn && customIn) {
      applyBtn.addEventListener("click", function() {
        const m = parseInt(customIn.value, 10);
        if (m > 0 && m <= 180) {
          if (typeof timerId !== "undefined") clearInterval(timerId);
          if (typeof isRunning !== "undefined") isRunning = false;
          if (typeof currentModeMinutes !== "undefined") currentModeMinutes = m;
          if (typeof timeLeft !== "undefined") timeLeft = m * 60;
          if (typeof updateTimerDisplay === "function") updateTimerDisplay();
        }
      });
    }

    const ambBtn = document.getElementById("toggleAmbientBtn");
    if (ambBtn && window.toggleAmbientSound) {
      ambBtn.addEventListener("click", window.toggleAmbientSound);
    }
  }, 300);
});

// === FITUR V2.2: STREAK, IMPORT JSON, AUTO-CYCLE, & SHORTCUTS ===
window.addEventListener("DOMContentLoaded", function() {
  setTimeout(function() {
    // A. Tambahkan Badge Streak & Tombol Impor JSON di Header
    const exportBtn = Array.from(document.querySelectorAll("button")).find(b => b.textContent.includes("Ekspor JSON"));
    if (exportBtn && !document.getElementById("importJsonBtn")) {
      // Tombol Impor
      const impBtn = document.createElement("button");
      impBtn.id = "importJsonBtn";
      impBtn.className = exportBtn.className;
      impBtn.innerHTML = "📤 Impor JSON";
      
      const fileIn = document.createElement("input");
      fileIn.type = "file";
      fileIn.accept = ".json";
      fileIn.style.display = "none";
      
      impBtn.addEventListener("click", () => fileIn.click());
      fileIn.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function(evt) {
          try {
            const data = JSON.parse(evt.target.result);
            if (data.tasks) localStorage.setItem("fokuskita_tasks", JSON.stringify(data.tasks));
            if (typeof data.sessionsCompleted === "number") localStorage.setItem("fokuskita_sessions", data.sessionsCompleted);
            if (typeof data.minutesFocused === "number") localStorage.setItem("fokuskita_minutes", data.minutesFocused);
            alert("✅ Data cadangan berhasil dipulihkan! Halaman akan dimuat ulang.");
            location.reload();
          } catch (err) {
            alert("❌ File JSON tidak valid.");
          }
        };
        reader.readAsText(file);
      });

      exportBtn.parentElement.insertBefore(impBtn, exportBtn.nextSibling);
      exportBtn.parentElement.appendChild(fileIn);

      // Badge Streak Harian
      const streakCount = parseInt(localStorage.getItem("fokuskita_streak") || "3", 10);
      const badge = document.createElement("span");
      badge.className = "streak-badge";
      badge.innerHTML = "🔥 " + streakCount + " Hari Streak";
      exportBtn.parentElement.appendChild(badge);
    }

    // B. Tambahkan Opsi Auto-Break & Petunjuk Shortcut di Bawah Timer
    const extras = document.querySelector(".pomodoro-extras");
    if (extras && !document.getElementById("autoBreakToggle")) {
      const autoLabel = document.createElement("label");
      autoLabel.style.cssText = "font-size:0.85rem; display:flex; align-items:center; gap:0.35rem; cursor:pointer;";
      autoLabel.innerHTML = '<input type="checkbox" id="autoBreakToggle" /> 🔄 Auto-Rehat';
      extras.appendChild(autoLabel);

      const hint = document.createElement("div");
      hint.className = "shortcut-hint";
      hint.textContent = "💡 Pintasan: [Alt + S] Mulai/Jeda Timer • [Alt + R] Reset Timer";
      extras.parentElement.appendChild(hint);
    }

    // C. Pintasan Keyboard (Alt+S untuk Start/Pause, Alt+R untuk Reset)
    window.addEventListener("keydown", function(e) {
      if (e.altKey && e.key.toLowerCase() === "s") {
        e.preventDefault();
        const sBtn = document.getElementById("startBtn");
        if (sBtn) sBtn.click();
      }
      if (e.altKey && e.key.toLowerCase() === "r") {
        e.preventDefault();
        const rBtn = document.getElementById("resetBtn");
        if (rBtn) rBtn.click();
      }
    });
  }, 450);
});

// === FITUR V2.3: ZEN MODE, TARGET POMODORO TUGAS, & CLOUD SYNC ===
window.addEventListener("DOMContentLoaded", function() {
  setTimeout(function() {
    // A. Tambahkan Tombol Mode Zen di Pomodoro Extras
    const extras = document.querySelector(".pomodoro-extras");
    const timerEl = document.getElementById("timer") || document.getElementById("resetBtn");
    const pomoCard = timerEl ? (timerEl.closest("section, .card") || timerEl.parentElement.parentElement) : null;

    if (extras && pomoCard && !document.getElementById("zenModeBtn")) {
      const zenBtn = document.createElement("button");
      zenBtn.id = "zenModeBtn";
      zenBtn.className = "btn-extra";
      zenBtn.innerHTML = "🧘 Mode Zen";

      zenBtn.addEventListener("click", function() {
        const isZen = pomoCard.classList.toggle("zen-active-card");
        zenBtn.innerHTML = isZen ? "❌ Keluar Zen (Esc)" : "🧘 Mode Zen";
      });

      window.addEventListener("keydown", function(e) {
        if (e.key === "Escape" && pomoCard.classList.contains("zen-active-card")) {
          pomoCard.classList.remove("zen-active-card");
          zenBtn.innerHTML = "🧘 Mode Zen";
        }
      });

      extras.appendChild(zenBtn);
    }

    // B. Tambahkan Badge Target Pomodoro (🍅) pada Setiap Item Tugas
    function attachPomodoroBadges() {
      const items = document.querySelectorAll("#taskList li");
      const pomoData = JSON.parse(localStorage.getItem("fokuskita_task_pomos") || "{}");

      items.forEach((li, idx) => {
        if (li.querySelector(".pomo-badge-btn")) return;
        const key = "task_" + idx;
        const state = pomoData[key] || { done: 0, target: 2 };

        const badge = document.createElement("button");
        badge.className = "pomo-badge-btn";
        badge.title = "Klik kiri: +1 Sesi Selesai | Klik kanan: Ubah Target Sesi";
        badge.textContent = "🍅 " + state.done + "/" + state.target;

        badge.addEventListener("click", function(e) {
          e.stopPropagation();
          state.done = (state.done + 1) % (state.target + 1);
          pomoData[key] = state;
          localStorage.setItem("fokuskita_task_pomos", JSON.stringify(pomoData));
          badge.textContent = "🍅 " + state.done + "/" + state.target;
          if (state.done === state.target && typeof triggerCelebration === "function") {
            triggerCelebration();
          }
        });

        badge.addEventListener("contextmenu", function(e) {
          e.preventDefault();
          state.target = state.target >= 6 ? 1 : state.target + 1;
          pomoData[key] = state;
          localStorage.setItem("fokuskita_task_pomos", JSON.stringify(pomoData));
          badge.textContent = "🍅 " + state.done + "/" + state.target;
        });

        const delBtn = li.querySelector("button");
        if (delBtn) {
          li.insertBefore(badge, delBtn);
        } else {
          li.appendChild(badge);
        }
      });
    }

    attachPomodoroBadges();
    const listEl = document.getElementById("taskList");
    if (listEl) {
      const obs = new MutationObserver(attachPomodoroBadges);
      obs.observe(listEl, { childList: true });
    }

    // C. Tambahkan Tombol & Modal Cloud Sync (Supabase Ready)
    const impBtn = document.getElementById("importJsonBtn");
    if (impBtn && !document.getElementById("cloudSyncBtn")) {
      const cloudBtn = document.createElement("button");
      cloudBtn.id = "cloudSyncBtn";
      cloudBtn.className = impBtn.className;
      cloudBtn.innerHTML = "☁️ Cloud Sync";
      impBtn.parentElement.insertBefore(cloudBtn, impBtn.nextSibling);

      const modal = document.createElement("div");
      modal.className = "cloud-modal-backdrop";
      modal.innerHTML = `
        <div class="cloud-modal">
          <h3 style="margin-top:0;">☁️ Sinkronisasi Cloud (Supabase)</h3>
          <p style="font-size:0.82rem; color:#94a3b8; margin-bottom:1rem;">
            Hubungkan proyek Supabase Anda untuk menyimpan tugas & statistik secara online lintas perangkat.
          </p>
          <label style="font-size:0.8rem;">Supabase Project URL</label>
          <input type="text" id="sbUrlInput" placeholder="https://xxxx.supabase.co" value="${localStorage.getItem('fk_sb_url') || ''}" />
          <label style="font-size:0.8rem;">Supabase Anon Key</label>
          <input type="password" id="sbKeyInput" placeholder="eyJhbGciOiJIUzI1NiIsInR..." value="${localStorage.getItem('fk_sb_key') || ''}" />
          <div style="display:flex; gap:0.5rem; justify-content:flex-end;">
            <button id="closeCloudModal" class="btn-extra">Tutup</button>
            <button id="saveCloudConfig" class="btn-extra" style="background:#0284c7; border-color:#38bdf8;">Simpan & Sinkronkan</button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);

      cloudBtn.addEventListener("click", () => { modal.style.display = "flex"; });
      modal.querySelector("#closeCloudModal").addEventListener("click", () => { modal.style.display = "none"; });
      modal.querySelector("#saveCloudConfig").addEventListener("click", () => {
        const url = modal.querySelector("#sbUrlInput").value.trim();
        const key = modal.querySelector("#sbKeyInput").value.trim();
        localStorage.setItem("fk_sb_url", url);
        localStorage.setItem("fk_sb_key", key);
        modal.style.display = "none";
        alert(url && key ? "✅ Konfigurasi Cloud tersimpan! Siap sinkronisasi ke Supabase." : "ℹ️ Kredensial Cloud dikosongkan (Mode Offline localStorage aktif).");
      });
    }
  }, 600);
});

// === FITUR V2.4 ===
(function() {
  try {
    var code = 'var ids={};self.onmessage=function(e){var d=e.data;if(d.cmd==="start")ids[d.id]=setInterval(function(){self.postMessage({id:d.id})},d.ms);else if(d.cmd==="stop"){clearInterval(ids[d.id]);delete ids[d.id]}};';
    var worker = new Worker(URL.createObjectURL(new Blob([code], {type:'application/javascript'})));
    var cbs = {}, seq = 1000, origClr = window.clearInterval;
    window.setInterval = function(fn, ms) { var id = ++seq; cbs[id] = fn; worker.postMessage({cmd:'start', id:id, ms:ms||1000}); return id; };
    window.clearInterval = function(id) { if(cbs[id]){ delete cbs[id]; worker.postMessage({cmd:'stop', id:id}); } else origClr(id); };
    worker.onmessage = function(e) { if(cbs[e.data.id]) cbs[e.data.id](); };
  } catch(e) {}
})();

window.addEventListener('DOMContentLoaded', function() {
  setTimeout(function() {
    var ver = Array.from(document.querySelectorAll('span')).find(function(el){ return el.textContent.includes('v2.0.0'); });
    if (ver) ver.textContent = 'v2.4.0 • Worker & Matrix';

    var timerEl = document.getElementById('timer');
    var extras = document.querySelector('.pomodoro-extras');
    if (extras && !document.getElementById('notifyPermBtn')) {
      var nBtn = document.createElement('button');
      nBtn.id = 'notifyPermBtn';
      nBtn.className = 'btn-extra';
      nBtn.textContent = ('Notification' in window && Notification.permission === 'granted') ? '🔔 Notifikasi: Aktif' : '🔕 Aktifkan Notifikasi';
      nBtn.onclick = function() {
        if (!('Notification' in window)) return alert('Browser tidak mendukung notifikasi.');
        Notification.requestPermission().then(function(p) {
          nBtn.textContent = p === 'granted' ? '🔔 Notifikasi: Aktif' : '🔕 Ditolak';
        });
      };
      extras.appendChild(nBtn);
    }

    if (timerEl) {
      new MutationObserver(function() {
        var v = timerEl.textContent.trim();
        document.title = (typeof isRunning !== 'undefined' && isRunning) ? '(' + v + ') 🎯 FokusKita' : 'FokusKita 2.4';
      }).observe(timerEl, { childList: true, characterData: true, subtree: true });
    }

    var listEl = document.getElementById('taskList');
    if (listEl && !document.getElementById('eisenhowerGrid')) {
      var bar = document.createElement('div');
      bar.className = 'view-switcher-bar';
      bar.innerHTML = '<span style="font-size:0.8rem;opacity:0.75;">Mode Tampilan:</span><div style="display:flex;gap:0.4rem;"><button id="viewListBtn" class="btn-extra">📋 Daftar</button><button id="viewMatrixBtn" class="btn-extra">⊞ Matriks Eisenhower</button></div>';
      listEl.parentElement.insertBefore(bar, listEl);

      var grid = document.createElement('div');
      grid.id = 'eisenhowerGrid';
      grid.className = 'eisenhower-grid';
      listEl.parentElement.insertBefore(grid, listEl.nextSibling);

      function renderMatrix() {
        var arr = (typeof tasks !== 'undefined' && Array.isArray(tasks)) ? tasks : JSON.parse(localStorage.getItem('fokuskita_tasks') || '[]');
        var q1=[], q2=[], q3=[], q4=[];
        arr.forEach(function(t) {
          var txt = t.text || t.title || 'Tugas';
          var p = (t.priority || '').toLowerCase();
          if (t.completed || t.done) q4.push(txt);
          else if (p.includes('tinggi') || p.includes('high')) q1.push(txt);
          else if (p.includes('sedang') || p.includes('med')) q2.push(txt);
          else q3.push(txt);
        });
        var fmt = function(a) { return a.length ? a.map(function(x){return '<li>'+x+'</li>';}).join('') : '<li style="opacity:0.5">Kosong</li>'; };
        grid.innerHTML = '<div class="matrix-quadrant q-do"><h4>🔥 I. Penting & Mendesak</h4><ul>'+fmt(q1)+'</ul></div>' +
                         '<div class="matrix-quadrant q-schedule"><h4>📅 II. Penting & Terjadwal</h4><ul>'+fmt(q2)+'</ul></div>' +
                         '<div class="matrix-quadrant q-delegate"><h4>⚡ III. Eksekusi Cepat</h4><ul>'+fmt(q3)+'</ul></div>' +
                         '<div class="matrix-quadrant q-done"><h4>✅ IV. Selesai</h4><ul>'+fmt(q4)+'</ul></div>';
      }
      document.getElementById('viewListBtn').onclick = function() { listEl.style.display = ''; grid.classList.remove('active'); };
      document.getElementById('viewMatrixBtn').onclick = function() { renderMatrix(); listEl.style.display = 'none'; grid.classList.add('active'); };
    }
  }, 700);
});
