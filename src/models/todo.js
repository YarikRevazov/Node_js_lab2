const crypto = require('crypto');

function genId() {
  return crypto.randomUUID ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36);
}

const todos = []; // { id, title, completed, createdAt }

function all() { return todos; }

function create(title) {
  const t = { id: genId(), title, completed: false, createdAt: new Date() };
  todos.push(t);
  return t;
}

function toggle(id) {
  const i = todos.findIndex(t => t.id === id);
  if (i !== -1) todos[i].completed = !todos[i].completed;
}

function remove(id) {
  const i = todos.findIndex(t => t.id === id);
  if (i !== -1) todos.splice(i, 1);
}

module.exports = { all, create, toggle, remove };
