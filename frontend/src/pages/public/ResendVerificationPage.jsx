import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { MailOutlined, SendOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const { Title, Paragraph } = Typography;

const ResendVerificationPage = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const { resendVerificationEmail } = useAuth();

    // Lấy email từ localStorage nếu có
    useEffect(() => {
        const pendingEmail = localStorage.getItem('pendingVerificationEmail');
        if (pendingEmail) {
            form.setFieldsValue({ email: pendingEmail });
        }
    }, [form]);

    const onFinish = async (values) => {
        setLoading(true);
        try {
            const result = await resendVerificationEmail(values.email);

            if (result.success) {
                setSuccess(true);
                // Xóa email khỏi localStorage sau khi gửi lại xác thực thành công
                localStorage.removeItem('pendingVerificationEmail');
                message.success(
                    result.message ||
                        'Đã gửi lại email xác thực. Vui lòng kiểm tra hộp thư của bạn.'
                );
            } else {
                message.error(
                    result.message ||
                        'Không thể gửi lại email xác thực. Vui lòng thử lại sau.'
                );
            }
        } catch (error) {
            message.error('Có lỗi xảy ra. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '60vh',
                padding: '20px'
            }}
        >
            <Card style={{ width: '100%', maxWidth: '500px' }}>
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                    <Title level={2}>Gửi lại email xác thực</Title>
                    {!success ? (
                        <Paragraph>
                            Nhập địa chỉ email bạn đã đăng ký để nhận lại email
                            xác thực
                        </Paragraph>
                    ) : (
                        <Paragraph style={{ color: '#52c41a' }}>
                            Đã gửi lại email xác thực. Vui lòng kiểm tra hộp thư
                            đến của bạn (và thư mục spam nếu không tìm thấy).
                        </Paragraph>
                    )}
                </div>

                {!success ? (
                    <Form
                        form={form}
                        name='resend_verification'
                        onFinish={onFinish}
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
                                prefix={
                                    <MailOutlined className='site-form-item-icon' />
                                }
                                placeholder='Email'
                                size='large'
                            />
                        </Form.Item>

                        <Form.Item style={{ marginBottom: '10px' }}>
                            <Button
                                type='primary'
                                htmlType='submit'
                                icon={<SendOutlined />}
                                loading={loading}
                                block
                                size='large'
                            >
                                Gửi lại email xác thực
                            </Button>
                        </Form.Item>
                    </Form>
                ) : (
                    <Button type='primary' size='large' block>
                        <Link to='/login'>Đăng nhập</Link>
                    </Button>
                )}

                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                    <Button type='link'>
                        <Link to='/login'>Quay lại trang đăng nhập</Link>
                    </Button>
                </div>
            </Card>
        </div>
    );
};

export default ResendVerificationPage;
