const { Todo, Category } = require('../models');
const { Op } = require('sequelize');

module.exports = {
  async getAll(req, res) {
    try {
      const {
        category,   // фильтрация по категории
        search,     // поиск по названию
        sort,       // сортировка
        page = 1,   // пагинация
        limit = 10
      } = req.query;

      const where = {};

      // 🔹 Фильтрация по категории
      if (category) {
        where.category_id = category;
      }

      // 🔹 Поиск по названию
      if (search) {
        where.title = { [Op.iLike]: `%${search}%` }; // регистронезависимый поиск
      }

      // 🔹 Сортировка
      let order = [['created_at', 'DESC']];
      if (sort) {
        const [field, direction] = sort.split(':');
        order = [[field || 'created_at', direction?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC']];
      }

      // 🔹 Пагинация
      const offset = (page - 1) * limit;

      const { count, rows } = await Todo.findAndCountAll({
        where,
        include: [{ model: Category, as: 'category' }],
        limit: parseInt(limit),
        offset,
        order,
      });

      res.json({
        data: rows,
        meta: {
          total: count,
          count: rows.length,
          limit: parseInt(limit),
          pages: Math.ceil(count / limit),
          currentPage: parseInt(page),
        },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Ошибка при получении списка задач' });
    }
  },


 async getById(req, res) {
  try {
    const todo = await Todo.findOne({
      where: { id: req.params.id },
      include: [{ model: Category, as: 'category' }]
    });

    if (!todo) {
      return res.status(404).json({ message: 'Задача не найдена' });
    }

    res.json(todo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
},


  async create(req, res) {
    try {
      const { title, category_id, due_date } = req.body;
      const newTodo = await Todo.create({ title, category_id, due_date });
      res.status(201).json(newTodo);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  async update(req, res) {
    const todo = await Todo.findByPk(req.params.id);
    if (!todo) return res.status(404).json({ message: 'Задача не найдена' });

    await todo.update(req.body);
    res.json(todo);
  },

  async toggle(req, res) {
    const todo = await Todo.findByPk(req.params.id);
    if (!todo) return res.status(404).json({ message: 'Задача не найдена' });

    todo.completed = !todo.completed;
    await todo.save();
    res.json(todo);
  },

  async remove(req, res) {
    const todo = await Todo.findByPk(req.params.id);
    if (!todo) return res.status(404).json({ message: 'Задача не найдена' });

    await todo.destroy();
    res.status(204).send();
  }
};