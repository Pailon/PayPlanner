import { useEffect, useState } from 'react';
import { List, Card, Button, Tag, Space, Empty } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, PauseCircleOutlined } from 'antd/icons';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  fetchSubscriptions,
  deleteSubscription,
  pauseSubscription,
} from '../store/slices/subscriptionSlice';
import dayjs from 'dayjs';

export default function Subscriptions() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { items: subscriptions, isLoading } = useAppSelector(
    (state) => state.subscriptions
  );

  useEffect(() => {
    dispatch(fetchSubscriptions());
  }, [dispatch]);

  const activeSubscriptions = subscriptions.filter((s) => s.is_active);
  const pausedSubscriptions = subscriptions.filter((s) => !s.is_active);

  const handleDelete = async (id: number) => {
    if (confirm('Вы уверены, что хотите удалить эту подписку?')) {
      await dispatch(deleteSubscription(id));
    }
  };

  const handlePause = async (id: number) => {
    await dispatch(pauseSubscription(id));
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Подписки</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate('/subscriptions/new')}
        >
          Добавить
        </Button>
      </div>

      {activeSubscriptions.length === 0 && pausedSubscriptions.length === 0 && !isLoading && (
        <Card>
          <Empty description="У вас пока нет подписок" />
        </Card>
      )}

      {activeSubscriptions.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">Активные</h2>
          <List
            dataSource={activeSubscriptions}
            renderItem={(sub) => (
              <List.Item>
                <Card className="w-full">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">{sub.service_name}</h3>
                        {sub.category && (
                          <Tag color={sub.color_tag || 'blue'}>{sub.category}</Tag>
                        )}
                      </div>
                      <div className="text-gray-600">
                        <div>
                          {sub.amount} {sub.currency} /{' '}
                          {sub.billing_cycle_days === 30
                            ? 'месяц'
                            : sub.billing_cycle_days === 7
                            ? 'неделя'
                            : sub.billing_cycle_days === 365
                            ? 'год'
                            : `${sub.billing_cycle_days} дней`}
                        </div>
                        <div>
                          Следующая оплата:{' '}
                          {dayjs(sub.next_payment_date).format('DD.MM.YYYY')}
                        </div>
                      </div>
                    </div>
                    <Space>
                      <Button
                        icon={<EditOutlined />}
                        onClick={() => navigate(`/subscriptions/${sub.id}/edit`)}
                      />
                      <Button
                        icon={<PauseCircleOutlined />}
                        onClick={() => handlePause(sub.id)}
                      />
                      <Button
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDelete(sub.id)}
                      />
                    </Space>
                  </div>
                </Card>
              </List.Item>
            )}
          />
        </div>
      )}

      {pausedSubscriptions.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3">Приостановленные</h2>
          <List
            dataSource={pausedSubscriptions}
            renderItem={(sub) => (
              <List.Item>
                <Card className="w-full">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">{sub.service_name}</h3>
                        <Tag color="default">Приостановлена</Tag>
                      </div>
                      <div className="text-gray-600">
                        {sub.amount} {sub.currency} /{' '}
                        {sub.billing_cycle_days === 30
                          ? 'месяц'
                          : `${sub.billing_cycle_days} дней`}
                      </div>
                    </div>
                    <Space>
                      <Button
                        icon={<EditOutlined />}
                        onClick={() => navigate(`/subscriptions/${sub.id}/edit`)}
                      />
                      <Button
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDelete(sub.id)}
                      />
                    </Space>
                  </div>
                </Card>
              </List.Item>
            )}
          />
        </div>
      )}
    </div>
  );
}

