import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

export const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
  user: process.env.POSTGRES_USER || 'payplaner',
  password: process.env.POSTGRES_PASSWORD || 'payplaner_pass',
  database: process.env.POSTGRES_DB || 'payplaner',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

export async function waitForDatabase(maxRetries = 15, delayMs = 2000): Promise<void> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const client = await pool.connect();
      await client.query('SELECT 1');
      client.release();
      console.log('✅ PostgreSQL подключение установлено');
      return;
    } catch (error: any) {
      console.log(`⏳ Попытка подключения к PostgreSQL ${i + 1}/${maxRetries}...`);
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      } else {
        console.error('❌ Детали ошибки:', error.message);
        throw new Error(`Не удалось подключиться к PostgreSQL после ${maxRetries} попыток. Проверьте настройки: HOST=${process.env.POSTGRES_HOST}, PORT=${process.env.POSTGRES_PORT}, USER=${process.env.POSTGRES_USER}, DB=${process.env.POSTGRES_DB}`);
      }
    }
  }
}

