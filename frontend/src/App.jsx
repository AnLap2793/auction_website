import 'antd/dist/reset.css';
import '@ant-design/v5-patch-for-react-19';
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate
} from 'react-router-dom';
import { ConfigProvider } from 'antd';
import React, { useState } from 'react';
import AdminLayout from './layouts/AdminLayout';
import DashboardPage from './pages/admin/DashboardPage';
import TransactionManagementPage from './pages/admin/TransactionManagementPage';
import UserList from './pages/admin/UserManagement/UserList';
import ProductList from './pages/admin/ProductManagement/ProductList';
import AuctionList from './pages/admin/AuctionManagement/AuctionList';
import NotFoundPage from './pages/public/NotFoundPage';
import AdminLogin from './pages/admin/AdminLogin';
import ProtectedAdminRoute from './pages/admin/ProtectedAdminRoute';
import UserLayout from './layouts/UserLayout';
import HomePage from './pages/public/HomePage';
import Auctions from './pages/user/AuctionsPage';
import Categories from './pages/user/CategoriesPage';
import BiddingDetail from './pages/user/BiddingDetail';
import SignIn from './pages/public/SignIn';
import Register from './pages/public/RegisterPage';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from '../src/context/AuthContext';
import About from './pages/public/About';
import Contact from './pages/public/Contact';

function App() {
    const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

    return (
        <ConfigProvider>
            <AuthProvider>
                <Router>
                    <Routes>
                        {/* User Routes */}
                        <Route path='/' element={<UserLayout />}>
                            <Route index element={<HomePage />} />
                            <Route path='signin' element={<SignIn />} />
                            <Route path='register' element={<Register />} />
                            <Route path='auctions' element={<Auctions />} />
                            <Route
                                path='/auction/:id'
                                element={
                                    <ProtectedRoute>
                                        <BiddingDetail />
                                    </ProtectedRoute>
                                }
                            />
                            <Route path='categories' element={<Categories />} />
                            <Route path='contact' element={<Contact />} />
                            <Route path='about' element={<About />} />
                        </Route>

                        {/* Admin Routes */}
                        {/* Route đăng nhập admin */}
                        <Route
                            path='/admin/login'
                            element={
                                <AdminLogin
                                    setIsAdminAuthenticated={
                                        setIsAdminAuthenticated
                                    }
                                />
                            }
                        />

                        {/* Bảo vệ các route admin */}
                        <Route
                            element={
                                <ProtectedAdminRoute
                                    isAdminAuthenticated={isAdminAuthenticated}
                                />
                            }
                        >
                            {/* Sử dụng AdminLayout làm layout chung cho các trang admin */}
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
                                {/* Các route con của admin */}
                                <Route index element={<DashboardPage />} />
                                <Route path='users' element={<UserList />} />
                                <Route
                                    path='products'
                                    element={<ProductList />}
                                />
                                <Route
                                    path='auctions'
                                    element={<AuctionList />}
                                />
                                <Route
                                    path='transactions'
                                    element={<TransactionManagementPage />}
                                />
                            </Route>
                        </Route>

                        {/* Mặc định chuyển hướng đến trang đăng nhập admin */}
                        <Route
                            path='/'
                            element={<Navigate to='/admin/login' />}
                        />

                        {/* Trang 404 */}
                        <Route path='*' element={<NotFoundPage />} />
                    </Routes>
                </Router>
            </AuthProvider>
        </ConfigProvider>
    );
}

export default App;
