const { Category } = require('../models');

module.exports = {
  async getAll(req, res) {
    const categories = await Category.findAll();
    res.json(categories);
  },

  async getById(req, res) {
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ message: 'Категория не найдена' });
    res.json(category);
  },

  async create(req, res) {
    try {
      const { name } = req.body;
      const newCategory = await Category.create({ name });
      res.status(201).json(newCategory);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  async update(req, res) {
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ message: 'Категория не найдена' });

    await category.update(req.body);
    res.json(category);
  },

  async remove(req, res) {
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ message: 'Категория не найдена' });

    await category.destroy();
    res.status(204).send();
  }
};