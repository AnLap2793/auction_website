import React, { useState } from 'react';
import {
    Form,
    Input,
    Button,
    Checkbox,
    Card,
    Typography,
    Divider,
    message
} from 'antd';
import {
    UserOutlined,
    LockOutlined,
    GoogleOutlined,
    FacebookOutlined
} from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const { Title, Text } = Typography;

const SignIn = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const onFinish = (values) => {
        setLoading(true);
        // Simulate authentication delay
        setTimeout(() => {
            login(values.email);
            message.success('Login successful!');
            navigate('/');
            setLoading(false);
        }, 1000);
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

                        <Divider plain>or continue with</Divider>

                        <div style={{ display: 'flex', gap: '12px' }}>
                            <Button
                                icon={<GoogleOutlined />}
                                block
                                style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center'
                                }}
                            >
                                Google
                            </Button>
                            <Button
                                icon={<FacebookOutlined />}
                                block
                                style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center'
                                }}
                            >
                                Facebook
                            </Button>
                        </div>
                    </Form>
                </Card>
            </div>
        </div>
    );
};

export default SignIn;
