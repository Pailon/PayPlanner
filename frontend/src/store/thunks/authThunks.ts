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
      };
    };
  }
}

export const initTelegram = () => (dispatch: AppDispatch) => {
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
  if (!window.Telegram?.WebApp?.initData) {
    throw new Error('Telegram WebApp not available');
  }

  try {
    const response = await api.post('/auth/telegram', {
      initData: window.Telegram.WebApp.initData,
    });

    dispatch(setAuth(response.data));
    return response.data;
  } catch (error) {
    dispatch(clearAuth());
    throw error;
  }
};

