# 💰 PayPlanner

Веб-приложение для управления подписками с Telegram Mini App интеграцией.

## 🚀 Быстрый старт

### С Docker (рекомендуется)

```bash
# 1. Клонировать репозиторий
git clone https://github.com/Pailon/PayPlanner.git
cd PayPlanner

# 2. Настроить переменные окружения
cp .env.example .env
cp backend/.env.example backend/.env

# Сгенерировать секретные ключи
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# 3. Запустить базы данных
docker-compose -f docker-compose.dev.yml up -d

# 4. Запустить миграции
cd backend
npm install
npm run migrate

# 5. Запустить приложение
npm run dev  # Backend (порт 3000)

# В новом терминале
cd ../frontend
npm install
npm run dev  # Frontend (порт 3001)
```

Готово! Приложение доступно на http://localhost:3001

### Без Docker

Требуется установленные PostgreSQL и Redis. См. документацию в `backend/README.md`

## 📚 Документация

- **[DOCKER_SETUP.md](DOCKER_SETUP.md)** - полная инструкция по Docker (разработка + продакшен)
- **[DEPLOYMENT_TIMEWEB_CLOUD.md](DEPLOYMENT_TIMEWEB_CLOUD.md)** - деплой на Timeweb Cloud
- **[PayPlannerBackend/README.md](PayPlannerBackend/README.md)** - Backend API
- **[PayPlannerFrontend/README.md](PayPlannerFrontend/README.md)** - Frontend

## 🏗️ Архитектура

```
PayPlanner/
├── docker-compose.dev.yml       # Docker для разработки
├── docker-compose.prod.yml      # Docker для продакшена
├── .env.example                 # Шаблон переменных
├── backups/                     # Бекапы БД
├── backend/                     # Node.js + Express + Telegraf
│   ├── scripts/                 # Скрипты бекапов и миграций
│   └── src/                     # Исходный код
└── frontend/                    # React + Vite + Redux + Ant Design
    └── src/                     # Исходный код
```

## 🛠️ Технологии

**Backend:**
- Node.js + TypeScript
- Express (REST API)
- Telegraf.js (Telegram Bot)
- PostgreSQL (БД)
- Redis (кеш + очереди)
- Bull (фоновые задачи)

**Frontend:**
- React + TypeScript
- Vite (сборка)
- Redux Toolkit (state)
- Ant Design (UI)
- Tailwind CSS (стили)

## 💾 Бекапы

```bash
# Создать бекап
cd backend/scripts
./backup.sh

# Восстановить из бекапа
./restore.sh backup_2024-11-04_15-30-00.sql

# Настроить автобекап (Raspberry Pi)
crontab -e
# Добавить: 0 3 * * * /path/to/backup-cron.sh
```

Подробнее в [DOCKER_SETUP.md](DOCKER_SETUP.md#работа-с-бекапами)

## 🔐 Безопасность

- ✅ JWT аутентификация
- ✅ Шифрование чувствительных данных
- ✅ Rate limiting
- ✅ CORS настройки
- ✅ Helmet.js защита

## 📦 Развертывание

### Raspberry Pi (Ubuntu)

```bash
# Полная инструкция в DOCKER_SETUP.md
docker-compose -f docker-compose.prod.yml up -d
```

### Облако (Timeweb Cloud)

См. [DEPLOYMENT_TIMEWEB_CLOUD.md](DEPLOYMENT_TIMEWEB_CLOUD.md)

## 🤝 Разработка

```bash
# Запустить линтер
npm run lint

# Исправить ошибки линтера
npm run lint:fix

# Сборка проекта
npm run build
```

## 📄 Лицензия

MIT

## 📧 Контакты

- GitHub: [PayPlanner](https://github.com/Pailon/PayPlanner)

