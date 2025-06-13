let subtasks = [];

function addSubtask() {
  let input = document.querySelector('.subtask-input');
  let title = input.value.trim();
  if (!title) return;

  let subtaskId = `sub${subtasks.length + 1}`;
  subtasks.push({ id: subtaskId, title, done: false });

  renderSubtaskList(subtaskId, title);
  input.value = "";
}

function renderSubtaskList(id, title) {
  let li = document.createElement('li');
  li.className = 'subtask-item';
  li.id = `subtask-${id}`;
  li.textContent = title;
  document.getElementById('subtask-list').appendChild(li);
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelector('.add-subtask-button').addEventListener('click', addSubtask);
});