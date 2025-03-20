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
    MailOutlined,
    GoogleOutlined,
    FacebookOutlined
} from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const { Title, Text } = Typography;

const Register = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { register } = useAuth();

    const onFinish = (values) => {
        setLoading(true);
        // Simulate registration delay
        setTimeout(() => {
            register(values.email);
            message.success('Registration successful! You can now log in.');
            navigate('/signin');
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
                            Create an Account
                        </Title>
                        <Text type='secondary'>
                            Join AuctionMaster to start bidding on items
                        </Text>
                    </div>

                    <Form
                        name='register_form'
                        initialValues={{ agree: true }}
                        onFinish={onFinish}
                        layout='vertical'
                        size='large'
                    >
                        <Form.Item
                            name='name'
                            rules={[
                                {
                                    required: true,
                                    message: 'Please enter your name!'
                                }
                            ]}
                        >
                            <Input
                                prefix={
                                    <UserOutlined className='site-form-item-icon' />
                                }
                                placeholder='Full Name'
                            />
                        </Form.Item>

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
                                    <MailOutlined className='site-form-item-icon' />
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
                                },
                                {
                                    min: 8,
                                    message:
                                        'Password must be at least 8 characters!'
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

                        <Form.Item
                            name='confirm'
                            dependencies={['password']}
                            rules={[
                                {
                                    required: true,
                                    message: 'Please confirm your password!'
                                },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (
                                            !value ||
                                            getFieldValue('password') === value
                                        ) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(
                                            new Error(
                                                'The passwords do not match!'
                                            )
                                        );
                                    }
                                })
                            ]}
                        >
                            <Input.Password
                                prefix={
                                    <LockOutlined className='site-form-item-icon' />
                                }
                                placeholder='Confirm Password'
                            />
                        </Form.Item>

                        <Form.Item
                            name='agree'
                            valuePropName='checked'
                            rules={[
                                {
                                    validator: (_, value) =>
                                        value
                                            ? Promise.resolve()
                                            : Promise.reject(
                                                  new Error(
                                                      'You must accept the terms and conditions'
                                                  )
                                              )
                                }
                            ]}
                        >
                            <Checkbox>
                                I agree to the{' '}
                                <Link to='/terms'>Terms of Service</Link> and{' '}
                                <Link to='/privacy'>Privacy Policy</Link>
                            </Checkbox>
                        </Form.Item>

                        <Form.Item>
                            <Button
                                type='primary'
                                htmlType='submit'
                                block
                                loading={loading}
                            >
                                Create Account
                            </Button>
                        </Form.Item>

                        <div style={{ textAlign: 'center' }}>
                            <Text type='secondary'>
                                Already have an account?{' '}
                            </Text>
                            <Link to='/signin'>Sign in</Link>
                        </div>

                        <Divider plain>or register with</Divider>

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

export default Register;
