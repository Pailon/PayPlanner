import { useEffect } from 'react';
import { Card, Statistic, Row, Col } from 'antd';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchSubscriptions } from '../store/slices/subscriptionSlice';
import dayjs from 'dayjs';

export default function Dashboard() {
  const dispatch = useAppDispatch();
  const { items: subscriptions } = useAppSelector((state) => state.subscriptions);

  useEffect(() => {
    dispatch(fetchSubscriptions());
  }, [dispatch]);

  const activeSubscriptions = subscriptions.filter((s) => s.is_active);
  const totalMonthly = activeSubscriptions.reduce((sum, sub) => {
    const monthlyRate = 30 / sub.billing_cycle_days;
    return sum + Number(sub.amount) * monthlyRate;
  }, 0);

  const upcoming = activeSubscriptions
    .filter((sub) => {
      const nextDate = dayjs(sub.next_payment_date);
      const today = dayjs();
      const diffDays = nextDate.diff(today, 'day');
      return diffDays <= 7 && diffDays >= 0;
    })
    .slice(0, 5);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Дашборд</h1>

      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12}>
          <Card>
            <Statistic
              title="Месячные расходы"
              value={totalMonthly.toFixed(2)}
              suffix="₽"
              precision={2}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12}>
          <Card>
            <Statistic
              title="Активных подписок"
              value={activeSubscriptions.length}
            />
          </Card>
        </Col>
      </Row>

      {upcoming.length > 0 && (
        <Card title="Ближайшие оплаты" className="mb-6">
          <div className="space-y-3">
            {upcoming.map((sub) => {
              const daysLeft = dayjs(sub.next_payment_date).diff(dayjs(), 'day');
              return (
                <div key={sub.id} className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">{sub.service_name}</div>
                    <div className="text-sm text-gray-500">
                      {dayjs(sub.next_payment_date).format('DD.MM.YYYY')}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      {sub.amount} {sub.currency}
                    </div>
                    <div className="text-sm text-gray-500">
                      через {daysLeft} {daysLeft === 1 ? 'день' : 'дней'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {activeSubscriptions.length === 0 && (
        <Card>
          <p className="text-center text-gray-500">
            У вас пока нет активных подписок.
            <br />
            Добавьте первую подписку для начала отслеживания.
          </p>
        </Card>
      )}
    </div>
  );
}

