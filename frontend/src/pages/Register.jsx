import React, { useState } from 'react';
import {
    Form,
    Input,
    Button,
    Card,
    Typography,
    Divider,
    Alert,
    Row,
    Col,
    Checkbox
} from 'antd';
import {
    UserOutlined,
    LockOutlined,
    MailOutlined,
    GoogleOutlined,
    FacebookOutlined
} from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../hooks/useAuth';
import './Register.less';

const { Title, Text } = Typography;

const Register = () => {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const { register } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (values) => {
        const { name, email, password } = values;

        try {
            setLoading(true);
            setError('');
            await register(name, email, password);
            navigate('/');
        } catch (err) {
            setError(err.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Helmet>
                <title>Register | Auction Hub</title>
            </Helmet>

            <div className='register-container'>
                <Row justify='center' align='middle'>
                    <Col xs={22} sm={16} md={12} lg={8} xl={6}>
                        <Card className='register-card'>
                            <div className='register-header'>
                                <Title level={2}>Create Account</Title>
                                <Text type='secondary'>
                                    Join Auction Hub and start bidding
                                </Text>
                            </div>

                            {error && (
                                <Alert
                                    message='Registration Failed'
                                    description={error}
                                    type='error'
                                    showIcon
                                    className='register-error'
                                />
                            )}

                            <Form
                                form={form}
                                name='register'
                                onFinish={handleSubmit}
                                layout='vertical'
                                className='register-form'
                            >
                                <Form.Item
                                    name='name'
                                    rules={[
                                        {
                                            required: true,
                                            message: 'Please enter your name'
                                        },
                                        {
                                            min: 2,
                                            message:
                                                'Name must be at least 2 characters'
                                        }
                                    ]}
                                >
                                    <Input
                                        prefix={<UserOutlined />}
                                        placeholder='Full Name'
                                        size='large'
                                    />
                                </Form.Item>

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
                                        prefix={<MailOutlined />}
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
                                        },
                                        {
                                            min: 8,
                                            message:
                                                'Password must be at least 8 characters'
                                        },
                                        {
                                            pattern:
                                                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
                                            message:
                                                'Password must contain uppercase, lowercase, number and special character'
                                        }
                                    ]}
                                >
                                    <Input.Password
                                        prefix={<LockOutlined />}
                                        placeholder='Password'
                                        size='large'
                                    />
                                </Form.Item>

                                <Form.Item
                                    name='confirmPassword'
                                    dependencies={['password']}
                                    rules={[
                                        {
                                            required: true,
                                            message:
                                                'Please confirm your password'
                                        },
                                        ({ getFieldValue }) => ({
                                            validator(_, value) {
                                                if (
                                                    !value ||
                                                    getFieldValue(
                                                        'password'
                                                    ) === value
                                                ) {
                                                    return Promise.resolve();
                                                }
                                                return Promise.reject(
                                                    new Error(
                                                        'The two passwords do not match'
                                                    )
                                                );
                                            }
                                        })
                                    ]}
                                >
                                    <Input.Password
                                        prefix={<LockOutlined />}
                                        placeholder='Confirm Password'
                                        size='large'
                                    />
                                </Form.Item>

                                <Form.Item
                                    name='agreement'
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
                                        <Link to='/terms'>
                                            Terms of Service
                                        </Link>{' '}
                                        and{' '}
                                        <Link to='/privacy'>
                                            Privacy Policy
                                        </Link>
                                    </Checkbox>
                                </Form.Item>

                                <Form.Item>
                                    <Button
                                        type='primary'
                                        htmlType='submit'
                                        size='large'
                                        block
                                        loading={loading}
                                        className='register-button'
                                    >
                                        Register
                                    </Button>
                                </Form.Item>
                            </Form>

                            <Divider>
                                <Text type='secondary'>Or register with</Text>
                            </Divider>

                            <div className='social-register'>
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

                            <div className='login-link'>
                                <Text>Already have an account?</Text>
                                <Link to='/login'> Login</Link>
                            </div>
                        </Card>
                    </Col>
                </Row>
            </div>
        </>
    );
};

export default Register;
