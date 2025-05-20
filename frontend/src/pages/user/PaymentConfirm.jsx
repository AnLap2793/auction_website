import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    Card,
    Typography,
    Button,
    Space,
    Descriptions,
    message,
    Result
} from 'antd';
import {
    CheckCircleOutlined,
    CloseCircleOutlined,
    DollarOutlined
} from '@ant-design/icons';
import paymentService from '../../services/paymentService';

const { Title, Text } = Typography;

const PaymentConfirm = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { transaction } = location.state || {};

    if (!transaction) {
        return (
            <Result
                status='error'
                title='Không tìm thấy thông tin thanh toán'
                extra={[
                    <Button
                        type='primary'
                        key='console'
                        onClick={() => navigate('/profile')}
                    >
                        Quay lại trang cá nhân
                    </Button>
                ]}
            />
        );
    }

    const handleConfirmPayment = async () => {
        try {
            const response = await paymentService.createPayment({
                transaction_id: transaction.id
            });

            if (response.success && response.data.paymentUrl) {
                // Chuyển hướng đến trang thanh toán VNPay
                window.location.href = response.data.paymentUrl;
            } else {
                message.error('Không thể tạo đường dẫn thanh toán');
            }
        } catch (error) {
            console.error('Lỗi khi tạo thanh toán:', error);
            message.error('Có lỗi xảy ra khi tạo thanh toán');
        }
    };

    return (
        <div
            style={{
                maxWidth: '800px',
                margin: '40px auto',
                padding: '0 20px'
            }}
        >
            <Card>
                <Result
                    icon={<DollarOutlined style={{ color: '#1890ff' }} />}
                    title='Xác nhận thanh toán'
                    subTitle='Vui lòng kiểm tra thông tin thanh toán dưới đây'
                    extra={[
                        <Button
                            type='primary'
                            key='confirm'
                            size='large'
                            onClick={handleConfirmPayment}
                        >
                            Xác nhận và thanh toán
                        </Button>,
                        <Button
                            key='back'
                            size='large'
                            onClick={() => navigate('/profile')}
                        >
                            Quay lại
                        </Button>
                    ]}
                >
                    <div style={{ marginTop: '24px', textAlign: 'left' }}>
                        <Descriptions bordered column={1}>
                            <Descriptions.Item label='Mã giao dịch'>
                                <Text copyable>
                                    {transaction.transactionCode}
                                </Text>
                            </Descriptions.Item>
                            <Descriptions.Item label='Sản phẩm'>
                                {transaction.productTitle}
                            </Descriptions.Item>
                            <Descriptions.Item label='Số tiền'>
                                <Text strong style={{ color: '#1890ff' }}>
                                    {transaction.amount.toLocaleString('vi-VN')}{' '}
                                    VNĐ
                                </Text>
                            </Descriptions.Item>
                            <Descriptions.Item label='Phương thức thanh toán'>
                                VNPAY
                            </Descriptions.Item>
                        </Descriptions>
                    </div>
                </Result>
            </Card>
        </div>
    );
};

export default PaymentConfirm;
