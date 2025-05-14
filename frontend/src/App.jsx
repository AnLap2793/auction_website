import 'antd/dist/reset.css';
import '@ant-design/v5-patch-for-react-19';
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate
} from 'react-router-dom';
import { ConfigProvider } from 'antd';
import React, { useState, useEffect } from 'react';
import NotFoundPage from './pages/public/NotFoundPage';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { isValidAdminToken } from './utils/tokenManager';
import { userRoutes, protectedUserRoutes } from './routes/UserRoutes';
import { adminLoginRoute, adminRoutes } from './routes/AdminRoutes';
import UserLayout from './layouts/UserLayout';
import AdminLayout from './layouts/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLogin from './pages/admin/AdminLogin';

function App() {
    const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Kiểm tra token khi khởi động ứng dụng
        const checkAdminAuth = () => {
            const isValid = isValidAdminToken();
            setIsAdminAuthenticated(isValid);
            setIsLoading(false);
        };

        checkAdminAuth();
    }, []);

    if (isLoading) {
        return null; // hoặc một loading spinner
    }

    return (
        <ConfigProvider>
            <AuthProvider>
                <SocketProvider>
                    <Router>
                        <Routes>
                            {/* User Routes */}
                            <Route element={<UserLayout />}>
                                {/* Public User Routes */}
                                {userRoutes.map((route) => (
                                    <Route
                                        key={route.path}
                                        path={route.path}
                                        element={route.element}
                                    />
                                ))}

                                {/* Protected User Routes - Sử dụng AuthContext */}
                                <Route
                                    element={
                                        <ProtectedRoute useAuthContext={true} />
                                    }
                                >
                                    {protectedUserRoutes.map((route) => (
                                        <Route
                                            key={route.path}
                                            path={route.path}
                                            element={route.element}
                                        />
                                    ))}
                                </Route>
                            </Route>

                            {/* Admin Login Route */}
                            <Route
                                path={adminLoginRoute.path}
                                element={
                                    <AdminLogin
                                        setIsAdminAuthenticated={
                                            setIsAdminAuthenticated
                                        }
                                    />
                                }
                            />

                            {/* Protected Admin Routes - Không sử dụng AuthContext */}
                            <Route
                                element={
                                    <ProtectedRoute
                                        isAuthenticated={isAdminAuthenticated}
                                        redirectPath='/admin/login'
                                        useAuthContext={false}
                                        isAdmin={true}
                                    />
                                }
                            >
                                <Route
                                    path='/admin/*'
                                    element={
                                        <AdminLayout
                                            setIsAdminAuthenticated={
                                                setIsAdminAuthenticated
                                            }
                                        />
                                    }
                                >
                                    {adminRoutes.map((route) => (
                                        <Route
                                            key={route.path}
                                            path={route.path}
                                            element={route.element}
                                        />
                                    ))}
                                </Route>
                            </Route>

                            {/* 404 Page */}
                            <Route path='*' element={<NotFoundPage />} />
                        </Routes>
                    </Router>
                </SocketProvider>
            </AuthProvider>
        </ConfigProvider>
    );
}

export default App;
