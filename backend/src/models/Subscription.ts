import { pool } from '../config/database';
import { encrypt, decrypt } from '../utils/encryption';

export interface Subscription {
  id: number;
  user_id: number;
  service_name: string;
  service_icon?: string;
  category?: string;
  amount: number;
  currency: string;
  billing_cycle_days: number;
  next_payment_date: Date;
  color_tag?: string;
  is_active: boolean;
  notes?: string;
  service_url?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateSubscriptionData {
  service_name: string;
  service_icon?: string;
  category?: string;
  amount: number;
  currency: string;
  billing_cycle_days: number;
  next_payment_date: string;
  color_tag?: string;
  notes?: string;
  service_url?: string;
}

export interface UpdateSubscriptionData extends Partial<CreateSubscriptionData> {
  is_active?: boolean;
}

export async function getSubscriptionsByUserId(
  userId: number,
  includeInactive = false
): Promise<Subscription[]> {
  let query = 'SELECT * FROM subscriptions WHERE user_id = $1';
  const params: any[] = [userId];

  if (!includeInactive) {
    query += ' AND is_active = TRUE';
  }

  query += ' ORDER BY next_payment_date ASC';

  const result = await pool.query<Subscription>(query, params);
  return result.rows.map(decryptSubscription);
}

export async function getSubscriptionById(
  id: number,
  userId: number
): Promise<Subscription | null> {
  const result = await pool.query<Subscription>(
    'SELECT * FROM subscriptions WHERE id = $1 AND user_id = $2',
    [id, userId]
  );

  if (result.rows.length === 0) {
    return null;
  }

  return decryptSubscription(result.rows[0]);
}

export async function createSubscription(
  userId: number,
  data: CreateSubscriptionData
): Promise<Subscription> {
  const encryptedNotes = data.notes ? encrypt(data.notes) : null;

  const result = await pool.query<Subscription>(
    `INSERT INTO subscriptions (
      user_id, service_name, service_icon, category, amount, currency,
      billing_cycle_days, next_payment_date, color_tag, notes, service_url
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    RETURNING *`,
    [
      userId,
      data.service_name,
      data.service_icon || null,
      data.category || null,
      data.amount,
      data.currency,
      data.billing_cycle_days,
      data.next_payment_date,
      data.color_tag || null,
      encryptedNotes,
      data.service_url || null,
    ]
  );

  return decryptSubscription(result.rows[0]);
}

export async function updateSubscription(
  id: number,
  userId: number,
  data: UpdateSubscriptionData
): Promise<Subscription | null> {
  const updates: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  if (data.service_name !== undefined) {
    updates.push(`service_name = $${paramIndex++}`);
    values.push(data.service_name);
  }
  if (data.service_icon !== undefined) {
    updates.push(`service_icon = $${paramIndex++}`);
    values.push(data.service_icon);
  }
  if (data.category !== undefined) {
    updates.push(`category = $${paramIndex++}`);
    values.push(data.category);
  }
  if (data.amount !== undefined) {
    updates.push(`amount = $${paramIndex++}`);
    values.push(data.amount);
  }
  if (data.currency !== undefined) {
    updates.push(`currency = $${paramIndex++}`);
    values.push(data.currency);
  }
  if (data.billing_cycle_days !== undefined) {
    updates.push(`billing_cycle_days = $${paramIndex++}`);
    values.push(data.billing_cycle_days);
  }
  if (data.next_payment_date !== undefined) {
    updates.push(`next_payment_date = $${paramIndex++}`);
    values.push(data.next_payment_date);
  }
  if (data.color_tag !== undefined) {
    updates.push(`color_tag = $${paramIndex++}`);
    values.push(data.color_tag);
  }
  if (data.is_active !== undefined) {
    updates.push(`is_active = $${paramIndex++}`);
    values.push(data.is_active);
  }
  if (data.notes !== undefined) {
    updates.push(`notes = $${paramIndex++}`);
    values.push(data.notes ? encrypt(data.notes) : null);
  }
  if (data.service_url !== undefined) {
    updates.push(`service_url = $${paramIndex++}`);
    values.push(data.service_url);
  }

  if (updates.length === 0) {
    return getSubscriptionById(id, userId);
  }

  updates.push(`updated_at = NOW()`);
  values.push(id, userId);

  const result = await pool.query<Subscription>(
    `UPDATE subscriptions 
     SET ${updates.join(', ')}
     WHERE id = $${paramIndex++} AND user_id = $${paramIndex++}
     RETURNING *`,
    values
  );

  if (result.rows.length === 0) {
    return null;
  }

  return decryptSubscription(result.rows[0]);
}

export async function deleteSubscription(
  id: number,
  userId: number
): Promise<boolean> {
  const result = await pool.query(
    'DELETE FROM subscriptions WHERE id = $1 AND user_id = $2',
    [id, userId]
  );

  return result.rowCount !== null && result.rowCount > 0;
}

function decryptSubscription(sub: Subscription): Subscription {
  if (sub.notes) {
    try {
      sub.notes = decrypt(sub.notes);
    } catch {
      sub.notes = '';
    }
  }
  return sub;
}

