const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Получить список всех категорий
 *     responses:
 *       200:
 *         description: Список категорий
 *   post:
 *     summary: Создать новую категорию
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Категория создана
 */


router.get('/', categoryController.getAll);
router.get('/:id', categoryController.getById);
router.post('/', categoryController.create); // <--- обязательно!
router.put('/:id', categoryController.update);
router.delete('/:id', categoryController.remove);

module.exports = router;