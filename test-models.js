const { Sequelize } = require('sequelize');
const db = require('./models');

(async () => {
  try {
    console.log('🧠 Проверяем подключение и модели...');

    // Проверяем соединение
    await db.sequelize.authenticate();
    console.log('✅ Подключение успешно!');

    // Создаем категорию
    const category = await db.Category.create({ name: 'Работа' });
    console.log('📁 Категория создана:', category.toJSON());

    // Создаем задачу
    const todo = await db.Todo.create({
      title: 'Подготовить отчёт по проекту',
      completed: false,
      category_id: category.id
    });
    console.log('📝 Задача создана:', todo.toJSON());

    // Получаем задачи вместе с категорией
    const todos = await db.Todo.findAll({ include: 'category' });
    console.log('\n📋 Все задачи с категориями:');
    console.dir(JSON.parse(JSON.stringify(todos)), { depth: null });

    // Удаляем тестовые данные (по желанию)
    // await category.destroy();

    await db.sequelize.close();
    console.log('🔌 Соединение закрыто.');
  } catch (error) {
    console.error('❌ Ошибка:', error);
  }
})();