import { pool } from '../config/database';

export interface User {
  id: number;
  telegram_id: number;
  username?: string;
  language_code: string;
  timezone: string;
  premium_until?: Date;
  created_at: Date;
  updated_at: Date;
}

export async function findOrCreateUser(telegramId: number, username?: string): Promise<User> {
  const client = await pool.connect();

  try {
    let result = await client.query<User>(
      'SELECT * FROM users WHERE telegram_id = $1',
      [telegramId]
    );

    if (result.rows.length === 0) {
      result = await client.query<User>(
        `INSERT INTO users (telegram_id, username, language_code, timezone)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [telegramId, username || null, 'ru', 'Europe/Moscow']
      );
    } else if (username && result.rows[0].username !== username) {
      result = await client.query<User>(
        'UPDATE users SET username = $1, updated_at = NOW() WHERE telegram_id = $2 RETURNING *',
        [username, telegramId]
      );
    }

    return result.rows[0];
  } finally {
    client.release();
  }
}

export async function getUserByTelegramId(telegramId: number): Promise<User | null> {
  const result = await pool.query<User>(
    'SELECT * FROM users WHERE telegram_id = $1',
    [telegramId]
  );

  return result.rows[0] || null;
}

export async function getUserById(id: number): Promise<User | null> {
  const result = await pool.query<User>(
    'SELECT * FROM users WHERE id = $1',
    [id]
  );

  return result.rows[0] || null;
}

