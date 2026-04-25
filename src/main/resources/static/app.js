const API_URL = "/api/v1/tasks";

let state = {
    tasks: [],
    filter: "today"
};

document.addEventListener("DOMContentLoaded", () => {
    bindEvents();
    fetchTasks();
});

/* API */
async function fetchTasks() {
    const res = await fetch(API_URL);
    state.tasks = await res.json();
    render();
}

async function createTask(task) {
    const res = await fetch(API_URL, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(task)
    });
    state.tasks.push(await res.json());
    render();
}

async function updateTask(task) {
    const res = await fetch(`${API_URL}/${task.id}`, {
        method: "PUT",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(task)
    });
    const updated = await res.json();
    state.tasks = state.tasks.map(t => t.id === updated.id ? updated : t);
    render();
}

async function deleteTask(id) {
    await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    state.tasks = state.tasks.filter(t => t.id !== id);
    render();
}

/* Events */
function bindEvents() {
    document.getElementById("openModalBtn").onclick = () => toggleModal(true);
    document.getElementById("cancelBtn").onclick = () => toggleModal(false);
    document.getElementById("createBtn").onclick = handleCreate;

    document.querySelectorAll("[data-filter]").forEach(btn => {
        btn.onclick = () => {
            state.filter = btn.dataset.filter;
            setActive(btn);
            render();
        };
    });
}

function handleCreate() {
    const task = {
        title: title.value,
        description: description.value,
        date: date.value,
        priority: priority.value,
        completed: false
    };

    if (!task.title.trim()) return;

    createTask(task);
    toggleModal(false);
}

/* Render */
function render() {
    const list = document.getElementById("taskList");
    const empty = document.getElementById("emptyState");
    list.innerHTML = "";

    const today = new Date().toISOString().split("T")[0];

    let filtered = state.tasks;

    if (state.filter === "today") {
        filtered = filtered.filter(t => t.date === today && !t.completed);
    } else if (state.filter === "scheduled") {
        filtered = filtered.filter(t => t.date && !t.completed);
    } else if (state.filter === "completed") {
        filtered = filtered.filter(t => t.completed);
    }

    if (filtered.length === 0) {
        empty.classList.remove("hidden");
        return;
    } else {
        empty.classList.add("hidden");
    }

    filtered.forEach(task => {
        const li = document.createElement("li");
        li.className = `task priority-${task.priority || "LOW"} ${task.completed ? "completed" : ""}`;

        li.innerHTML = `
            <div>
                <strong>${task.title}</strong><br>
                <small>${task.description || ""}</small>
            </div>
            <div class="task-actions">
                <button onclick='toggle(${JSON.stringify(task)})'>✔</button>
                <button onclick='removeTask(${task.id})'>✖</button>
            </div>
        `;

        list.appendChild(li);
    });
}

/* Helpers */
function toggle(task) {
    updateTask({ ...task, completed: !task.completed });
}

function removeTask(id) {
    deleteTask(id);
}

function toggleModal(show) {
    document.getElementById("modal").classList.toggle("hidden", !show);
}

function setActive(btn) {
    document.querySelectorAll("[data-filter]").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
}