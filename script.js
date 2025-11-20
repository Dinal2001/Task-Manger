let tasks = [];
let editingTaskId = null;

function loadTasks() {
  const savedTasks = localStorage.getItem("tasks");
  if (savedTasks) {
    tasks = JSON.parse(savedTasks);
  }
  displayTasks();
  updateStats();
}

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function openModal(taskId = null) {
  const modal = document.getElementById("taskModal");
  const modalTitle = document.getElementById("modalTitle");
  const statusGroup = document.getElementById("statusGroup");

  if (taskId) {
    const task = tasks.find((t) => t.id === taskId);
    modalTitle.textContent = "Edit Task";
    document.getElementById("taskTitle").value = task.title;
    document.getElementById("taskDescription").value = task.description;
    document.getElementById("taskDate").value = task.date;
    document.getElementById("taskPriority").value = task.priority;
    document.getElementById("taskStatus").value = task.status;
    statusGroup.style.display = "block";
    editingTaskId = taskId;
  } else {
    modalTitle.textContent = "Add New Task";
    document.getElementById("taskTitle").value = "";
    document.getElementById("taskDescription").value = "";
    document.getElementById("taskDate").value = "";
    document.getElementById("taskPriority").value = "medium";
    document.getElementById("taskStatus").value = "todo";
    statusGroup.style.display = "none";
    editingTaskId = null;
  }

  modal.classList.add("active");
}

function closeModal() {
  document.getElementById("taskModal").classList.remove("active");
  editingTaskId = null;
}

function saveTask() {
  const title = document.getElementById("taskTitle").value.trim();
  const description = document.getElementById("taskDescription").value.trim();
  const date = document.getElementById("taskDate").value;
  const priority = document.getElementById("taskPriority").value;
  const status = document.getElementById("taskStatus").value;

  if (!title || !description || !date) {
    alert("Please fill in all required fields!");
    return;
  }

  if (editingTaskId) {
    const taskIndex = tasks.findIndex((t) => t.id === editingTaskId);
    tasks[taskIndex] = {
      id: editingTaskId,
      title,
      description,
      date,
      priority,
      status,
    };
  } else {
    const newTask = {
      id: Date.now(),
      title,
      description,
      date,
      priority,
      status: "todo",
    };
    tasks.push(newTask);
  }

  saveTasks();
  displayTasks();
  updateStats();
  closeModal();
}

function deleteTask(id) {
  if (confirm("Are you sure you want to delete this task?")) {
    tasks = tasks.filter((t) => t.id !== id);
    saveTasks();
    displayTasks();
    updateStats();
  }
}

function changeStatus(id, newStatus) {
  const task = tasks.find((t) => t.id === id);
  task.status = newStatus;
  saveTasks();
  displayTasks();
  updateStats();
}

function displayTasks() {
  const container = document.getElementById("tasksContainer");
  const searchTerm = document.getElementById("searchInput").value.toLowerCase();
  const priorityFilter = document.getElementById("priorityFilter").value;
  const statusFilter = document.getElementById("statusFilter").value;

  let filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm);
    const matchesPriority =
      priorityFilter === "all" || task.priority === priorityFilter;
    const matchesStatus =
      statusFilter === "all" || task.status === statusFilter;
    return matchesSearch && matchesPriority && matchesStatus;
  });

  if (filteredTasks.length === 0) {
    container.innerHTML = `
            <div class="empty-state" style="grid-column: 1/-1;">
                <h3>📭 No tasks found</h3>
                <p>${
                  tasks.length === 0
                    ? "Get started by adding your first task!"
                    : "Try adjusting your search or filters."
                }</p>
            </div>
        `;
    return;
  }

  container.innerHTML = filteredTasks
    .map(
      (task) => `
        <div class="task-card ${task.priority}">
            <div class="task-header">
                <div class="task-title">${task.title}</div>
                <div class="task-actions">
                    <button class="btn-icon" onclick="openModal(${
                      task.id
                    })" title="Edit">✏️</button>
                    <button class="btn-icon" onclick="deleteTask(${
                      task.id
                    })" title="Delete">🗑️</button>
                </div>
            </div>
            <div class="task-description">${task.description}</div>
            <div class="task-meta">
                <span class="badge ${
                  task.priority
                }">${task.priority.toUpperCase()}</span>
                <span class="badge status">${getStatusText(task.status)}</span>
            </div>
            <div class="task-date">📅 Due: ${formatDate(task.date)}</div>
            <select class="status-select" onchange="changeStatus(${
              task.id
            }, this.value)" value="${task.status}">
                <option value="todo" ${
                  task.status === "todo" ? "selected" : ""
                }>To Do</option>
                <option value="inprogress" ${
                  task.status === "inprogress" ? "selected" : ""
                }>In Progress</option>
                <option value="completed" ${
                  task.status === "completed" ? "selected" : ""
                }>Completed</option>
            </select>
        </div>
    `
    )
    .join("");
}

function updateStats() {
  document.getElementById("totalTasks").textContent = tasks.length;
  document.getElementById("todoTasks").textContent = tasks.filter(
    (t) => t.status === "todo"
  ).length;
  document.getElementById("inProgressTasks").textContent = tasks.filter(
    (t) => t.status === "inprogress"
  ).length;
  document.getElementById("completedTasks").textContent = tasks.filter(
    (t) => t.status === "completed"
  ).length;
}

function filterTasks() {
  displayTasks();
}

function getStatusText(status) {
  const statusMap = {
    todo: "To Do",
    inprogress: "In Progress",
    completed: "Completed",
  };
  return statusMap[status];
}

function formatDate(dateString) {
  const options = { year: "numeric", month: "short", day: "numeric" };
  return new Date(dateString).toLocaleDateString("en-US", options);
}

loadTasks();
