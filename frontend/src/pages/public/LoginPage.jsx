import React, { useState, useEffect } from 'react';
import {
    Form,
    Input,
    Button,
    Checkbox,
    Card,
    Typography,
    notification,
    Alert
} from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getToken } from '../../utils/tokenManager';

const { Title, Text } = Typography;

const LoginPage = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();
    const [showVerifyEmailAlert, setShowVerifyEmailAlert] = useState(false);

    useEffect(() => {
        // Kiểm tra xem có query parameter verifyEmail không
        const params = new URLSearchParams(location.search);
        if (params.get('verifyEmail') === 'true') {
            setShowVerifyEmailAlert(true);
        }
    }, [location]);

    const onFinish = async (values) => {
        setLoading(true);
        try {
            await login(values.email, values.password);

            // Kiểm tra xem token đã được lưu hay chưa
            const token = getToken();
            console.log('Token after login:', token);

            if (!token) {
                throw new Error('Token không được lưu sau khi đăng nhập');
            }

            notification.success({
                message: 'Đăng nhập thành công!',
                description: 'Chào mừng bạn trở lại!'
            });
            navigate('/');
        } catch (error) {
            // Xử lý trường hợp email chưa được xác thực
            if (error.needEmailVerification) {
                // Hiển thị cảnh báo yêu cầu xác thực email
                setShowVerifyEmailAlert(true);
                // Lưu email để sử dụng cho chức năng gửi lại email xác thực
                localStorage.setItem('pendingVerificationEmail', values.email);
                notification.warning({
                    message: 'Xác thực email',
                    description:
                        'Vui lòng xác thực email của bạn trước khi đăng nhập. Kiểm tra hộp thư của bạn hoặc gửi lại email xác thực.',
                    duration: 10
                });
            } else {
                // Hiển thị thông báo lỗi từ API nếu có
                const errorMessage =
                    error.displayMessage || 'Email hoặc mật khẩu không đúng!';
                notification.error({
                    message: 'Đăng nhập không thành công',
                    description: errorMessage
                });
            }
            console.error('Lỗi chi tiết:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: '50px 20px',
                    background: '#f5f5f5',
                    minHeight: 'calc(100vh - 64px - 70px)' // Accounting for header and footer
                }}
            >
                <Card
                    style={{
                        width: '100%',
                        maxWidth: '420px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                    }}
                >
                    <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                        <Title level={2} style={{ margin: '0 0 8px 0' }}>
                            Welcome Back
                        </Title>
                        <Text type='secondary'>
                            Sign in to continue to AuctionMaster
                        </Text>
                    </div>

                    {showVerifyEmailAlert ? (
                        <Alert
                            message='Xác thực email là bắt buộc'
                            description={
                                <div>
                                    <p>
                                        Tài khoản của bạn chưa được xác thực.
                                        Vui lòng kiểm tra email của bạn để xác
                                        thực tài khoản.
                                    </p>
                                    <p>
                                        Nếu không nhận được email, bạn có thể{' '}
                                        <Link to='/resend-verification'>
                                            gửi lại email xác thực
                                        </Link>
                                        .
                                    </p>
                                </div>
                            }
                            type='warning'
                            showIcon
                            style={{ marginBottom: '20px' }}
                            closable
                            onClose={() => setShowVerifyEmailAlert(false)}
                        />
                    ) : (
                        <Form
                            name='login_form'
                            initialValues={{ remember: true }}
                            onFinish={onFinish}
                            layout='vertical'
                            size='large'
                        >
                            <Form.Item
                                name='email'
                                rules={[
                                    {
                                        required: true,
                                        message: 'Please enter your email!'
                                    },
                                    {
                                        type: 'email',
                                        message:
                                            'Please enter a valid email address!'
                                    }
                                ]}
                            >
                                <Input
                                    prefix={
                                        <UserOutlined className='site-form-item-icon' />
                                    }
                                    placeholder='Email'
                                />
                            </Form.Item>

                            <Form.Item
                                name='password'
                                rules={[
                                    {
                                        required: true,
                                        message: 'Please enter your password!'
                                    }
                                ]}
                            >
                                <Input.Password
                                    prefix={
                                        <LockOutlined className='site-form-item-icon' />
                                    }
                                    placeholder='Password'
                                />
                            </Form.Item>

                            <Form.Item>
                                <div
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between'
                                    }}
                                >
                                    <Form.Item
                                        name='remember'
                                        valuePropName='checked'
                                        noStyle
                                    >
                                        <Checkbox>Remember me</Checkbox>
                                    </Form.Item>

                                    <Link to='/forgot-password'>
                                        Forgot password?
                                    </Link>
                                </div>
                            </Form.Item>

                            <Form.Item>
                                <Button
                                    type='primary'
                                    htmlType='submit'
                                    block
                                    loading={loading}
                                >
                                    Sign In
                                </Button>
                            </Form.Item>

                            <div style={{ textAlign: 'center' }}>
                                <Text type='secondary'>
                                    Don't have an account?{' '}
                                </Text>
                                <Link to='/register'>Sign up now</Link>
                            </div>
                        </Form>
                    )}
                </Card>
            </div>
        </div>
    );
};

export default LoginPage;
