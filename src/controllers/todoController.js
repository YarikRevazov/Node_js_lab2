const todo = require('../models/todo');
const appName = process.env.APP_NAME || 'TodoApp';

const VALID = new Set(['all', 'active', 'completed']);
const norm = s => (VALID.has(s) ? s : 'all');

exports.index = (req, res) => {
  const status = norm(req.query.status);
  const tasks = todo.all();
  const filtered =
    status === 'active' ? tasks.filter(t => !t.completed) :
    status === 'completed' ? tasks.filter(t => t.completed) :
    tasks;

  res.render('index', { title: 'Список задач', appName, tasks: filtered, status });
};

exports.newForm = (req, res) => {
  res.render('new', { title: 'Новая задача', appName, status: norm(req.query.status) });
};

exports.create = (req, res) => {
  const title = (req.body.title || '').trim();
  const status = norm(req.query.status || req.body.status);
  if (!title) {
    return res.status(400).render('new', {
      title: 'Новая задача',
      appName,
      error: 'Введите название задачи',
      titleValue: req.body.title || '',
      status
    });
  }
  todo.create(title);
  return res.redirect(status === 'all' ? '/' : '/?status=' + status);
};

exports.toggle = (req, res) => {
  const status = norm(req.query.status || req.body.status);
  todo.toggle(req.params.id);
  return res.redirect(status === 'all' ? '/' : '/?status=' + status);
};

exports.delete = (req, res) => {
  const status = norm(req.query.status || req.body.status);
  todo.remove(req.params.id);
  return res.redirect(status === 'all' ? '/' : '/?status=' + status);
};
