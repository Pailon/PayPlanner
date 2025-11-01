import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import {
  getSubscriptionsByUserId,
  getSubscriptionById,
  createSubscription,
  updateSubscription,
  deleteSubscription,
  CreateSubscriptionData,
  UpdateSubscriptionData,
} from '../models/Subscription';
import { z } from 'zod';

const router = Router();

const createSubscriptionSchema = z.object({
  service_name: z.string().min(1).max(255),
  service_icon: z.string().optional(),
  category: z.string().optional(),
  amount: z.number().positive(),
  currency: z.enum(['RUB', 'USD', 'EUR']).default('RUB'),
  billing_cycle_days: z.number().int().positive(),
  next_payment_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  color_tag: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  notes: z.string().optional(),
  service_url: z.string().url().optional().or(z.literal('')),
});

const updateSubscriptionSchema = createSubscriptionSchema.partial().extend({
  is_active: z.boolean().optional(),
});

router.get(
  '/subscriptions',
  authenticate,
  async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const includeInactive = req.query.includeInactive === 'true';
      const subscriptions = await getSubscriptionsByUserId(
        req.user.userId,
        includeInactive
      );

      res.json(subscriptions);
    } catch (error) {
      console.error('Get subscriptions error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

router.get(
  '/subscriptions/:id',
  authenticate,
  async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const id = parseInt(req.params.id, 10);

      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid subscription ID' });
        return;
      }

      const subscription = await getSubscriptionById(id, req.user.userId);

      if (!subscription) {
        res.status(404).json({ error: 'Subscription not found' });
        return;
      }

      res.json(subscription);
    } catch (error) {
      console.error('Get subscription error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

router.post(
  '/subscriptions',
  authenticate,
  async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const validationResult = createSubscriptionSchema.safeParse(req.body);

      if (!validationResult.success) {
        res.status(400).json({
          error: 'Validation error',
          details: validationResult.error.errors,
        });
        return;
      }

      const subscription = await createSubscription(
        req.user.userId,
        validationResult.data as CreateSubscriptionData
      );

      res.status(201).json(subscription);
    } catch (error) {
      console.error('Create subscription error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

router.put(
  '/subscriptions/:id',
  authenticate,
  async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const id = parseInt(req.params.id, 10);

      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid subscription ID' });
        return;
      }

      const validationResult = updateSubscriptionSchema.safeParse(req.body);

      if (!validationResult.success) {
        res.status(400).json({
          error: 'Validation error',
          details: validationResult.error.errors,
        });
        return;
      }

      const subscription = await updateSubscription(
        id,
        req.user.userId,
        validationResult.data as UpdateSubscriptionData
      );

      if (!subscription) {
        res.status(404).json({ error: 'Subscription not found' });
        return;
      }

      res.json(subscription);
    } catch (error) {
      console.error('Update subscription error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

router.delete(
  '/subscriptions/:id',
  authenticate,
  async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const id = parseInt(req.params.id, 10);

      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid subscription ID' });
        return;
      }

      const deleted = await deleteSubscription(id, req.user.userId);

      if (!deleted) {
        res.status(404).json({ error: 'Subscription not found' });
        return;
      }

      res.status(204).send();
    } catch (error) {
      console.error('Delete subscription error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

router.post(
  '/subscriptions/:id/pause',
  authenticate,
  async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const id = parseInt(req.params.id, 10);

      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid subscription ID' });
        return;
      }

      const subscription = await updateSubscription(id, req.user.userId, {
        is_active: false,
      });

      if (!subscription) {
        res.status(404).json({ error: 'Subscription not found' });
        return;
      }

      res.json(subscription);
    } catch (error) {
      console.error('Pause subscription error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

router.post(
  '/subscriptions/:id/resume',
  authenticate,
  async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const id = parseInt(req.params.id, 10);

      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid subscription ID' });
        return;
      }

      const subscription = await updateSubscription(id, req.user.userId, {
        is_active: true,
      });

      if (!subscription) {
        res.status(404).json({ error: 'Subscription not found' });
        return;
      }

      res.json(subscription);
    } catch (error) {
      console.error('Resume subscription error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

export default router;

