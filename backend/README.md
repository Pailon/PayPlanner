# PayPlaner Backend

Backend API и Telegram бот для управления подписками.

## Технологии

- **Node.js** с TypeScript
- **Express** - REST API
- **Telegraf.js** - Telegram Bot API
- **PostgreSQL** - основная база данных
- **Redis** - кеширование и очереди
- **Bull** - управление очередями задач

## Быстрый старт

1. Убедитесь, что у вас установлены и запущены PostgreSQL и Redis

2. Установите зависимости:
```bash
npm install
```

3. Создайте файл `.env` в корне проекта (см. `.env.example`)

4. Запустите миграции БД:
```bash
npm run migrate
```

5. Запустите проект для разработки:
```bash
npm run dev
```

## Структура проекта

```
.
├── src/
│   ├── bot/              # Telegram бот
│   ├── config/           # Конфигурация БД и Redis
│   ├── data/             # Статические данные (каталог)
│   ├── db/               # Миграции и работа с БД
│   ├── middleware/       # Express middleware
│   ├── models/           # Модели данных
│   ├── routes/           # API маршруты
│   ├── utils/            # Утилиты (JWT, шифрование)
│   └── workers/          # Фоновые задачи (уведомления)
├── Dockerfile
└── package.json
```

## Переменные окружения

1. Скопируйте `.env.example` в `.env`:
```bash
cp .env.example .env
```

2. Заполните все необходимые переменные в `.env`:
   - **TELEGRAM_BOT_TOKEN**: Получите у [@BotFather](https://t.me/BotFather)
   - **JWT_SECRET**: Сгенерируйте случайную строку минимум 32 символа
     ```bash
     node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
     ```
   - **ENCRYPTION_KEY**: Сгенерируйте 32-байтный ключ в hex формате (64 символа)
     ```bash
     node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
     ```
   - **WEB_APP_URL**: URL вашего развернутого фронтенда (обязательно HTTPS для Telegram Mini App)
   - **POSTGRES_HOST**: Хост PostgreSQL базы данных
   - **POSTGRES_PORT**: Порт PostgreSQL (обычно 5432)
   - **POSTGRES_USER**: Имя пользователя PostgreSQL
   - **POSTGRES_PASSWORD**: Пароль PostgreSQL
   - **POSTGRES_DB**: Имя базы данных PostgreSQL
   - **REDIS_HOST**: Хост Redis сервера
   - **REDIS_PORT**: Порт Redis (обычно 6379)
   - **REDIS_PASSWORD**: Пароль Redis (опционально, требуется для облачных Redis)
   - **ALLOWED_ORIGINS**: Разрешенные домены для CORS (через запятую)

## Команды

- `npm run dev` - запуск в режиме разработки
- `npm run build` - сборка проекта
- `npm run start` - запуск собранного проекта
- `npm run migrate` - выполнение миграций БД
- `npm run lint` - проверка кода линтером
- `npm run lint:fix` - автоматическое исправление ошибок линтера

## API Endpoints

- `POST /api/auth/telegram` - авторизация через Telegram
- `GET /api/subscriptions` - список подписок
- `POST /api/subscriptions` - создание подписки
- `PUT /api/subscriptions/:id` - обновление подписки
- `DELETE /api/subscriptions/:id` - удаление подписки
- `GET /api/catalog` - каталог сервисов
- `GET /api/statistics` - статистика подписок

