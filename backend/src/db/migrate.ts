import { pool } from '../config/database';
import { readFileSync } from 'fs';
import { join } from 'path';

export async function runMigrations() {
  const client = await pool.connect();

  try {
    // В продакшене путь от корня контейнера /app/src/db/migrations
    const migrationPath = join('/app/src/db/migrations/001_initial_schema.sql');
    
    const migrationSQL = readFileSync(migrationPath, 'utf-8');

    await client.query('BEGIN');
    await client.query(migrationSQL);
    await client.query('COMMIT');

    console.log('✅ Миграции базы данных выполнены успешно');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Ошибка выполнения миграций:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Запуск миграций если файл вызван напрямую
if (require.main === module) {
  runMigrations()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

