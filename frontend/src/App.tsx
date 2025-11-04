import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from 'antd';
import { useAppDispatch, useAppSelector } from './store/hooks';
import { authSlice } from './store/slices/authSlice';
import { checkAuth, initTelegram } from './store/thunks/authThunks';
import Dashboard from './pages/Dashboard';
import Subscriptions from './pages/Subscriptions';
import SubscriptionForm from './pages/SubscriptionForm';
import Settings from './pages/Settings';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

const { Content } = Layout;

function App() {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  useEffect(() => {
    dispatch(initTelegram());
    dispatch(checkAuth());
  }, [dispatch]);

  return (
    <BrowserRouter>
      <Layout className="min-h-screen">
        <Content>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/subscriptions"
              element={
                <ProtectedRoute>
                  <Subscriptions />
                </ProtectedRoute>
              }
            />
            <Route
              path="/subscriptions/new"
              element={
                <ProtectedRoute>
                  <SubscriptionForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/subscriptions/:id/edit"
              element={
                <ProtectedRoute>
                  <SubscriptionForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Content>
      </Layout>
    </BrowserRouter>
  );
}

export default App;

