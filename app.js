const defaultTasks = [
  { id: 1, text: "Inisialisasi repositori Git lokal", done: true },
  { id: 2, text: "Buat struktur kode HTML, CSS, dan JS", done: true },
  { id: 3, text: "Push proyek ke repositori GitHub", done: false }
];

let tasks = JSON.parse(localStorage.getItem("fokuskita_tasks")) || defaultTasks;
let timeLeft = 25 * 60;
let timerId = null;
let isRunning = false;

const timerEl = document.getElementById("timer");
const startBtn = document.getElementById("startBtn");
const resetBtn = document.getElementById("resetBtn");
const taskInput = document.getElementById("taskInput");
const addTaskBtn = document.getElementById("addTaskBtn");
const taskList = document.getElementById("taskList");
const taskCount = document.getElementById("taskCount");

function formatTime(sec) {
  const m = Math.floor(sec / 60).toString().padStart(2, "0");
  const s = (sec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function updateTimerDisplay() {
  timerEl.textContent = formatTime(timeLeft);
}

function setMode(minutes, btnId) {
  clearInterval(timerId);
  isRunning = false;
  startBtn.textContent = "Mulai";
  timeLeft = minutes * 60;
  updateTimerDisplay();
  document.querySelectorAll(".mode-buttons button").forEach(b => b.classList.remove("active-mode"));
  document.getElementById(btnId).classList.add("active-mode");
}

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
  localStorage.setItem("fokuskita_tasks", JSON.stringify(tasks));
}

function renderTasks() {
  taskList.innerHTML = "";
  tasks.forEach(task => {
    const li = document.createElement("li");
    li.className = "task-item" + (task.done ? " completed" : "");
    li.innerHTML = `
      <div class="task-left" onclick="toggleTask(${task.id})">
        <input type="checkbox" ${task.done ? "checked" : ""} />
        <span>${task.text}</span>
      </div>
      <button class="delete-btn" onclick="deleteTask(${task.id})">Hapus</button>
    `;
    taskList.appendChild(li);
  });
  const remaining = tasks.filter(t => !t.done).length;
  taskCount.textContent = `${remaining} tugas belum selesai`;
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

window.setMode = setMode;

function addTask() {
  const val = taskInput.value.trim();
  if (!val) return;
  tasks.push({ id: Date.now(), text: val, done: false });
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
