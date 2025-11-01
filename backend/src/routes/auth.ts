import { Router, Request, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import {
  validateTelegramInitData,
  parseTelegramUser,
} from '../utils/telegram-auth';
import { findOrCreateUser } from '../models/User';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt';
import { redis } from '../config/redis';

const router = Router();

interface AuthRequestBody extends Request {
  body: {
    initData: string;
  };
}

router.post('/auth/telegram', async (req: AuthRequestBody, res: Response) => {
  try {
    const { initData } = req.body;

    if (!initData) {
      res.status(400).json({ error: 'initData is required' });
      return;
    }

    if (!validateTelegramInitData(initData)) {
      res.status(401).json({ error: 'Invalid Telegram initData' });
      return;
    }

    const telegramUser = parseTelegramUser(initData);

    if (!telegramUser) {
      res.status(400).json({ error: 'Invalid user data' });
      return;
    }

    const user = await findOrCreateUser(
      telegramUser.id,
      telegramUser.username
    );

    const accessToken = generateAccessToken({
      userId: user.id,
      telegramId: user.telegram_id,
    });

    const refreshToken = generateRefreshToken({
      userId: user.id,
      telegramId: user.telegram_id,
    });

    await redis.setex(
      `refresh_token:${user.id}`,
      7 * 24 * 60 * 60,
      refreshToken
    );

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      accessToken,
      user: {
        id: user.id,
        telegramId: user.telegram_id,
        username: user.username,
      },
    });
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/auth/me', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { getUserById } = await import('../models/User');
    const user = await getUserById(req.user.userId);

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({
      user: {
        id: user.id,
        telegramId: user.telegram_id,
        username: user.username,
      },
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/auth/refresh', async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      res.status(401).json({ error: 'Refresh token not found' });
      return;
    }

    const { verifyRefreshToken } = await import('../utils/jwt');
    const payload = verifyRefreshToken(refreshToken);

    const storedToken = await redis.get(`refresh_token:${payload.userId}`);

    if (!storedToken || storedToken !== refreshToken) {
      res.status(401).json({ error: 'Invalid refresh token' });
      return;
    }

    const newAccessToken = generateAccessToken(payload);

    res.json({ accessToken: newAccessToken });
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired refresh token' });
  }
});

export default router;

