import { createHmac } from 'crypto';

/*
interface TelegramInitData {
  query_id: string;
  user: {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
  };
  auth_date: string;
  hash: string;
}
*/

export function validateTelegramInitData(initDataRaw: string): boolean {
  // Для валидации initData используется токен бота
  const botToken = process.env.TELEGRAM_BOT_TOKEN;

  if (!botToken) {
    throw new Error('TELEGRAM_BOT_TOKEN not set');
  }

  const urlParams = new URLSearchParams(initDataRaw);
  const hash = urlParams.get('hash');

  if (!hash) {
    return false;
  }

  urlParams.delete('hash');

  const dataCheckString = Array.from(urlParams.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

  // Согласно документации Telegram, секретный ключ создается из токена бота
  const secretKey = createHmac('sha256', 'WebAppData')
    .update(botToken)
    .digest();

  const calculatedHash = createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex');

  if (calculatedHash !== hash) {
    return false;
  }

  const authDate = urlParams.get('auth_date');
  if (!authDate) {
    return false;
  }

  const authTimestamp = parseInt(authDate, 10);
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const timeDiff = currentTimestamp - authTimestamp;

  if (timeDiff > 86400) {
    return false;
  }

  return true;
}

export function parseTelegramUser(initDataRaw: string): {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
} | null {
  const urlParams = new URLSearchParams(initDataRaw);
  const userParam = urlParams.get('user');

  if (!userParam) {
    return null;
  }

  try {
    const user = JSON.parse(userParam);
    return {
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      username: user.username,
    };
  } catch {
    return null;
  }
}

