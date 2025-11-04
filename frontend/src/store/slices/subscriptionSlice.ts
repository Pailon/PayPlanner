import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../api';

export interface Subscription {
  id: number;
  user_id: number;
  service_name: string;
  service_icon?: string;
  category?: string;
  amount: number;
  currency: string;
  billing_cycle_days: number;
  next_payment_date: string;
  color_tag?: string;
  is_active: boolean;
  notes?: string;
  service_url?: string;
  created_at: string;
  updated_at: string;
}

interface SubscriptionState {
  items: Subscription[];
  isLoading: boolean;
  error: string | null;
}

const initialState: SubscriptionState = {
  items: [],
  isLoading: false,
  error: null,
};

export const fetchSubscriptions = createAsyncThunk(
  'subscriptions/fetch',
  async () => {
    const response = await api.get<Subscription[]>('/subscriptions');
    return response.data;
  }
);

export const createSubscription = createAsyncThunk(
  'subscriptions/create',
  async (data: Partial<Subscription>) => {
    const response = await api.post<Subscription>('/subscriptions', data);
    return response.data;
  }
);

export const updateSubscription = createAsyncThunk(
  'subscriptions/update',
  async ({ id, data }: { id: number; data: Partial<Subscription> }) => {
    const response = await api.put<Subscription>(`/subscriptions/${id}`, data);
    return response.data;
  }
);

export const deleteSubscription = createAsyncThunk(
  'subscriptions/delete',
  async (id: number) => {
    await api.delete(`/subscriptions/${id}`);
    return id;
  }
);

export const pauseSubscription = createAsyncThunk(
  'subscriptions/pause',
  async (id: number) => {
    const response = await api.post<Subscription>(`/subscriptions/${id}/pause`);
    return response.data;
  }
);

export const resumeSubscription = createAsyncThunk(
  'subscriptions/resume',
  async (id: number) => {
    const response = await api.post<Subscription>(`/subscriptions/${id}/resume`);
    return response.data;
  }
);

const subscriptionSlice = createSlice({
  name: 'subscriptions',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSubscriptions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSubscriptions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchSubscriptions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch subscriptions';
      })
      .addCase(createSubscription.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateSubscription.fulfilled, (state, action) => {
        const index = state.items.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(deleteSubscription.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
      })
      .addCase(pauseSubscription.fulfilled, (state, action) => {
        const index = state.items.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(resumeSubscription.fulfilled, (state, action) => {
        const index = state.items.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      });
  },
});

export const { clearError } = subscriptionSlice.actions;
export default subscriptionSlice.reducer;

