import { Telegraf, Context } from 'telegraf';
import { findOrCreateUser } from '../models/User';

const botToken = process.env.TELEGRAM_BOT_TOKEN;

if (!botToken) {
  throw new Error('TELEGRAM_BOT_TOKEN is not set');
}

export const bot = new Telegraf(botToken);

const WEB_APP_URL = process.env.WEB_APP_URL || 'https://your-domain.com';

bot.start(async (ctx: Context) => {
  const user = ctx.from;

  if (user) {
    await findOrCreateUser(user.id, user.username);

    await ctx.reply(
      '👋 Добро пожаловать в PayPlaner!\n\n' +
        'Я помогу вам отслеживать ваши платные подписки.\n\n' +
        'Используйте кнопку ниже, чтобы открыть приложение:',
      {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: '📱 Открыть приложение',
                web_app: { url: WEB_APP_URL },
              },
            ],
          ],
        },
      }
    );
  }
});

bot.command('help', async (ctx: Context) => {
  await ctx.reply(
    '📖 Справка по PayPlaner:\n\n' +
      '/start - Открыть приложение\n' +
      '/stats - Показать краткую статистику\n' +
      '/settings - Настройки уведомлений\n\n' +
      'Используйте мини-приложение для полного управления подписками.'
  );
});

bot.command('stats', async (ctx: Context) => {
  const userId = ctx.from?.id;

  if (!userId) {
    await ctx.reply('Ошибка: не удалось определить пользователя');
    return;
  }

  try {
    const { getUserByTelegramId } = await import('../models/User');
    const { getSubscriptionsByUserId } = await import('../models/Subscription');
    
    const user = await getUserByTelegramId(userId);
    if (!user) {
      await ctx.reply('Пользователь не найден. Используйте /start для регистрации.');
      return;
    }
    
    const subscriptions = await getSubscriptionsByUserId(user.id);

    if (subscriptions.length === 0) {
      await ctx.reply('У вас пока нет активных подписок.\nИспользуйте /start чтобы добавить первую.');
      return;
    }

    const totalMonthly = subscriptions.reduce((sum, sub) => {
      const monthlyRate = 30 / sub.billing_cycle_days;
      return sum + Number(sub.amount) * monthlyRate;
    }, 0);

    const upcoming = subscriptions
      .filter((sub) => {
        const nextDate = new Date(sub.next_payment_date);
        const today = new Date();
        const diffDays = Math.ceil(
          (nextDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        );
        return diffDays <= 7 && diffDays >= 0;
      })
      .slice(0, 5);

    let message = `📊 Ваша статистика:\n\n`;
    message += `💰 Месячные расходы: ${totalMonthly.toFixed(2)} ₽\n`;
    message += `📱 Активных подписок: ${subscriptions.length}\n\n`;

    if (upcoming.length > 0) {
      message += `⏰ Ближайшие оплаты (7 дней):\n`;
      upcoming.forEach((sub) => {
        const nextDate = new Date(sub.next_payment_date);
        const daysLeft = Math.ceil(
          (nextDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        );
        message += `• ${sub.service_name}: ${sub.amount} ${sub.currency} (через ${daysLeft} дн.)\n`;
      });
    }

    await ctx.reply(message);
  } catch (error) {
    console.error('Stats command error:', error);
    await ctx.reply('Произошла ошибка при получении статистики');
  }
});

bot.command('settings', async (ctx: Context) => {
  await ctx.reply(
    '⚙️ Настройки уведомлений доступны в мини-приложении.\nИспользуйте /start чтобы открыть его.'
  );
});

export async function sendNotification(
  telegramId: number,
  message: string
): Promise<void> {
  try {
    await bot.telegram.sendMessage(telegramId, message);
  } catch (error) {
    console.error(`Failed to send notification to ${telegramId}:`, error);
  }
}

