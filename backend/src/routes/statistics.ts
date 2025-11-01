import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { pool } from '../config/database';

const router = Router();

router.get('/statistics', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const client = await pool.connect();

    try {
      const subscriptionsResult = await client.query(`
        SELECT 
          service_name,
          amount,
          currency,
          billing_cycle_days,
          category,
          next_payment_date
        FROM subscriptions
        WHERE user_id = $1 AND is_active = TRUE
      `, [req.user.userId]);

      const subscriptions = subscriptionsResult.rows;

      interface SubscriptionRow {
        service_name: string;
        amount: number;
        currency: string;
        billing_cycle_days: number;
        category?: string;
        next_payment_date: Date;
      }

      const totalMonthly = subscriptions.reduce((sum: number, sub: SubscriptionRow) => {
        const monthlyRate = 30 / sub.billing_cycle_days;
        return sum + Number(sub.amount) * monthlyRate;
      }, 0);

      const categoryStats = subscriptions.reduce((acc: Record<string, { count: number; amount: number }>, sub: SubscriptionRow) => {
        const category = sub.category || 'Другое';
        const monthlyRate = 30 / sub.billing_cycle_days;
        const monthlyAmount = Number(sub.amount) * monthlyRate;
        
        if (!acc[category]) {
          acc[category] = { count: 0, amount: 0 };
        }
        acc[category].count += 1;
        acc[category].amount += monthlyAmount;
        return acc;
      }, {} as Record<string, { count: number; amount: number }>);

      const upcomingPayments = subscriptions
        .filter((sub: SubscriptionRow) => {
          const nextDate = new Date(sub.next_payment_date);
          const today = new Date();
          const diffDays = Math.ceil(
            (nextDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
          );
          return diffDays <= 7 && diffDays >= 0;
        })
        .sort((a: SubscriptionRow, b: SubscriptionRow) => {
          return new Date(a.next_payment_date).getTime() - new Date(b.next_payment_date).getTime();
        })
        .slice(0, 10);

      res.json({
        totalMonthly: parseFloat(totalMonthly.toFixed(2)),
        activeCount: subscriptions.length,
        categoryStats: Object.entries(categoryStats).map(([category, stats]) => ({
          category,
          count: (stats as { count: number; amount: number }).count,
          amount: parseFloat((stats as { count: number; amount: number }).amount.toFixed(2)),
        })),
        upcomingPayments: upcomingPayments.map((sub: SubscriptionRow) => ({
          service_name: sub.service_name || '',
          amount: sub.amount,
          currency: sub.currency,
          next_payment_date: sub.next_payment_date,
        })),
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Statistics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

