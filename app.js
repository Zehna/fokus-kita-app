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
