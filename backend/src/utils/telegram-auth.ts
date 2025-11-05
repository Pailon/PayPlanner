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
  console.log('🔐 Валидация initData, длина:', initDataRaw.length);
  
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    throw new Error('TELEGRAM_BOT_TOKEN not set');
  }

  const urlParams = new URLSearchParams(initDataRaw);
  const hash = urlParams.get('hash');
  
  if (!hash) {
    console.log('❌ Hash отсутствует');
    return false;
  }

  // Удаляем hash и signature из параметров
  urlParams.delete('hash');
  urlParams.delete('signature'); // Signature не участвует в валидации WebApp

  // Сортируем параметры и создаем data_check_string
  const params: string[] = [];
  urlParams.forEach((value, key) => {
    params.push(`${key}=${value}`);
  });
  params.sort();
  const dataCheckString = params.join('\n');

  console.log('📝 Полная dataCheckString:\n', dataCheckString);

  // Правильный алгоритм: HMAC-SHA256(botToken, 'WebAppData') как ключ, затем HMAC-SHA256(secretKey, data)
  const secretKey = createHmac('sha256', 'WebAppData').update(botToken).digest();
  const calculatedHash = createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

  console.log('🔐 Вычисленный hash:', calculatedHash);
  console.log('🔐 Полученный hash:  ', hash);

  if (calculatedHash !== hash) {
    console.log('❌ Хэши не совпадают!');
    return false;
  }

  const authDate = urlParams.get('auth_date');
  if (!authDate) {
    console.log('❌ auth_date отсутствует');
    return false;
  }

  const authTimestamp = parseInt(authDate, 10);
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const timeDiff = currentTimestamp - authTimestamp;

  if (timeDiff > 86400) { // 24 часа
    console.log('❌ initData устарел');
    return false;
  }

  console.log('✅ Валидация успешна!');
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

