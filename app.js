const defaultTasks = [
  { id: 1, text: "Upload Versi 1.0 ke github.com/Zehna/fokus-kita-app", priority: "Tinggi", done: true },
  { id: 2, text: "Uji fitur baru Versi 1.1 (Tema Terang/Gelap & Prioritas)", priority: "Tinggi", done: false },
  { id: 3, text: "Commit pembaruan Versi 1.1 ke branch main", priority: "Sedang", done: false }
];

let tasks = JSON.parse(localStorage.getItem("fokuskita_v11_tasks")) || defaultTasks;
let currentFilter = "all";
let timeLeft = 25 * 60;
let timerId = null;
let isRunning = false;

const timerEl = document.getElementById("timer");
const startBtn = document.getElementById("startBtn");
const resetBtn = document.getElementById("resetBtn");
const taskInput = document.getElementById("taskInput");
const prioritySelect = document.getElementById("prioritySelect");
const addTaskBtn = document.getElementById("addTaskBtn");
const taskList = document.getElementById("taskList");
const taskCount = document.getElementById("taskCount");
const themeBtn = document.getElementById("themeBtn");

function playBeep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  } catch (e) {}
}

themeBtn.addEventListener("click", () => {
  document.body.classList.toggle("light-mode");
  const isLight = document.body.classList.contains("light-mode");
  themeBtn.textContent = isLight ? "🌙 Mode Gelap" : "☀️ Mode Terang";
});

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
        playBeep();
        alert("Waktu sesi selesai!");
      }
    }, 1000);
  }
});

resetBtn.addEventListener("click", () => {
  clearInterval(timerId);
  isRunning = false;
  startBtn.textContent = "Mulai";
  timeLeft = 25 * 60;
  updateTimerDisplay();
});

function saveTasks() {
  localStorage.setItem("fokuskita_v11_tasks", JSON.stringify(tasks));
}

window.setFilter = function(filter, btnId) {
  currentFilter = filter;
  document.querySelectorAll(".filter-tabs button").forEach(b => b.classList.remove("active-mode"));
  document.getElementById(btnId).classList.add("active-mode");
  renderTasks();
};

function renderTasks() {
  taskList.innerHTML = "";
  const filtered = tasks.filter(t => {
    if (currentFilter === "active") return !t.done;
    if (currentFilter === "done") return t.done;
    return true;
  });

  filtered.forEach(task => {
    const prio = task.priority || "Sedang";
    const li = document.createElement("li");
    li.className = "task-item" + (task.done ? " completed" : "");
    li.innerHTML = `
      <div class="task-left" onclick="toggleTask(${task.id})">
        <input type="checkbox" ${task.done ? "checked" : ""} />
        <span class="prio-badge prio-${prio}">${prio}</span>
        <span class="task-title">${task.text}</span>
      </div>
      <button class="delete-btn" onclick="deleteTask(${task.id})">Hapus</button>
    `;
    taskList.appendChild(li);
  });
  const remaining = tasks.filter(t => !t.done).length;
  taskCount.textContent = `${remaining} tugas aktif dari total ${tasks.length}`;
}

window.toggleTask = function(id) {
  tasks = tasks.map(t => t.id === id ? { ...t, done: !t.done } : t);
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
  tasks.push({ id: Date.now(), text: val, priority: prioritySelect.value, done: false });
  taskInput.value = "";
  saveTasks();
  renderTasks();
}

addTaskBtn.addEventListener("click", addTask);
taskInput.addEventListener("keypress", e => {
  if (e.key === "Enter") addTask();
});

updateTimerDisplay();
renderTasks();
