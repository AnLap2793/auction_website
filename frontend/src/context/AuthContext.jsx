import React, { createContext, useContext, useState, useEffect } from 'react';
import { getToken, setToken, removeToken } from '../utils/tokenManager';
import axios from '../utils/axiosCustomize';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const token = getToken();
        if (token) {
            const fetchUser = async () => {
                try {
                    const response = await axios.get('/auth/account');
                    setUser(response.data.data.user);
                } catch (error) {
                    console.error('Lỗi khi lấy thông tin người dùng:', error);
                    removeToken();
                } finally {
                    setIsLoading(false);
                }
            };
            fetchUser();
        } else {
            setIsLoading(false);
        }
    }, []);

    const login = async (email, password) => {
        try {
            const response = await axios.post('/auth/login', {
                email,
                password
            });

            console.log('Login response structure:', response);
            console.log('Login response data:', response.data);

            // Kiểm tra xem response có thành công không
            if (response.data) {
                // Tìm token trong response
                let token = null;
                let userData = null;

                // Lấy thông tin token và user
                if (response.data.data && response.data.data.access_token) {
                    token = response.data.data.access_token;
                    userData = response.data.data.user;
                    console.log(
                        'Found token in response.data.data.access_token'
                    );
                }

                // Kiểm tra trạng thái xác thực email
                if (userData && userData.is_verified === false) {
                    // Email chưa được xác thực, ném lỗi và không đăng nhập
                    throw {
                        displayMessage:
                            'Vui lòng xác thực email của bạn trước khi đăng nhập',
                        needEmailVerification: true
                    };
                }

                // Nếu tìm thấy token và email đã được xác thực, lưu vào localStorage và cập nhật user state
                if (token) {
                    console.log(
                        'Saving token:',
                        token.substring(0, 10) + '...'
                    );

                    // Clear localStorage trước khi lưu token mới
                    localStorage.removeItem('access_token');

                    // Lưu token trực tiếp vào localStorage
                    localStorage.setItem('access_token', token);

                    // Kiểm tra xem token đã được lưu chưa
                    const savedToken = localStorage.getItem('access_token');
                    console.log(
                        'Saved token check:',
                        savedToken ? 'Token saved' : 'Token not saved'
                    );

                    // Đặt lại biến user state
                    if (userData) {
                        setUser(userData);
                    }

                    return;
                }

                // Nếu không tìm thấy token, log cấu trúc response để debug
                console.error('Token not found in response:', response.data);
                throw new Error(
                    'Không thể tìm thấy token trong phản hồi của server'
                );
            } else {
                console.error('Empty response data');
                throw new Error('Phản hồi từ server không có dữ liệu');
            }
        } catch (error) {
            console.error('Lỗi đăng nhập:', error);
            throw error;
        }
    };

    const register = async (
        email,
        password,
        first_name,
        last_name,
        phone_number,
        address
    ) => {
        try {
            const response = await axios.post('/auth/register', {
                email,
                password,
                first_name,
                last_name,
                phone_number,
                address
            });

            console.log('Register response structure:', response);
            console.log('Register response data:', response.data);

            // Kiểm tra xem response có thành công không
            if (response.data) {
                // Không lưu token và user data sau khi đăng ký
                return {
                    success: true,
                    message:
                        response.data.data.message ||
                        'Đăng ký thành công. Vui lòng kiểm tra email để xác thực tài khoản.'
                };
            } else {
                console.error('Empty response data');
                throw new Error('Phản hồi từ server không có dữ liệu');
            }
        } catch (error) {
            console.error('Lỗi đăng ký:', error);
            throw error;
        }
    };

    const logout = () => {
        removeToken();
        setUser(null);
    };

    // Thêm hàm xác thực email
    const verifyEmail = async (token) => {
        try {
            const response = await axios.get(`/auth/verify-email/${token}`);
            // Kiểm tra response từ backend
            if (response.data && response.data.status === 'success') {
                return {
                    success: true,
                    message:
                        response.data.message || 'Xác thực email thành công'
                };
            } else {
                return {
                    success: false,
                    message:
                        response.data?.message ||
                        'Xác thực email không thành công'
                };
            }
        } catch (error) {
            let errorMessage = 'Xác thực email không thành công';
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.displayMessage) {
                errorMessage = error.displayMessage;
            }
            return {
                success: false,
                message: errorMessage
            };
        }
    };

    // Thêm hàm gửi lại email xác thực
    const resendVerificationEmail = async (email) => {
        try {
            const response = await axios.post('/auth/resend-verification', {
                email
            });
            return {
                success: true,
                message: response.data.message || 'Đã gửi lại email xác thực'
            };
        } catch (error) {
            let errorMessage = 'Không thể gửi lại email xác thực';
            if (
                error.response &&
                error.response.data &&
                error.response.data.message
            ) {
                errorMessage = error.response.data.message;
            } else if (error.displayMessage) {
                errorMessage = error.displayMessage;
            }
            return {
                success: false,
                message: errorMessage
            };
        }
    };

    const value = {
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        verifyEmail,
        resendVerificationEmail
    };

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
