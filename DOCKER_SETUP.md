# 🐳 Docker Setup для PayPlanner

Полная инструкция по настройке и использованию Docker-окружения для разработки и продакшена.

---

## 📋 Содержание

1. [Быстрый старт](#быстрый-старт)
2. [Разработка (Development)](#разработка-development)
3. [Продакшен (Production)](#продакшен-production)
4. [Работа с бекапами](#работа-с-бекапами)
5. [Миграции базы данных](#миграции-базы-данных)
6. [Полезные команды](#полезные-команды)
7. [Устранение проблем](#устранение-проблем)

---

## 🚀 Быстрый старт

### Предварительные требования

- **Docker** 20.10+ и **Docker Compose** 2.0+
- **Node.js** 18+ (для локальной разработки)
- **Git**

### Проверка установки Docker

```bash
docker --version
docker-compose --version
```

---

## 💻 Разработка (Development)

### 1. Создание конфигурации

```bash
# Скопировать шаблон переменных окружения
cp .env.example .env
cp backend/.env.example backend/.env

# Сгенерировать секретные ключи
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2. Редактирование `.env`

Минимальная конфигурация для разработки:

```env
# Backend/.env
TELEGRAM_BOT_TOKEN=ваш_токен_от_BotFather
JWT_SECRET=сгенерированный_ключ_32_символа
ENCRYPTION_KEY=сгенерированный_ключ_64_символа
WEB_APP_URL=http://localhost:3001
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=payplanner
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
ALLOWED_ORIGINS=http://localhost:3001,http://localhost:3000
```

### 3. Запуск баз данных

```bash
# Запустить PostgreSQL и Redis в контейнерах
docker-compose -f docker-compose.dev.yml up -d

# Проверить статус
docker-compose -f docker-compose.dev.yml ps
```

Будут доступны:
- **PostgreSQL**: `localhost:5432`
- **Redis**: `localhost:6379`

### 4. Запуск миграций

```bash
cd backend
npm run migrate
```

### 5. Запуск Backend и Frontend

```bash
# Terminal 1: Backend
cd backend
npm install
npm run dev

# Terminal 2: Frontend
cd frontend
npm install
npm run dev
```

Приложение доступно:
- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:3000

### 6. Остановка

```bash
# Остановить контейнеры (данные сохраняются)
docker-compose -f docker-compose.dev.yml down

# Остановить и удалить volumes (⚠️ УДАЛИТ ВСЕ ДАННЫЕ!)
docker-compose -f docker-compose.dev.yml down -v
```

---

## 🚀 Продакшен (Production)

### 1. Подготовка на Raspberry Pi

```bash
# Обновить систему
sudo apt update && sudo apt upgrade -y

# Установить Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Установить Docker Compose
sudo apt install docker-compose-plugin

# Добавить пользователя в группу docker
sudo usermod -aG docker $USER
newgrp docker
```

### 2. Клонирование проекта

```bash
git clone https://github.com/your-repo/PayPlanner.git
cd PayPlanner
```

### 3. Настройка переменных окружения

```bash
cp .env.example .env
nano .env
```

Заполните продакшн значения:

```env
TELEGRAM_BOT_TOKEN=ваш_токен
JWT_SECRET=сгенерированный_секретный_ключ
ENCRYPTION_KEY=сгенерированный_ключ_шифрования
WEB_APP_URL=https://ваш-домен.com
VITE_API_URL=https://ваш-домен.com/api
VITE_TELEGRAM_BOT_USERNAME=ваш_бот

POSTGRES_USER=postgres
POSTGRES_PASSWORD=надежный_пароль_БД
POSTGRES_DB=payplanner

REDIS_PASSWORD=надежный_пароль_Redis

ALLOWED_ORIGINS=https://ваш-домен.com
```

### 4. Сборка и запуск

```bash
# Сборка образов
docker-compose -f docker-compose.prod.yml build

# Запуск всех сервисов
docker-compose -f docker-compose.prod.yml up -d

# Проверка статусов
docker-compose -f docker-compose.prod.yml ps

# Просмотр логов
docker-compose -f docker-compose.prod.yml logs -f
```

### 5. Проверка работы

```bash
# Проверка Backend
curl http://localhost:3000/health

# Проверка Frontend
curl http://localhost:80
```

### 6. Автозапуск при перезагрузке

Контейнеры настроены с `restart: always` и будут автоматически запускаться.

---

## 💾 Работа с бекапами

### Структура скриптов

Все скрипты находятся в `backend/scripts/`:

- **backup.sh** - ручное создание бекапа
- **restore.sh** - восстановление из бекапа
- **backup-cron.sh** - автоматический бекап с ротацией

### Создание бекапа

```bash
cd backend/scripts

# Linux/Mac
chmod +x backup.sh
./backup.sh

# Windows (Git Bash)
bash backup.sh

# С указанием имени файла
./backup.sh my_backup
```

Бекапы сохраняются в `backups/backup_YYYY-MM-DD_HH-MM-SS.sql`

### Восстановление из бекапа

```bash
cd backend/scripts

# Просмотр доступных бекапов
ls ../../backups/

# Восстановление
chmod +x restore.sh
./restore.sh ../../backups/backup_2024-11-04_15-30-00.sql

# Или просто имя файла
./restore.sh backup_2024-11-04_15-30-00.sql
```

⚠️ **ВНИМАНИЕ**: Восстановление удалит текущую БД и заменит её данными из бекапа!

### Автоматический бекап (Raspberry Pi)

```bash
cd backend/scripts
chmod +x backup-cron.sh

# Настроить cron для ежедневного бекапа в 3:00
crontab -e

# Добавить строку:
0 3 * * * /home/user/PayPlanner/backend/scripts/backup-cron.sh >> /var/log/payplanner-backup.log 2>&1
```

Скрипт автоматически:
- Создает бекап с меткой времени
- Удаляет бекапы старше 7 дней
- Логирует результат

Изменить количество дней хранения:
```bash
nano backup-cron.sh
# Найти строку: DAYS_TO_KEEP=7
# Изменить на нужное значение
```

---

## 🔄 Миграции базы данных

### Автоматические миграции (Production)

В продакшен-контейнере миграции запускаются автоматически при старте.

### Ручной запуск миграций

```bash
# Development
cd backend
npm run migrate

# Production (в контейнере)
docker exec payplanner-backend node dist/db/migrate.js

# Или через скрипт
cd backend/scripts
chmod +x migrate-docker.sh
./migrate-docker.sh dev   # для development
./migrate-docker.sh prod  # для production
```

### Создание новой миграции

```bash
cd backend/src/db/migrations

# Создать файл 002_название_миграции.sql
nano 002_add_new_feature.sql
```

Обновить `migrate.ts` для применения новой миграции.

---

## 🛠️ Полезные команды

### Просмотр логов

```bash
# Все сервисы
docker-compose -f docker-compose.prod.yml logs -f

# Конкретный сервис
docker-compose -f docker-compose.prod.yml logs -f backend
docker-compose -f docker-compose.prod.yml logs -f postgres

# Последние 100 строк
docker-compose -f docker-compose.prod.yml logs --tail=100 backend
```

### Перезапуск сервисов

```bash
# Перезапустить все
docker-compose -f docker-compose.prod.yml restart

# Перезапустить конкретный сервис
docker-compose -f docker-compose.prod.yml restart backend
```

### Проверка состояния

```bash
# Статус контейнеров
docker-compose -f docker-compose.prod.yml ps

# Использование ресурсов
docker stats

# Информация о volumes
docker volume ls
docker volume inspect payplanner_postgres_prod
```

### Подключение к базе данных

```bash
# Подключиться к PostgreSQL
docker exec -it payplanner-postgres psql -U postgres -d payplanner

# Команды в psql:
\dt          # Список таблиц
\d users     # Описание таблицы users
\q           # Выход
```

### Подключение к Redis

```bash
# Без пароля (dev)
docker exec -it payplanner-redis redis-cli

# С паролем (prod)
docker exec -it payplanner-redis redis-cli -a ваш_пароль

# Команды в redis-cli:
PING         # Проверка соединения
KEYS *       # Все ключи
INFO         # Информация о сервере
exit         # Выход
```

### Обновление приложения

```bash
# Получить изменения
git pull

# Пересобрать и перезапустить
docker-compose -f docker-compose.prod.yml up -d --build

# Или отдельно backend
docker-compose -f docker-compose.prod.yml up -d --build backend
```

### Очистка Docker

```bash
# Удалить неиспользуемые образы
docker image prune -a

# Удалить неиспользуемые volumes
docker volume prune

# Полная очистка (⚠️ осторожно!)
docker system prune -a --volumes
```

---

## 🔧 Устранение проблем

### Контейнер не запускается

```bash
# Проверить логи
docker-compose -f docker-compose.prod.yml logs backend

# Проверить healthcheck
docker inspect payplanner-backend | grep -A 10 Health
```

### База данных недоступна

```bash
# Проверить что PostgreSQL запущен
docker-compose -f docker-compose.prod.yml ps postgres

# Проверить логи PostgreSQL
docker-compose -f docker-compose.prod.yml logs postgres

# Проверить соединение
docker exec payplanner-postgres pg_isready -U postgres
```

### Ошибки миграций

```bash
# Посмотреть что в базе
docker exec -it payplanner-postgres psql -U postgres -d payplanner -c "\dt"

# Откатить и применить заново
# 1. Восстановить из бекапа
# 2. Запустить миграции заново
```

### Порты заняты

```bash
# Проверить что использует порт
# Windows
netstat -ano | findstr :3000

# Linux/Mac
lsof -i :3000

# Изменить порты в docker-compose.yml
```

### Недостаточно места на диске

```bash
# Проверить использование
df -h
docker system df

# Очистить
docker system prune -a
cd backups
rm backup_old_*.sql
```

### Проблемы с правами (Linux)

```bash
# Дать права на скрипты
chmod +x backend/scripts/*.sh

# Дать права на папку бекапов
sudo chown -R $USER:$USER backups/
```

---

## 📊 Мониторинг

### Проверка работы сервисов

```bash
# Health checks
curl http://localhost:3000/health
curl http://localhost:80

# Статус контейнеров
docker-compose -f docker-compose.prod.yml ps

# Использование ресурсов
docker stats --no-stream
```

### Размер данных

```bash
# Размер volumes
docker system df -v

# Размер бекапов
du -sh backups/

# Размер логов
du -sh logs/
```

---

## 🔐 Безопасность

### Checklist перед продакшеном

- ✅ Сгенерированы уникальные `JWT_SECRET` и `ENCRYPTION_KEY`
- ✅ Установлены надежные пароли для PostgreSQL и Redis
- ✅ Настроен HTTPS (через nginx/caddy/traefik)
- ✅ Настроены CORS для конкретных доменов
- ✅ `.env` файлы НЕ в Git
- ✅ Настроены автоматические бекапы
- ✅ Настроен мониторинг логов
- ✅ Firewall настроен (открыты только 80, 443)

---

## 📚 Дополнительные ресурсы

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)
- [PostgreSQL Docker Hub](https://hub.docker.com/_/postgres)
- [Redis Docker Hub](https://hub.docker.com/_/redis)

---

## 💡 Советы

1. **Используйте named volumes** для данных БД - они не удаляются при `docker-compose down`
2. **Делайте бекапы перед обновлениями** - всегда можно откатиться
3. **Проверяйте логи регулярно** - многие проблемы видны заранее
4. **Ротируйте старые логи и бекапы** - экономьте место на диске
5. **Тестируйте восстановление из бекапов** - убедитесь что они работают

---

Удачи! 🚀

