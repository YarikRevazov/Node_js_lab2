# Лабораторная работа №2 — Работа с базой данных (Todo REST API)

## Цель работы
1. Научиться проектировать и реализовывать REST API с несколькими связанными сущностями.
2. Освоить работу с PostgreSQL в Node.js + Express, используя ORM (я выбрал Prisma) либо сырой SQL.
3. Реализовать корректные операции CRUD, а также фильтрацию, сортировку и пагинацию.
4. Отработать принципы связи «один ко многим» (1:N) между категориями и задачами.


## Краткое условие (что требуется)
- Реализовать сервис управления задачами как REST API (без HTML), только JSON.
- Сущности: categories (категории задач) и todos (задачи).
- Обязательные возможности: просмотр, создание, редактирование, удаление, переключение статуса задач; фильтрация по категории, поиск по заголовку, пагинация, сортировка.
- Схема БД по заданию:
  - categories: id SERIAL PK, name VARCHAR(100), created_at, updated_at.
  - todos: id UUID PK, title TEXT (2..120), completed BOOLEAN DEFAULT false, category_id INT NULL FK, due_date TIMESTAMP NULL, created_at, updated_at.
- Документация API — Swagger.

### Шаг 1. Создание базы данных (миграции)
Что я выбрал: PostgreSQL + Prisma Migrate.

1. Установил PostgreSQL, убедился, что доступен psql в CMD.
2. Создал отдельную БД и пользователя для проекта:
      CREATE DATABASE todo_db;
   CREATE USER todo_user WITH PASSWORD 'todo_pass';
   GRANT ALL PRIVILEGES ON DATABASE todo_db TO todo_user;
   ![alt text](image-1.png)
   \c todo_db
   GRANT ALL ON SCHEMA public TO todo_user;
   
   <img width="860" height="684" alt="image" src="https://github.com/user-attachments/assets/b03d32c6-ca67-441d-8dc6-efe7108042d1" />

3. В файле .env прописал строку подключения:
      DATABASE_URL=postgresql://todo_user:todo_pass@localhost:5432/todo_db?schema=public
   
4. Инициализировал Prisma и описал модели (см. Шаг 2), затем прогнал миграции:
      npx prisma migrate dev --name init
   
   В результате у меня создались таблицы categories и todos с нужной структурой и связью.
<img width="1574" height="160" alt="image" src="https://github.com/user-attachments/assets/d21ca0f5-66a5-4909-b3e2-1f05255c4279" />
<img width="810" height="64" alt="image" src="https://github.com/user-attachments/assets/845fe64e-1fd0-4531-9278-42c173a050d8" />

---

### Шаг 2. Создание моделей (ORM)
Описал две модели в prisma/schema.prisma, добавил связь 1:N и поля из ТЗ. Валидацию длины заголовка (2–120) реализовал на уровне контроллера, чтобы выдавать понятное сообщение об ошибке до записи в БД.

datasource db { provider = "postgresql"; url = env("DATABASE_URL") }
generator client { provider = "prisma-client-js" }

model Category {
  id         Int      @id @default(autoincrement())
  name       String   @db.VarChar(100)
  created_at DateTime @default(now())
  updated_at DateTime @updatedAt
  todos      Todo[]
}

model Todo {
  id          String    @id @default(uuid())
  title       String
  completed   Boolean   @default(false)
  category_id Int?
  due_date    DateTime?
  created_at  DateTime  @default(now())
  updated_at  DateTime  @updatedAt

  category    Category? @relation(fields: [category_id], references: [id], onDelete: SetNull)
}
- @updatedAt автоматически проставляет текущее время при обновлении.
- Для FK выбрал onDelete: SetNull, чтобы при удалении категории задачи оставались без категории.

---

### Шаг 3. Реализация REST API (только JSON)
Что я сделал: собрал Express‑приложение без HTML‑шаблонов. Подключил express.json(), написал роуты /api/categories и /api/todos, вынес логику в контроллеры/сервисы, и сделал централизованный обработчик ошибок, возвращающий единый JSON‑формат ошибок.

#### 3.1. Категории
- GET /api/categories — список всех категорий (200).
- GET /api/categories/:id — категория по id (200 / 404).
- POST /api/categories — создать (поле name) → 201.
- PUT /api/categories/:id — изменить name → 200 / 404.
- DELETE /api/categories/:id — удалить → 204 / 404.
- Примеры: 
<img width="823" height="678" alt="image" src="https://github.com/user-attachments/assets/7848bd4a-4b70-4763-bd44-6daed94d3d97" />
<img width="832" height="685" alt="image" src="https://github.com/user-attachments/assets/4b7993c5-a6b9-495e-9fdb-dd48d266fbc3" />
<img width="820" height="674" alt="image" src="https://github.com/user-attachments/assets/f4202679-cb25-40e0-9732-8f9694ad6631" />


#### 3.2. Задачи
- GET /api/todos — список задач c поддержкой:
  - ?category=<id> — фильтр по категории;
  - ?search=<строка> — поиск по названию (регистронезависимо);
  - ?sort=createdAt:asc|desc или ?sort=title:asc|desc;
  - ?page=<n>&limit=<m> — пагинация (по умолчанию page=1, limit=10).
- GET /api/todos/:id — задача по id (200 / 404).
- POST /api/todos — создать (title, опц. category_id, опц. due_date) → 201.
- PUT /api/todos/:id — изменить (title, completed, category_id, due_date) → 200 / 404.
- PATCH /api/todos/:id/toggle — переключить completed → 200 / 404.
- DELETE /api/todos/:id — удалить → 204 / 404.

Требование из ТЗ: при GET /api/todos каждая задача должна включать вложенное поле category:
<img width="820" height="704" alt="image" src="https://github.com/user-attachments/assets/4f76f12a-9f68-4e2d-b02c-074a3c0d213f" />


#### 3.3. Формат ответа списка (пагинация)
{
  "data": [ /* массив задач */ ],
  "meta": {
    "total": 100,
    "count": 10,
    "limit": 10,
    "pages": 10,
    "currentPage": 1
  }
}
- total — общее число задач с учётом фильтров/поиска.
- count — размер текущего массива data.
- pages — ceil(total/limit).
<img width="831" height="933" alt="image" src="https://github.com/user-attachments/assets/840b4f5f-4636-4e25-8124-a1205420cd27" />

#### 3.4. Примеры запросов (curl)
# создать категорию
curl -X POST http://localhost:3000/api/categories \
  -H "Content-Type: application/json" \
  -d '{"name":"Покупки"}'

# создать задачу
curl -X POST http://localhost:3000/api/todos \
  -H "Content-Type: application/json" \
  -d '{"title":"Купить молоко","category_id":3}'

# список задач с фильтрами/поиском/сортировкой/пагинацией
curl "http://localhost:3000/api/todos?category=3&search=молоко&sort=createdAt:desc&page=1&limit=5"

# переключить статус
curl -X PATCH http://localhost:3000/api/todos/<uuid>/toggle

#### 3.5. Валидация и ошибки
- title проверяю на длину 2..120 (400 при нарушении).
- category_id валидирую: либо null, либо существующая категория (иначе 400).
- Единый формат ошибок:
{ "error": "ValidationError", "message": "title must be 2..120", "details": [{"field":"title","rule":"min:2"}] }

---

### Шаг 4. Фильтрация, поиск, сортировка, пагинация — как я реализовал
- Фильтрация по категории: ?category=3 → WHERE category_id = 3 (или Prisma where: { category_id: 3 }).
- Поиск: ?search=мол → LOWER(title) LIKE '%мол%' (contains/mode: 'insensitive' в Prisma).
- Сортировка: ?sort=field:dir — принимаю только createdAt/title и asc/desc (белые списки).
- Пагинация: page>=1, limit по умолчанию 10, skip=(page-1)*limit.
- meta считаю отдельным COUNT(*) по тем же фильтрам и возвращаю вместе с data.

---

## Документация API (Swagger)
- Подключил swagger-ui-express + swagger-jsdoc и описал схемы Category, Todo, TodoWithCategory, Meta, TodoListResponse.
- Открыл UI по адресу: http://localhost:3000/api-docs.
- Это позволяет проверяющему видеть все эндпоинты и пробовать их прямо в браузере.

---

## Ответы на контрольные вопросы

1) Что такое реляционная база данных и какие преимущества она предоставляет?  
Реляционная БД хранит данные в таблицах, связанных ключами (PK/FK). Преимущества: целостность (ограничения, транзакции), мощный SQL (JOIN/AGGREGATE), нормализация, индексы, согласованность данных и предсказуемые планы выполнения запросов.

2) Какие типы связей между таблицами существуют в реляционных базах данных?  
Основные: 1:1, 1:N, N:M (через таблицу-связку). В этой работе я использовал 1:N (одна категория — много задач).
3) Что такое RESTful API и для чего он используется?  
REST — стиль проектирования веб‑сервисов, где ресурсы представлены URL, а операции соответствуют методам HTTP (GET/POST/PUT/PATCH/DELETE). Клиент и сервер обмениваются представлениями данных (JSON). Это удобно для отделения фронтенда от бекенда и интеграции разных клиентов.

4) Что такое SQL-инъекция и как защититься от неё?  
SQL-инъекция — внедрение в запрос злоумышленного SQL через ввод пользователя. Защита: параметризованные запросы, ORM, строгая валидация/санитизация ввода, принцип наименьших привилегий для пользователя БД, аудит и логирование.

5) В чём разница между ORM и сырыми SQL-запросами? Преимущества и недостатки?  
ORM: + быстрое развитие, меньше рутины, миграции, типы, защита от инъекций; − накладные расходы, иногда неудобно формулировать сложные запросы.  
Сырые SQL: + полный контроль, тонкая оптимизация; − больше кода, выше риск ошибок/инъекций, сложнее поддерживать миграции и кросс‑СУБД портируемость.

---

## Вывод
Я спроектировал и реализовал Todo REST API на Node.js + Express с PostgreSQL. Я:
- создал схему БД и миграции, 
- описал модели и связь 1:N,
- сделал полный CRUD по categories и todos,
- добавил фильтрацию, поиск, сортировку, пагинацию,
- обеспечил корректные статус‑коды и JSON‑ошибки,
- оформил документацию Swagger.
