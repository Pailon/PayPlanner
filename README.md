# TgPlaner - Telegram Bot для управления подписками

Telegram-бот с мини-приложением для отслеживания и управления платными подписками.

## Технологии

- **Backend**: Node.js, Express, Telegraf.js, PostgreSQL, Redis, Bull
- **Frontend**: React 18+, TypeScript, Redux Toolkit, Ant Design, Tailwind CSS
- **Инфраструктура**: Docker, Docker Compose

## Быстрый старт

1. Установите зависимости:
```bash
npm install
```

2. Создайте файл `.env` в корне проекта (см. `.env.example`)

3. Запустите через Docker:
```bash
docker-compose up -d
```

4. Или для разработки:
```bash
npm run dev
```

## Структура проекта

```
.
├── backend/          # Backend API и Telegram бот
├── frontend/         # React мини-приложение
├── docker-compose.yml
└── README.md
```

## Переменные окружения

1. Скопируйте `.env.example` в `.env`:
```bash
cp .env.example .env
```

2. Заполните все необходимые переменные в `.env`:
   - **TELEGRAM_BOT_TOKEN**: Получите у [@BotFather](https://t.me/BotFather)
     - Откройте Telegram и найдите [@BotFather](https://t.me/BotFather)
     - Отправьте команду `/newbot` и следуйте инструкциям
     - После создания бота вы получите токен в формате `123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11`
     - Скопируйте этот токен в `TELEGRAM_BOT_TOKEN`
   - **JWT_SECRET**: Сгенерируйте случайную строку минимум 32 символа
     ```bash
     node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
     ```
   - **JWT_REFRESH_SECRET**: Сгенерируйте отдельный ключ для refresh токенов (опционально, если не указан, используется JWT_SECRET)
     ```bash
     node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
     ```
   - **ENCRYPTION_KEY**: Сгенерируйте 32-байтный ключ в hex формате (64 символа)
     ```bash
     node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
     ```
   
   **Примечание**: `TELEGRAM_BOT_SECRET` в `.env.example` можно удалить - он не используется. Для валидации используется `TELEGRAM_BOT_TOKEN`.
   - **WEB_APP_URL**: URL вашего развернутого фронтенда (для локальной разработки не обязателен)
     - Используется только для кнопки "Открыть приложение" в команде `/start` бота
     - Для локальной проверки можно оставить значение по умолчанию или использовать туннель (ngrok, Cloudflare Tunnel и т.д.)
     - Telegram Mini Apps требуют HTTPS, поэтому для локальной разработки нужен туннель с HTTPS
   - **ALLOWED_ORIGINS**: Домены Telegram для CORS (обычно оставьте как есть)

