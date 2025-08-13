const STORAGE_KEY = "workflow_plus_tasks_agenda_archive";
let tasks = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
const columns = {
  todo: document.getElementById("todo"),
  doing: document.getElementById("doing"),
  done: document.getElementById("done"),
};
const agendaTasksDiv = document.getElementById("agendaTasks");
const archivedTasksDiv = document.getElementById("archivedTasks");

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function updateCounters() {
  document.getElementById("count-todo").textContent = `(${
    tasks.filter((t) => t.status === "todo" && !t.archived).length
  })`;
  document.getElementById("count-doing").textContent = `(${
    tasks.filter((t) => t.status === "doing" && !t.archived).length
  })`;
  document.getElementById("count-done").textContent = `(${
    tasks.filter((t) => t.status === "done" && !t.archived).length
  })`;
}

function renderAgenda() {
  agendaTasksDiv.innerHTML = "";
  const today = new Date().toISOString().slice(0, 10);
  console.log(today);
  const todayTasks = tasks.filter(
    (t) => t.deadline === today && t.status !== "done" && !t.archived
  );
  if (todayTasks.length === 0) {
    agendaTasksDiv.innerHTML = "<p>Sem tarefas para hoje 🎉</p>";
    return;
  }
  todayTasks.forEach((task) => {
    const el = createTaskElement(task);
    agendaTasksDiv.appendChild(el);
  });
}

function renderArchived() {
  archivedTasksDiv.innerHTML = "";
  const archived = tasks.filter((t) => t.archived);
  if (archived.length === 0) {
    archivedTasksDiv.innerHTML = "<p>Nenhuma tarefa arquivada.</p>";
    return;
  }
  archived.forEach((task) => {
    const el = createTaskElement(task, true);
    archivedTasksDiv.appendChild(el);
  });
}

function renderTasks() {
  Object.values(columns).forEach((col) => (col.innerHTML = ""));
  tasks
    .filter((t) => !t.archived)
    .forEach((task) => {
      const el = createTaskElement(task);
      columns[task.status].appendChild(el);
    });
  updateCounters();
  renderAgenda();
  renderArchived();
  saveTasks();
}

function createTaskElement(task, isArchived = false) {
  const el = document
    .getElementById("taskTpl")
    .content.firstElementChild.cloneNode(true);
  el.querySelector(".title").textContent = `${task.title} ${
    task.deadline ? `— ${task.deadline}` : ""
  }`;
  if (
    task.deadline &&
    new Date(task.deadline) < new Date() &&
    task.status !== "done"
  ) {
    el.classList.add("overdue");
  }
  if (!isArchived) {
    el.addEventListener("dragstart", (e) =>
      e.dataTransfer.setData("text/plain", task.id)
    );
  }
  el.querySelector(".edit").addEventListener("click", () => editTask(task.id));
  el.querySelector(".archive").addEventListener("click", () =>
    archiveTask(task.id)
  );
  return el;
}

function addTask() {
  const title = prompt("Título da tarefa:");
  if (!title) return;
  const deadline = prompt("Prazo (AAAA-MM-DD):");
  tasks.push({
    id: Date.now().toString(),
    title,
    deadline,
    status: "todo",
    archived: false,
  });
  renderTasks();
}

function editTask(id) {
  const task = tasks.find((t) => t.id === id);
  if (!task) return;
  const newTitle = prompt("Novo título:", task.title);
  if (newTitle !== null) task.title = newTitle;
  const newDeadline = prompt("Novo prazo (AAAA-MM-DD):", task.deadline || "");
  if (newDeadline !== null) task.deadline = newDeadline;
  renderTasks();
}

function archiveTask(id) {
  const task = tasks.find((t) => t.id === id);
  if (task) {
    task.archived = true;
    renderTasks();
  }
}

document.getElementById("addBtn").addEventListener("click", addTask);

document.querySelectorAll(".column").forEach((col) => {
  col.addEventListener("dragover", (e) => e.preventDefault());
  col.addEventListener("drop", (e) => {
    const id = e.dataTransfer.getData("text/plain");
    const task = tasks.find((t) => t.id === id);
    if (task) {
      task.status = col.getAttribute("data-status");
      renderTasks();
    }
  });
});

renderTasks();
