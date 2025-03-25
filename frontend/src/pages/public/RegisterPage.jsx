import React, { useState } from 'react';
import {
    Form,
    Input,
    Button,
    Card,
    Typography,
    notification,
    Row,
    Col
} from 'antd';
import {
    UserOutlined,
    LockOutlined,
    MailOutlined,
    PhoneOutlined,
    EnvironmentOutlined
} from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const { Title, Text } = Typography;

const RegisterPage = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { register } = useAuth();

    const onFinish = async (values) => {
        setLoading(true);
        try {
            const result = await register(
                values.email,
                values.password,
                values.first_name,
                values.last_name,
                values.phone_number,
                values.address
            );

            if (result.success) {
                notification.success({
                    message: 'Đăng ký thành công!',
                    description: result.message,
                    duration: 10
                });
                navigate('/login?verifyEmail=true');
            } else {
                notification.error({
                    message: 'Đăng ký không thành công',
                    description:
                        result.message ||
                        'Đã có lỗi xảy ra. Vui lòng thử lại sau!'
                });
            }
        } catch (error) {
            notification.error({
                message: 'Đăng ký không thành công',
                description:
                    error.response?.data?.message ||
                    'Đã có lỗi xảy ra. Vui lòng thử lại sau!'
            });
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
                        maxWidth: '520px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                    }}
                >
                    <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                        <Title level={2} style={{ margin: '0 0 8px 0' }}>
                            Create an Account
                        </Title>
                        <Text type='secondary'>
                            Join AuctionMaster today and start bidding!
                        </Text>
                    </div>

                    <Form
                        name='register_form'
                        onFinish={onFinish}
                        layout='vertical'
                        size='large'
                    >
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    name='first_name'
                                    rules={[
                                        {
                                            required: true,
                                            message: 'Vui lòng nhập tên!'
                                        }
                                    ]}
                                >
                                    <Input
                                        prefix={
                                            <UserOutlined className='site-form-item-icon' />
                                        }
                                        placeholder='Tên'
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    name='last_name'
                                    rules={[
                                        {
                                            required: true,
                                            message: 'Vui lòng nhập họ!'
                                        }
                                    ]}
                                >
                                    <Input
                                        prefix={
                                            <UserOutlined className='site-form-item-icon' />
                                        }
                                        placeholder='Họ'
                                    />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Form.Item
                            name='email'
                            rules={[
                                {
                                    required: true,
                                    message: 'Vui lòng nhập email!'
                                },
                                {
                                    type: 'email',
                                    message:
                                        'Vui lòng nhập một địa chỉ email hợp lệ!'
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
                            name='phone_number'
                            rules={[
                                {
                                    required: true,
                                    message: 'Vui lòng nhập số điện thoại!'
                                },
                                {
                                    pattern: /^[0-9]{10,11}$/,
                                    message:
                                        'Số điện thoại phải có 10-11 chữ số!'
                                }
                            ]}
                        >
                            <Input
                                prefix={
                                    <PhoneOutlined className='site-form-item-icon' />
                                }
                                placeholder='Số điện thoại'
                            />
                        </Form.Item>

                        <Form.Item
                            name='address'
                            rules={[
                                {
                                    required: true,
                                    message: 'Vui lòng nhập địa chỉ!'
                                }
                            ]}
                        >
                            <Input.TextArea
                                prefix={
                                    <EnvironmentOutlined className='site-form-item-icon' />
                                }
                                placeholder='Địa chỉ'
                                rows={3}
                            />
                        </Form.Item>

                        <Form.Item
                            name='password'
                            rules={[
                                {
                                    required: true,
                                    message: 'Vui lòng nhập mật khẩu!'
                                },
                                {
                                    min: 6,
                                    message: 'Mật khẩu phải có ít nhất 6 ký tự!'
                                }
                            ]}
                        >
                            <Input.Password
                                prefix={
                                    <LockOutlined className='site-form-item-icon' />
                                }
                                placeholder='Mật khẩu'
                            />
                        </Form.Item>

                        <Form.Item
                            name='confirm_password'
                            dependencies={['password']}
                            rules={[
                                {
                                    required: true,
                                    message: 'Vui lòng xác nhận mật khẩu!'
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
                                                'Mật khẩu xác nhận không khớp!'
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
                                placeholder='Xác nhận mật khẩu'
                            />
                        </Form.Item>

                        <Form.Item>
                            <Button
                                type='primary'
                                htmlType='submit'
                                block
                                loading={loading}
                            >
                                Đăng ký
                            </Button>
                        </Form.Item>

                        <div style={{ textAlign: 'center' }}>
                            <Text type='secondary'>Đã có tài khoản? </Text>
                            <Link to='/login'>Đăng nhập ngay</Link>
                        </div>
                    </Form>
                </Card>
            </div>
        </div>
    );
};

export default RegisterPage;
