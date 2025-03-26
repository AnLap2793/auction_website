import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { resetPassword } from '../../services/authService';
import { Form, Input, Button, Card, message } from 'antd';
import { LockOutlined, ArrowLeftOutlined } from '@ant-design/icons';

const ResetPassword = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [form] = Form.useForm();

    const handleSubmit = async (values) => {
        setLoading(true);
        try {
            await resetPassword(values.newPassword);
            message.success('Mật khẩu đã được đặt lại thành công');
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
                    <h2>Đặt lại mật khẩu</h2>
                    <p>Vui lòng nhập mật khẩu mới của bạn</p>
                </div>

                <Form
                    form={form}
                    name='reset-password'
                    onFinish={handleSubmit}
                    layout='vertical'
                >
                    <Form.Item
                        name='newPassword'
                        rules={[
                            {
                                required: true,
                                message: 'Vui lòng nhập mật khẩu mới!'
                            },
                            {
                                min: 6,
                                message: 'Mật khẩu phải có ít nhất 6 ký tự!'
                            }
                        ]}
                    >
                        <Input.Password
                            prefix={<LockOutlined />}
                            placeholder='Mật khẩu mới'
                            size='large'
                        />
                    </Form.Item>

                    <Form.Item
                        name='confirmPassword'
                        dependencies={['newPassword']}
                        rules={[
                            {
                                required: true,
                                message: 'Vui lòng xác nhận mật khẩu!'
                            },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (
                                        !value ||
                                        getFieldValue('newPassword') === value
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
                            prefix={<LockOutlined />}
                            placeholder='Xác nhận mật khẩu'
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
                            {loading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
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

export default ResetPassword;
