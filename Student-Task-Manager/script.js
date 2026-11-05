
const taskForm = document.getElementById("taskForm");
const taskName = document.getElementById("taskName");
const taskDate = document.getElementById("taskDate");
const taskPriority = document.getElementById("taskPriority");
const taskList = document.getElementById("taskList");
const searchInput = document.getElementById("searchInput");

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let currentFilter = "All";
let editId = null;

// Save tasks in browser storage
function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

// Add or update a task
taskForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const name = taskName.value.trim();

    if (!name) return;

    if (editId !== null) {
        const task = tasks.find(t => t.id === editId);

        task.name = name;
        task.date = taskDate.value;
        task.priority = taskPriority.value;

        editId = null;
        document.getElementById("formTitle").textContent = "Add New Task";
        document.getElementById("submitBtn").textContent = "Add Task";
        document.getElementById("cancelEdit").hidden = true;

    } else {
        const newTask = {
            id: Date.now(),
            name: name,
            date: taskDate.value,
            priority: taskPriority.value,
            completed: false
        };

        tasks.push(newTask);
    }

    saveTasks();
    taskForm.reset();
    displayTasks();
});

// Display tasks
function displayTasks() {
    taskList.innerHTML = "";

    const searchText = searchInput.value.toLowerCase();

    const filteredTasks = tasks.filter(task => {
        const matchesSearch = task.name.toLowerCase().includes(searchText);

        const matchesFilter =
            currentFilter === "All" ||
            (currentFilter === "Pending" && !task.completed) ||
            (currentFilter === "Completed" && task.completed);

        return matchesSearch && matchesFilter;
    });

    document.getElementById("emptyMessage").style.display =
        filteredTasks.length === 0 ? "block" : "none";

    filteredTasks.forEach(task => {
        const taskElement = document.createElement("div");

        taskElement.className =
            `task-item ${task.completed ? "completed" : ""}`;

        taskElement.innerHTML = `
            <div class="task-info">
                <h3>${escapeHTML(task.name)}</h3>
                <p>Due Date: ${escapeHTML(task.date)}</p>
                <p class="priority ${task.priority}">
                    Priority: ${task.priority}
                </p>
                <p>Status: ${task.completed ? "Completed" : "Pending"}</p>
            </div>

            <div class="task-actions">
                <button class="complete-btn"
                    data-action="complete" data-id="${task.id}">
                    ${task.completed ? "Undo" : "Complete"}
                </button>

                <button class="edit-btn"
                    data-action="edit" data-id="${task.id}">
                    Edit
                </button>

                <button class="delete-btn"
                    data-action="delete" data-id="${task.id}">
                    Delete
                </button>
            </div>
        `;

        taskList.appendChild(taskElement);
    });

    updateStatistics();
}

// Protect task names when displaying HTML
function escapeHTML(value) {
    return value.replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}

// Handle task actions
taskList.addEventListener("click", function(event) {
    const button = event.target.closest("button[data-action]");

    if (!button) return;

    const id = Number(button.dataset.id);
    const action = button.dataset.action;

    if (action === "complete") {
        const task = tasks.find(t => t.id === id);
        task.completed = !task.completed;
    }

    if (action === "delete") {
        if (!confirm("Are you sure you want to delete this task?")) {
            return;
        }

        tasks = tasks.filter(t => t.id !== id);
    }

    if (action === "edit") {
        const task = tasks.find(t => t.id === id);

        taskName.value = task.name;
        taskDate.value = task.date;
        taskPriority.value = task.priority;

        editId = id;

        document.getElementById("formTitle").textContent = "Edit Task";
        document.getElementById("submitBtn").textContent = "Update Task";
        document.getElementById("cancelEdit").hidden = false;

        taskName.focus();
        return;
    }

    saveTasks();
    displayTasks();
});

// Cancel editing
document.getElementById("cancelEdit").addEventListener("click", function() {
    editId = null;
    taskForm.reset();

    document.getElementById("formTitle").textContent = "Add New Task";
    document.getElementById("submitBtn").textContent = "Add Task";
    this.hidden = true;
});

// Search tasks
searchInput.addEventListener("input", displayTasks);

// Filter tasks
document.querySelectorAll(".filter-btn").forEach(button => {
    button.addEventListener("click", function() {
        currentFilter = this.dataset.filter;

        document.querySelectorAll(".filter-btn").forEach(btn => {
            btn.classList.remove("active");
        });

        this.classList.add("active");
        displayTasks();
    });
});

// Update statistics
function updateStatistics() {
    document.getElementById("totalTasks").textContent = tasks.length;

    document.getElementById("completedTasks").textContent =
        tasks.filter(t => t.completed).length;

    document.getElementById("pendingTasks").textContent =
        tasks.filter(t => !t.completed).length;
}

// Initial display
displayTasks();
