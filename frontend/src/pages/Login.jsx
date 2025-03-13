import React, { useState } from 'react';
import {
    Form,
    Input,
    Button,
    Checkbox,
    Card,
    Typography,
    Divider,
    Alert,
    Row,
    Col
} from 'antd';
import {
    UserOutlined,
    LockOutlined,
    GoogleOutlined,
    FacebookOutlined
} from '@ant-design/icons';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../hooks/useAuth';
import './Login.less';

const { Title, Text } = Typography;

const Login = () => {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Get redirect path from location state or default to home
    const from = location.state?.from?.pathname || '/';

    const handleSubmit = async (values) => {
        const { email, password, remember } = values;

        try {
            setLoading(true);
            setError('');
            await login(email, password);

            // Store remember me preference
            if (remember) {
                localStorage.setItem('rememberedEmail', email);
            } else {
                localStorage.removeItem('rememberedEmail');
            }

            // Redirect to the page user tried to visit or home
            navigate(from, { replace: true });
        } catch (err) {
            setError(
                err.message || 'Login failed. Please check your credentials.'
            );
        } finally {
            setLoading(false);
        }
    };

    // Get remembered email if exists
    const rememberedEmail = localStorage.getItem('rememberedEmail');

    return (
        <>
            <Helmet>
                <title>Login | Auction Hub</title>
            </Helmet>

            <div className='login-container'>
                <Row justify='center' align='middle'>
                    <Col xs={22} sm={16} md={12} lg={8} xl={6}>
                        <Card className='login-card'>
                            <div className='login-header'>
                                <Title level={2}>Welcome Back</Title>
                                <Text type='secondary'>
                                    Sign in to continue to Auction Hub
                                </Text>
                            </div>

                            {error && (
                                <Alert
                                    message='Login Failed'
                                    description={error}
                                    type='error'
                                    showIcon
                                    className='login-error'
                                />
                            )}

                            <Form
                                form={form}
                                name='login'
                                initialValues={{
                                    remember: !!rememberedEmail,
                                    email: rememberedEmail || ''
                                }}
                                onFinish={handleSubmit}
                                layout='vertical'
                                className='login-form'
                            >
                                <Form.Item
                                    name='email'
                                    rules={[
                                        {
                                            required: true,
                                            message: 'Please enter your email'
                                        },
                                        {
                                            type: 'email',
                                            message:
                                                'Please enter a valid email'
                                        }
                                    ]}
                                >
                                    <Input
                                        prefix={<UserOutlined />}
                                        placeholder='Email'
                                        size='large'
                                    />
                                </Form.Item>

                                <Form.Item
                                    name='password'
                                    rules={[
                                        {
                                            required: true,
                                            message:
                                                'Please enter your password'
                                        }
                                    ]}
                                >
                                    <Input.Password
                                        prefix={<LockOutlined />}
                                        placeholder='Password'
                                        size='large'
                                    />
                                </Form.Item>

                                <Form.Item>
                                    <div className='login-form-options'>
                                        <Form.Item
                                            name='remember'
                                            valuePropName='checked'
                                            noStyle
                                        >
                                            <Checkbox>Remember me</Checkbox>
                                        </Form.Item>
                                        <Link
                                            to='/forgot-password'
                                            className='forgot-password'
                                        >
                                            Forgot password?
                                        </Link>
                                    </div>
                                </Form.Item>

                                <Form.Item>
                                    <Button
                                        type='primary'
                                        htmlType='submit'
                                        size='large'
                                        block
                                        loading={loading}
                                        className='login-button'
                                    >
                                        Log In
                                    </Button>
                                </Form.Item>
                            </Form>

                            <Divider>
                                <Text type='secondary'>Or continue with</Text>
                            </Divider>

                            <div className='social-login'>
                                <Button
                                    icon={<GoogleOutlined />}
                                    size='large'
                                    className='google-button'
                                >
                                    Google
                                </Button>
                                <Button
                                    icon={<FacebookOutlined />}
                                    size='large'
                                    className='facebook-button'
                                >
                                    Facebook
                                </Button>
                            </div>

                            <div className='register-link'>
                                <Text>Don't have an account?</Text>
                                <Link to='/register'> Register now</Link>
                            </div>
                        </Card>
                    </Col>
                </Row>
            </div>
        </>
    );
};

export default Login;
