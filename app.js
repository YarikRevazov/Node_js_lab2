require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');

const categoryRoutes = require('./routes/categoryRoutes');
const todoRoutes = require('./routes/todoRoutes');

const app = express();

app.use(express.json());

const { swaggerUi, swaggerSpec } = require('./swagger');

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));


app.use(express.urlencoded({ extended: true })); // ← исправленный вариант
app.use(bodyParser.json());


app.use(bodyParser.json());

// ✅ Маршруты
app.use('/api/categories', categoryRoutes);
app.use('/api/todos', todoRoutes);

// 404
app.use((req, res) => {
  res.status(404).json({ message: 'Маршрут не найден' });
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
});