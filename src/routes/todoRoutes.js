const express = require('express');
const c = require('../controllers/todoController');
const router = express.Router();

router.get('/', c.index);
router.get('/new', c.newForm);
router.post('/new', c.create);
router.post('/:id/toggle', c.toggle);
router.post('/:id/delete', c.delete);

module.exports = router;
