# Настройка Cloudflare Tunnel для PayPlanner

Cloudflare Tunnel позволяет безопасно открыть доступ к локальному приложению через HTTPS без проброса портов и настройки роутера.

---

## Архитектура

```
Интернет (HTTPS)
    ↓
Cloudflare Tunnel
    ↓
Raspberry Pi (локально)
    ├── Frontend: http://localhost:3001
    ├── Backend: http://localhost:3000
    └── PostgreSQL + Redis: Docker
```

**Ключевой момент:** Всё работает локально на `localhost`, туннель только прокидывает HTTPS трафик извне.

---

## Установка Cloudflare Tunnel

### 1. Установка cloudflared на Raspberry Pi

```bash
# Для Ubuntu/Debian на Raspberry Pi
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-arm64 -o cloudflared
sudo mv cloudflared /usr/local/bin/
sudo chmod +x /usr/local/bin/cloudflared
cloudflared --version
```

### 2. Авторизация

```bash
cloudflared tunnel login
```

Откроется браузер для авторизации в Cloudflare.

### 3. Создание туннеля

```bash
cloudflared tunnel create payplanner
```

Сохраните **Tunnel ID** - он понадобится.

### 4. Создание конфигурации

Создайте файл `~/.cloudflared/config.yml`:

```yaml
tunnel: <YOUR_TUNNEL_ID>
credentials-file: /home/pi/.cloudflared/<YOUR_TUNNEL_ID>.json

ingress:
  # Frontend
  - hostname: payplanner.your-domain.com
    service: http://localhost:3001
  
  # Backend API
  - hostname: payplanner.your-domain.com
    path: /api/*
    service: http://localhost:3000
  
  # Catch-all (обязательно последним)
  - service: http_status:404
```

### 5. DNS настройка

```bash
cloudflared tunnel route dns payplanner payplanner.your-domain.com
```

### 6. Запуск туннеля

```bash
# Тестовый запуск
cloudflared tunnel run payplanner

# Если работает, установите как сервис
sudo cloudflared service install
sudo systemctl start cloudflared
sudo systemctl enable cloudflared
```

---

## Настройка .env файлов

### Для локальной разработки (Windows):

```env
# .env
WEB_APP_URL=http://localhost:3001
VITE_API_URL=http://localhost:3000/api
ALLOWED_ORIGINS=http://localhost:3001,http://localhost:3000
```

### Для Raspberry Pi с туннелем:

```env
# .env
WEB_APP_URL=https://payplanner.your-domain.com
VITE_API_URL=https://payplanner.your-domain.com/api
ALLOWED_ORIGINS=https://payplanner.your-domain.com

# backend/.env
WEB_APP_URL=https://payplanner.your-domain.com
POSTGRES_HOST=localhost  # Docker на той же машине
REDIS_HOST=localhost     # Docker на той же машине
ALLOWED_ORIGINS=https://payplanner.your-domain.com

# frontend/.env
VITE_API_URL=https://payplanner.your-domain.com/api
```

---

## Запуск на Raspberry Pi

```bash
# 1. Запустить Docker контейнеры (БД)
docker-compose -f docker-compose.dev.yml up -d

# 2. Запустить Backend
cd backend
npm run dev

# 3. Запустить Frontend
cd ../frontend
npm run dev

# 4. Cloudflare Tunnel уже работает как сервис
```

Теперь приложение доступно по адресу: `https://payplanner.your-domain.com`

---

## Telegram Bot настройка

В [@BotFather](https://t.me/BotFather) установите Menu Button:

```
/setmenubutton
Выберите вашего бота
Отправьте текст кнопки: Открыть приложение
Отправьте URL: https://payplanner.your-domain.com
```

---

## Проверка работы

1. **Локально на Raspberry Pi:**
   ```bash
   curl http://localhost:3000/health
   curl http://localhost:3001
   ```

2. **Через туннель:**
   ```bash
   curl https://payplanner.your-domain.com/api/health
   ```

3. **В Telegram:**
   - Откройте вашего бота
   - Нажмите Menu → Открыть приложение
   - Должен открыться Mini App

---

## Преимущества такой архитектуры

✅ **Безопасность**: Не нужно открывать порты на роутере  
✅ **Простота**: Всё работает на localhost, настройка минимальна  
✅ **HTTPS из коробки**: Cloudflare предоставляет SSL сертификаты  
✅ **Нет зависимости**: Можно переехать на другой туннель (ngrok, localtunnel) без изменений кода  

---

## Troubleshooting

### Туннель не работает

```bash
# Проверить статус
sudo systemctl status cloudflared

# Посмотреть логи
sudo journalctl -u cloudflared -f
```

### CORS ошибки

Убедитесь что в `backend/.env` добавлен Cloudflare URL:
```env
ALLOWED_ORIGINS=https://payplanner.your-domain.com
```

### Telegram Mini App не открывается

1. Проверьте что `WEB_APP_URL` в `backend/.env` совпадает с URL в BotFather
2. URL **обязательно** должен быть HTTPS
3. Попробуйте открыть URL в браузере напрямую

---

## Альтернативы Cloudflare Tunnel

- **ngrok**: `ngrok http 3000`
- **localtunnel**: `lt --port 3000`
- **Tailscale Funnel**: для приватного доступа

Все они работают одинаково - прокидывают HTTPS трафик на localhost.

