import React, { useState } from 'react';
import { forgotPassword } from '../../services/authService';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, message } from 'antd';
import { MailOutlined, ArrowLeftOutlined } from '@ant-design/icons';

const ForgotPassword = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [form] = Form.useForm();

    const handleSubmit = async (values) => {
        setLoading(true);
        try {
            await forgotPassword(values.email);
            message.success(
                'Vui lòng kiểm tra email của bạn để đặt lại mật khẩu'
            );
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err) {
            message.error(err.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px' }}>
            <Card>
                <div>
                    <h2>Quên mật khẩu</h2>
                    <p>Nhập email của bạn để nhận hướng dẫn đặt lại mật khẩu</p>
                </div>

                <Form
                    form={form}
                    name='forgot-password'
                    onFinish={handleSubmit}
                    layout='vertical'
                >
                    <Form.Item
                        name='email'
                        rules={[
                            {
                                required: true,
                                message: 'Vui lòng nhập email của bạn!'
                            },
                            {
                                type: 'email',
                                message: 'Email không hợp lệ!'
                            }
                        ]}
                    >
                        <Input
                            prefix={<MailOutlined />}
                            placeholder='Email'
                            size='large'
                        />
                    </Form.Item>

                    <Form.Item>
                        <Button
                            type='primary'
                            htmlType='submit'
                            loading={loading}
                            block
                            size='large'
                        >
                            {loading ? 'Đang gửi...' : 'Gửi yêu cầu'}
                        </Button>
                    </Form.Item>

                    <div>
                        <Button
                            type='link'
                            icon={<ArrowLeftOutlined />}
                            onClick={() => navigate('/login')}
                        >
                            Quay lại đăng nhập
                        </Button>
                    </div>
                </Form>
            </Card>
        </div>
    );
};

export default ForgotPassword;
