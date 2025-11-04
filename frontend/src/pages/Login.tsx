import { useEffect } from 'react';
import { Button, Card } from 'antd';
import { useAppDispatch } from '../store/hooks';
import { loginWithTelegram } from '../store/thunks/authThunks';

export default function Login() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      window.location.href = '/';
    }
  }, []);

  const handleLogin = async () => {
    try {
      await dispatch(loginWithTelegram()).unwrap();
      window.location.href = '/';
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">PayPlaner</h1>
        <p className="text-center text-gray-600 mb-6">
          Войдите через Telegram для доступа к приложению
        </p>
        <Button
          type="primary"
          size="large"
          block
          onClick={handleLogin}
        >
          Войти через Telegram
        </Button>
      </Card>
    </div>
  );
}

