import React, { useState } from 'react';
import { Form, Input, Button, Checkbox, Alert, Divider } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import RecaptchaWrapper from './RecaptchaWrapper';

const LoginForm = () => {
    const [form] = Form.useForm();
    const { login } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [recaptchaToken, setRecaptchaToken] = useState('');

    const onFinish = async (values) => {
        if (!recaptchaToken) {
            setError('Please complete the reCAPTCHA verification');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await login(values.email, values.password, recaptchaToken);
            navigate('/');
        } catch (err) {
            setError(
                err.message || 'Failed to login. Please check your credentials.'
            );
        } finally {
            setLoading(false);
        }
    };

    const handleRecaptchaChange = (token) => {
        setRecaptchaToken(token);
        setError('');
    };

    return (
        <Form
            form={form}
            name='login'
            className='login-form'
            initialValues={{ remember: true }}
            onFinish={onFinish}
            layout='vertical'
        >
            {error && (
                <Alert message={error} type='error' showIcon className='mb-4' />
            )}

            <Form.Item
                name='email'
                label='Email'
                rules={[
                    { required: true, message: 'Please input your email!' },
                    {
                        type: 'email',
                        message: 'Please enter a valid email address!'
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
                label='Password'
                rules={[
                    { required: true, message: 'Please input your password!' }
                ]}
            >
                <Input.Password
                    prefix={<LockOutlined />}
                    placeholder='Password'
                    size='large'
                />
            </Form.Item>

            <Form.Item>
                <Form.Item name='remember' valuePropName='checked' noStyle>
                    <Checkbox>Remember me</Checkbox>
                </Form.Item>
                <Link to='/forgot-password' className='login-form-forgot'>
                    Forgot password?
                </Link>
            </Form.Item>

            <Form.Item>
                <RecaptchaWrapper onChange={handleRecaptchaChange} />
            </Form.Item>

            <Form.Item>
                <Button
                    type='primary'
                    htmlType='submit'
                    className='login-form-button'
                    block
                    size='large'
                    loading={loading}
                >
                    Log in
                </Button>
            </Form.Item>

            <Divider>Or</Divider>

            <div className='text-center'>
                Don't have an account? <Link to='/register'>Register now!</Link>
            </div>
        </Form>
    );
};

export default LoginForm;
