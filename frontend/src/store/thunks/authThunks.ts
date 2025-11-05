import { AppDispatch } from '../store';
import { setAuth, clearAuth, setLoading } from '../slices/authSlice';
import { api } from '../api';

declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        initData: string;
        initDataUnsafe: {
          user?: {
            id: number;
            first_name: string;
            last_name?: string;
            username?: string;
          };
        };
        ready: () => void;
        expand: () => void;
        close: () => void;
        platform?: string;
        version?: string;
      };
    };
  }
}

export const initTelegram = () => () => {
  if (window.Telegram?.WebApp) {
    window.Telegram.WebApp.ready();
    window.Telegram.WebApp.expand();
  }
};

export const checkAuth = () => async (dispatch: AppDispatch) => {
  const token = localStorage.getItem('accessToken');
  
  if (!token) {
    dispatch(setLoading(false));
    return;
  }

  try {
    const response = await api.get('/auth/me');
    if (response.data) {
      dispatch(setAuth({
        user: response.data.user,
        accessToken: token,
      }));
    }
  } catch {
    dispatch(clearAuth());
  } finally {
    dispatch(setLoading(false));
  }
};

export const loginWithTelegram = () => async (dispatch: AppDispatch) => {
  try {
    console.log('🔍 Проверка Telegram WebApp...');
    console.log('window.Telegram:', window.Telegram);
    console.log('initData:', window.Telegram?.WebApp?.initData);
    console.log('initDataUnsafe:', window.Telegram?.WebApp?.initDataUnsafe);

    if (!window.Telegram?.WebApp?.initData) {
      const error = new Error('Telegram WebApp not available or initData is empty');
      console.error('❌', error.message);
      throw error;
    }

    console.log('📤 Отправка запроса авторизации...');
    const response = await api.post('/auth/telegram', {
      initData: window.Telegram.WebApp.initData,
    });

    console.log('✅ Ответ сервера:', response.data);
    
    // Сохраняем токен в localStorage
    if (response.data.accessToken) {
      localStorage.setItem('accessToken', response.data.accessToken);
    }

    dispatch(setAuth(response.data));
    return response.data;
  } catch (error: any) {
    console.error('❌ Ошибка авторизации:', error.response?.data || error.message);
    dispatch(clearAuth());
    throw error;
  }
};

