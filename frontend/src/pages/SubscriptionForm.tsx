import { useEffect, useState } from 'react';
import { Form, Input, InputNumber, Select, DatePicker, Button, Card, Space } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  createSubscription,
  updateSubscription,
  fetchSubscriptions,
} from '../store/slices/subscriptionSlice';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;

const CATEGORIES = [
  'Стриминг',
  'Музыка',
  'Игры',
  'Облако',
  'Продуктивность',
  'Новости',
  'Фитнес',
  'Образование',
  'Другое',
];

const CURRENCIES = ['RUB', 'USD', 'EUR'];

const BILLING_CYCLES = [
  { label: 'Ежедневно', value: 1 },
  { label: 'Еженедельно', value: 7 },
  { label: 'Ежемесячно', value: 30 },
  { label: 'Ежеквартально', value: 90 },
  { label: 'Ежегодно', value: 365 },
];

export default function SubscriptionForm() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const { items: subscriptions } = useAppSelector((state) => state.subscriptions);

  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) {
      const subscription = subscriptions.find((s) => s.id === parseInt(id, 10));
      if (!subscription) {
        dispatch(fetchSubscriptions());
        return;
      }
      form.setFieldsValue({
        service_name: subscription.service_name,
        category: subscription.category,
        amount: subscription.amount,
        currency: subscription.currency,
        billing_cycle_days: subscription.billing_cycle_days,
        next_payment_date: dayjs(subscription.next_payment_date),
        color_tag: subscription.color_tag,
        notes: subscription.notes,
        service_url: subscription.service_url,
      });
    } else {
      form.setFieldsValue({
        currency: 'RUB',
        billing_cycle_days: 30,
        next_payment_date: dayjs().add(30, 'day'),
      });
    }
  }, [id, subscriptions, form, dispatch]);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const data = {
        ...values,
        next_payment_date: values.next_payment_date.format('YYYY-MM-DD'),
      };

      if (id) {
        await dispatch(updateSubscription({ id: parseInt(id, 10), data })).unwrap();
      } else {
        await dispatch(createSubscription(data)).unwrap();
      }

      await dispatch(fetchSubscriptions());
      navigate('/subscriptions');
    } catch (error) {
      console.error('Submit error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <Card>
        <h1 className="text-2xl font-bold mb-6">
          {id ? 'Редактировать подписку' : 'Добавить подписку'}
        </h1>

        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="service_name"
            label="Название сервиса"
            rules={[{ required: true, message: 'Введите название сервиса' }]}
          >
            <Input placeholder="Например: Netflix" />
          </Form.Item>

          <Form.Item name="category" label="Категория">
            <Select placeholder="Выберите категорию">
              {CATEGORIES.map((cat) => (
                <Option key={cat} value={cat}>
                  {cat}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="amount"
            label="Стоимость"
            rules={[{ required: true, message: 'Введите стоимость' }]}
          >
            <InputNumber
              min={0}
              step={0.01}
              precision={2}
              style={{ width: '100%' }}
              placeholder="0.00"
            />
          </Form.Item>

          <Form.Item
            name="currency"
            label="Валюта"
            rules={[{ required: true }]}
          >
            <Select>
              {CURRENCIES.map((curr) => (
                <Option key={curr} value={curr}>
                  {curr}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="billing_cycle_days"
            label="Периодичность оплаты"
            rules={[{ required: true }]}
          >
            <Select>
              {BILLING_CYCLES.map((cycle) => (
                <Option key={cycle.value} value={cycle.value}>
                  {cycle.label}
                </Option>
              ))}
              <Option value={0}>Произвольный интервал</Option>
            </Select>
          </Form.Item>

          <Form.Item name="next_payment_date" label="Дата следующей оплаты">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="color_tag" label="Цветовая метка">
            <Input type="color" />
          </Form.Item>

          <Form.Item name="service_url" label="Ссылка на управление подпиской">
            <Input placeholder="https://..." />
          </Form.Item>

          <Form.Item name="notes" label="Заметки">
            <TextArea rows={4} placeholder="Дополнительная информация..." />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                {id ? 'Сохранить' : 'Создать'}
              </Button>
              <Button onClick={() => navigate('/subscriptions')}>
                Отмена
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

