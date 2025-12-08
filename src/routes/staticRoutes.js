const express = require('express');
const about = require('../controllers/aboutController');
const router = express.Router();

router.get('/about', about.index);

module.exports = router;
