import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { bot } from './bot/bot';
import { apiRateLimiter, strictRateLimiter } from './middleware/rateLimiter';
import authRoutes from './routes/auth';
import subscriptionRoutes from './routes/subscriptions';
import statisticsRoutes from './routes/statistics';
import catalogRoutes from './routes/catalog';
import { waitForDatabase } from './config/database';
import { runMigrations } from './db/migrate';
import { startNotificationWorker } from './workers/notificationWorker';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://telegram.org"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      connectSrc: ["'self'", "https://api.telegram.org"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || [
    'https://web.telegram.org',
    'https://web.telegram.org/k',
    'http://localhost:3001',
    'http://localhost:5173',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

app.use(apiRateLimiter);

app.use('/api/auth', strictRateLimiter, authRoutes);
app.use('/api', subscriptionRoutes);
app.use('/api', statisticsRoutes);
app.use('/api', catalogRoutes);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

async function startServer() {
  try {
    console.log('🔄 Инициализация PayPlanner Backend...\n');

    // Ожидание подключения к PostgreSQL
    await waitForDatabase();

    // Запуск миграций
    console.log('🔄 Выполнение миграций базы данных...');
    await runMigrations();

    // Запуск Telegram бота
    console.log('🔄 Запуск Telegram бота...');
    await bot.launch();
    console.log('✅ Telegram бот запущен');

    // Запуск notification worker
    console.log('🔄 Запуск Notification Worker...');
    startNotificationWorker();

    app.listen(PORT, () => {
      console.log('\n' + '='.repeat(60));
      console.log('🚀 PayPlanner Backend успешно запущен!');
      console.log('='.repeat(60));
      console.log(`📡 API Server: http://localhost:${PORT}`);
      console.log(`🤖 Telegram Bot: запущен и готов к работе`);
      console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
      console.log('='.repeat(60) + '\n');
    });

    process.once('SIGINT', () => bot.stop('SIGINT'));
    process.once('SIGTERM', () => bot.stop('SIGTERM'));
  } catch (error) {
    console.error('❌ Ошибка запуска сервера:', error);
    process.exit(1);
  }
}

startServer();

