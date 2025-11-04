import Queue from 'bull';
import { redis } from '../config/redis';
import { pool } from '../config/database';
import { sendNotification } from '../bot/bot';

interface NotificationJob {
  userId: number;
  telegramId: number;
  subscriptionId: number;
  message: string;
  type: 'reminder' | 'payment_due';
}

export const notificationQueue = new Queue<NotificationJob>('notifications', {
  createClient: () => redis,
});

notificationQueue.process(async (job) => {
  const { telegramId, message } = job.data;
  await sendNotification(telegramId, message);
});

export async function scheduleNotification(
  telegramId: number,
  userId: number,
  subscriptionId: number,
  message: string,
  delay: number
): Promise<void> {
  await notificationQueue.add(
    {
      userId,
      telegramId,
      subscriptionId,
      message,
      type: 'reminder',
    },
    {
      delay,
    }
  );
}

export async function schedulePaymentNotifications(): Promise<void> {
  const client = await pool.connect();

  try {
    const result = await client.query(`
      SELECT 
        s.id,
        s.service_name,
        s.amount,
        s.currency,
        s.next_payment_date,
        u.id as user_id,
        u.telegram_id,
        ns.reminder_days,
        ns.notification_time,
        ns.enabled
      FROM subscriptions s
      JOIN users u ON s.user_id = u.id
      LEFT JOIN notification_settings ns ON ns.user_id = u.id
      WHERE s.is_active = TRUE
        AND s.next_payment_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'
        AND (ns.enabled IS NULL OR ns.enabled = TRUE)
    `);

    for (const row of result.rows) {
      const nextPaymentDate = new Date(row.next_payment_date);
      const today = new Date();
      const daysUntilPayment = Math.ceil(
        (nextPaymentDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );

      const reminderDays = row.reminder_days || [1, 3, 7];

      for (const daysBefore of reminderDays) {
        if (daysUntilPayment === daysBefore) {
          const message = `🔔 Напоминание: через ${daysBefore} ${daysBefore === 1 ? 'день' : 'дня'} необходимо оплатить подписку "${row.service_name}" на сумму ${row.amount} ${row.currency}`;
          
          const notificationDate = new Date(nextPaymentDate);
          notificationDate.setDate(notificationDate.getDate() - daysBefore);
          
          const delay = notificationDate.getTime() - Date.now();
          
          if (delay > 0) {
            await scheduleNotification(
              row.telegram_id,
              row.user_id,
              row.id,
              message,
              delay
            );
          }
        }
      }

      if (daysUntilPayment === 0) {
        const message = `💰 Сегодня необходимо оплатить подписку "${row.service_name}" на сумму ${row.amount} ${row.currency}`;
        await sendNotification(row.telegram_id, message);
      }
    }
  } finally {
    client.release();
  }
}

setInterval(() => {
  schedulePaymentNotifications().catch(console.error);
}, 60 * 60 * 1000);

schedulePaymentNotifications().catch(console.error);

