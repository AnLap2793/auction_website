import React from 'react';
import DashboardPage from '../pages/admin/DashboardPage';
import TransactionManagementPage from '../pages/admin/TransactionList';
import UserList from '../pages/admin/UserList';
import ProductList from '../pages/admin/ProductList';
import AuctionList from '../pages/admin/AuctionList';

// Admin Login Route
const adminLoginRoute = {
    path: '/admin/login',
    element: null // Element sẽ được thiết lập trong App.jsx với prop
};

// Các routes của admin (đã được bảo vệ)
const adminRoutes = [
    { path: 'users', element: <UserList /> },
    { path: 'products', element: <ProductList /> },
    { path: 'auctions', element: <AuctionList /> },
    { path: 'transactions', element: <TransactionManagementPage /> },
    { path: '', element: <DashboardPage /> } // Index route
];

export { adminLoginRoute, adminRoutes };
