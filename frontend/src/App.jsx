import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, Spin, App as AntApp } from 'antd';
import { HelmetProvider } from 'react-helmet-async';
import { Provider } from 'react-redux';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { store } from './store';
import MainLayout from './components/common/MainLayout';
import AdminLayout from './components/common/AdminLayout';
import ProtectedRoute from './components/common/ProtectedRoute';
import AdminRoute from './components/common/AdminRoute';
import './assets/styles/global.less';

// Lazy-loaded pages
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const AuctionDetail = lazy(() => import('./pages/AuctionDetail'));
const SearchResults = lazy(() => import('./pages/SearchResults'));
const UserProfile = lazy(() => import('./pages/UserProfile'));
const Checkout = lazy(() => import('./pages/Checkout'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Admin pages
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const UsersList = lazy(() => import('./pages/admin/UsersList'));
const AuctionsList = lazy(() => import('./pages/admin/AuctionsList'));
const TransactionReports = lazy(() => import('./pages/admin/TransactionReports'));
const Settings = lazy(() => import('./pages/admin/Settings'));

const LoadingFallback = () => (
  <div className="global-loading">
    <Spin size="large" />
  </div>
);

function App() {
  return (
    <HelmetProvider>
      <Provider store={store}>
        <ConfigProvider
          theme={{
            token: {
              colorPrimary: '#1890ff',
              borderRadius: 4,
            },
          }}
        >
          <AntApp>
            <AuthProvider>
              <SocketProvider>
                <Router>
                  <Suspense fallback={<LoadingFallback />}>
                    <Routes>
                      {/* Public routes */}
                      <Route path="/" element={<MainLayout />}>
                        <Route index element={<Home />} />
                        <Route path="login" element={<Login />} />
                        <Route path="register" element={<Register />} />
                        <Route path="forgot-password" element={<ForgotPassword />} />
                        <Route path="reset-password" element={<ResetPassword />} />
                        <Route path="auction/:id" element={<AuctionDetail />} />
                        <Route path="search" element={<SearchResults />} />
                      </Route>

                      {/* Protected routes */}
                      <Route path="/" element={
                        <ProtectedRoute>
                          <MainLayout />
                        </ProtectedRoute>
                      }>
                        <Route path="profile/*" element={<UserProfile />} />
                        <Route path="checkout/:auctionId" element={<Checkout />} />
                      </Route>

                      {/* Admin routes */}
                      <Route path="/admin" element={
                        <AdminRoute>
                          <AdminLayout />
                        </AdminRoute>
                      }>
                        <Route index element={<Navigate to="/admin/dashboard" replace />} />
                        <Route path="dashboard" element={<AdminDashboard />} />
                        <Route path="users" element={<UsersList />} />
                        <Route path="auctions" element={<AuctionsList />} />
                        <Route path="reports" element={<TransactionReports />} />
                        <Route path="settings" element={<Settings />} />
                      </Route>

                      {/* 404 route */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Suspense>
                </Router>
              </SocketProvider>
            </AuthProvider>
          </AntApp>
        </ConfigProvider>
      </Provider>
    </HelmetProvider>
  );
}

export default App;