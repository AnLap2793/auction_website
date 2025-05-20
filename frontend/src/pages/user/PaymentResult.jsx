import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    Card,
    Typography,
    Button,
    Space,
    Result,
    Descriptions,
    Spin,
    message
} from 'antd';
import {
    CheckCircleOutlined,
    CloseCircleOutlined,
    LoadingOutlined
} from '@ant-design/icons';
import paymentService from '../../services/paymentService';

const { Title, Text } = Typography;

const PaymentResult = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [transaction, setTransaction] = useState(null);

    // Lấy status và transactionId từ query params
    const queryParams = new URLSearchParams(location.search);
    const status = queryParams.get('status');
    const transactionId = queryParams.get('transactionId');

    useEffect(() => {
        fetchTransactionDetails();
    }, []);

    const fetchTransactionDetails = async () => {
        try {
            if (!transactionId) {
                message.error('Không tìm thấy thông tin giao dịch');
                return;
            }

            const response = await paymentService.getTransactionStatus(
                transactionId
            );
            if (response.success) {
                setTransaction(response.data);
            } else {
                message.error('Không thể tải thông tin giao dịch');
            }
        } catch (error) {
            console.error('Lỗi khi tải thông tin giao dịch:', error);
            message.error('Có lỗi xảy ra khi tải thông tin giao dịch');
        } finally {
            setLoading(false);
        }
    };

    const getPaymentStatus = (status) => {
        switch (status) {
            case 'completed':
                return {
                    status: 'success',
                    title: 'Thanh toán thành công!',
                    icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
                    message:
                        'Cảm ơn bạn đã thanh toán. Giao dịch đã được xác nhận.'
                };
            case 'failed':
                return {
                    status: 'error',
                    title: 'Thanh toán thất bại!',
                    icon: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />,
                    message:
                        'Rất tiếc, giao dịch không thành công. Vui lòng thử lại.'
                };
            default:
                return {
                    status: 'info',
                    title: 'Đang xử lý thanh toán',
                    icon: <LoadingOutlined style={{ color: '#1890ff' }} />,
                    message:
                        'Giao dịch đang được xử lý. Vui lòng chờ trong giây lát.'
                };
        }
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <Spin size='large' />
                <div style={{ marginTop: '20px' }}>
                    <Text>Đang tải thông tin giao dịch...</Text>
                </div>
            </div>
        );
    }

    const paymentResult = getPaymentStatus(status);

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
                    status={paymentResult.status}
                    title={paymentResult.title}
                    icon={paymentResult.icon}
                    subTitle={paymentResult.message}
                    extra={[
                        <Button
                            type='primary'
                            key='profile'
                            onClick={() => navigate('/profile')}
                        >
                            Xem lịch sử giao dịch
                        </Button>,
                        <Button key='home' onClick={() => navigate('/')}>
                            Về trang chủ
                        </Button>
                    ]}
                >
                    {transaction && (
                        <div style={{ marginTop: '24px', textAlign: 'left' }}>
                            <Title level={4}>Chi tiết giao dịch</Title>
                            <Descriptions bordered column={1}>
                                <Descriptions.Item label='Mã giao dịch'>
                                    {transaction.transactionCode}
                                </Descriptions.Item>
                                <Descriptions.Item label='Số tiền'>
                                    {Number(transaction.amount).toLocaleString(
                                        'vi-VN'
                                    )}{' '}
                                    VNĐ
                                </Descriptions.Item>
                                <Descriptions.Item label='Phương thức thanh toán'>
                                    {transaction.paymentMethod.toUpperCase()}
                                </Descriptions.Item>
                                <Descriptions.Item label='Thời gian'>
                                    {new Date(
                                        transaction.createdAt
                                    ).toLocaleString('vi-VN')}
                                </Descriptions.Item>
                                <Descriptions.Item label='Trạng thái'>
                                    <Text
                                        type={
                                            status === 'completed'
                                                ? 'success'
                                                : status === 'failed'
                                                ? 'danger'
                                                : 'warning'
                                        }
                                        strong
                                    >
                                        {status === 'completed'
                                            ? 'Thành công'
                                            : status === 'failed'
                                            ? 'Thất bại'
                                            : 'Đang xử lý'}
                                    </Text>
                                </Descriptions.Item>
                            </Descriptions>
                        </div>
                    )}
                </Result>
            </Card>
        </div>
    );
};

export default PaymentResult;
