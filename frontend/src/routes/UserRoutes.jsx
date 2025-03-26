import React from 'react';
import HomePage from '../pages/public/HomePage';
import LoginPage from '../pages/public/LoginPage';
import Register from '../pages/public/RegisterPage';
import About from '../pages/public/About';
import Contact from '../pages/public/Contact';
import Categories from '../pages/user/CategoriesPage';
import BiddingDetail from '../pages/user/BiddingDetail';
import MyProfile from '../pages/user/MyProfile';
import MyAuctions from '../pages/user/MyAuction';
import Auctions from '../pages/user/AuctionsPage';
import EmailVerificationPage from '../pages/public/EmailVerificationPage';
import ResendVerificationPage from '../pages/public/ResendVerificationPage';
import ForgotPassword from '../components/auth/ForgotPassword';
import ResetPassword from '../components/auth/ResetPassword';

// Các routes của user
const userRoutes = [
    // Public Routes
    { path: '/', element: <HomePage /> },
    { path: '/login', element: <LoginPage /> },
    { path: '/register', element: <Register /> },
    { path: '/about', element: <About /> },
    { path: '/contact', element: <Contact /> },
    { path: '/categories', element: <Categories /> },
    { path: '/auctions', element: <Auctions /> },
    // Thêm routes xác thực email
    { path: '/verify-email/:token', element: <EmailVerificationPage /> },
    { path: '/resend-verification', element: <ResendVerificationPage /> },
    { path: '/forgot-password', element: <ForgotPassword /> },
    { path: '/reset-password', element: <ResetPassword /> }
];

// Protected Routes của user
const protectedUserRoutes = [
    { path: '/profile', element: <MyProfile /> },
    { path: '/my-auctions', element: <MyAuctions /> },
    { path: '/auctions/:id', element: <BiddingDetail /> }
];

export { userRoutes, protectedUserRoutes };
