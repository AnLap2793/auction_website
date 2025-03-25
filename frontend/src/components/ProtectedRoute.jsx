import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Component để bảo vệ routes
 * @param {Object} props Props của component
 * @param {boolean} props.isAuthenticated Xác định xem người dùng đã được xác thực hay chưa
 * @param {string} props.redirectPath Đường dẫn để chuyển hướng nếu chưa xác thực
 * @param {boolean} props.isAdmin Xác định xem đây có phải là admin route hay không
 * @param {boolean} props.useAuthContext Sử dụng AuthContext để kiểm tra xác thực (mặc định: true)
 * @returns {JSX.Element} Route được bảo vệ hoặc chuyển hướng đến trang đăng nhập
 */
const ProtectedRoute = ({
    isAuthenticated, // Dùng cho admin
    redirectPath = '/login',
    isAdmin = false,
    useAuthContext = true // Mặc định sử dụng AuthContext
}) => {
    // Sử dụng AuthContext cho user routes
    const { isAuthenticated: isUserAuthenticated, isLoading, user } = useAuth();

    // Nếu loading và đang sử dụng context, hiển thị loading indicator
    if (isLoading && useAuthContext) {
        return <div>Loading...</div>;
    }

    // Xác định người dùng đã được xác thực hay chưa
    const isAuth = useAuthContext ? isUserAuthenticated : isAuthenticated;

    // Kiểm tra xem người dùng đã đăng nhập và email đã được xác thực chưa
    if (!isAuth) {
        return <Navigate to={redirectPath} />;
    }

    // Kiểm tra trạng thái xác thực email cho người dùng thông thường
    if (useAuthContext && user && user.is_verified === false) {
        // Chuyển hướng đến trang đăng nhập với trạng thái cần xác thực email
        return <Navigate to={`${redirectPath}?verifyEmail=true`} />;
    }

    // Nếu đã đăng nhập và email đã được xác thực, hiển thị các route con
    return <Outlet />;
};

export default ProtectedRoute;
