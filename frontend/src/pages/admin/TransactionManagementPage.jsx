import React, { useState } from 'react';
import { Table, Typography, Tag, Modal, Descriptions } from 'antd';
import moment from 'moment';

const { Title, Text } = Typography;

// Giả lập dữ liệu từ API
const mockData = [
    {
        id: '550e8400-e29b-41d4-a716-446655440000',
        nguoi_dung: {
            id: '550e8400-e29b-41d4-a716-446655440000',
            ho_ten: 'Nguyễn Văn A'
        },
        dau_gia: {
            id: '550e8400-e29b-41d4-a716-446655440000',
            ten: 'Phiên đấu giá 1'
        },
        so_tien: 1000.0,
        trang_thai: 'thanh_cong', // Có thể là 'thanh_cong', 'that_bai', 'dang_cho'
        phuong_thuc_thanh_toan: 'VNPay',
        ma_thanh_toan: 'PAY123456',
        thoi_gian_tao: '2023-10-01T10:00:00Z',
        thoi_gian_cap_nhat: '2023-10-05T15:00:00Z'
    },
    {
        id: '550e8400-e29b-41d4-a716-446655440001',
        nguoi_dung: {
            id: '550e8400-e29b-41d4-a716-446655440001',
            ho_ten: 'Trần Thị B'
        },
        dau_gia: {
            id: '550e8400-e29b-41d4-a716-446655440001',
            ten: 'Phiên đấu giá 2'
        },
        so_tien: 2000.0,
        trang_thai: 'that_bai',
        phuong_thuc_thanh_toan: 'Momo',
        ma_thanh_toan: 'PAY654321',
        thoi_gian_tao: '2023-10-02T11:00:00Z',
        thoi_gian_cap_nhat: '2023-10-06T16:00:00Z'
    }
];

const TransactionManagementPage = () => {
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);

    const handleRowClick = (transaction) => {
        setSelectedTransaction(transaction);
        setIsModalVisible(true);
    };

    const handleModalClose = () => {
        setIsModalVisible(false);
        setSelectedTransaction(null);
    };

    // Hàm hiển thị trạng thái giao dịch
    const renderStatusTag = (status) => {
        switch (status) {
            case 'thanh_cong':
                return <Tag color='green'>Thành công</Tag>;
            case 'that_bai':
                return <Tag color='red'>Thất bại</Tag>;
            case 'dang_cho':
                return <Tag color='blue'>Đang chờ</Tag>;
            default:
                return <Tag>Không xác định</Tag>;
        }
    };

    // Cột cho bảng
    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            render: (text) => <Text strong>{text}</Text>
        },
        {
            title: 'Người dùng',
            dataIndex: ['nguoi_dung', 'ho_ten'],
            key: 'nguoi_dung'
        },
        {
            title: 'Phiên đấu giá',
            dataIndex: ['dau_gia', 'ten'],
            key: 'dau_gia'
        },
        {
            title: 'Số tiền',
            dataIndex: 'so_tien',
            key: 'so_tien',
            render: (text) => `${text.toLocaleString()} VND`
        },
        {
            title: 'Trạng thái',
            dataIndex: 'trang_thai',
            key: 'trang_thai',
            render: (text) => renderStatusTag(text)
        },
        {
            title: 'Phương thức thanh toán',
            dataIndex: 'phuong_thuc_thanh_toan',
            key: 'phuong_thuc_thanh_toan'
        },
        {
            title: 'Mã thanh toán',
            dataIndex: 'ma_thanh_toan',
            key: 'ma_thanh_toan'
        },
        {
            title: 'Thời gian tạo',
            dataIndex: 'thoi_gian_tao',
            key: 'thoi_gian_tao',
            render: (text) => moment(text).format('DD/MM/YYYY HH:mm')
        }
    ];

    return (
        <div style={{ padding: '24px' }}>
            <Title level={2}>Quản lý giao dịch</Title>
            <Table
                dataSource={mockData}
                columns={columns}
                rowKey='id'
                onRow={(record) => ({
                    onClick: () => handleRowClick(record)
                })}
                pagination={{ pageSize: 5 }}
            />

            <Modal
                title='Chi tiết giao dịch'
                open={isModalVisible}
                onCancel={handleModalClose}
                footer={null}
                width={800}
            >
                {selectedTransaction && (
                    <Descriptions bordered column={1}>
                        <Descriptions.Item label='ID'>
                            {selectedTransaction.id}
                        </Descriptions.Item>
                        <Descriptions.Item label='Người dùng'>
                            {selectedTransaction.nguoi_dung.ho_ten}
                        </Descriptions.Item>
                        <Descriptions.Item label='Phiên đấu giá'>
                            {selectedTransaction.dau_gia.ten}
                        </Descriptions.Item>
                        <Descriptions.Item label='Số tiền'>
                            {selectedTransaction.so_tien.toLocaleString()} VND
                        </Descriptions.Item>
                        <Descriptions.Item label='Trạng thái'>
                            {renderStatusTag(selectedTransaction.trang_thai)}
                        </Descriptions.Item>
                        <Descriptions.Item label='Phương thức thanh toán'>
                            {selectedTransaction.phuong_thuc_thanh_toan}
                        </Descriptions.Item>
                        <Descriptions.Item label='Mã thanh toán'>
                            {selectedTransaction.ma_thanh_toan}
                        </Descriptions.Item>
                        <Descriptions.Item label='Thời gian tạo'>
                            {moment(selectedTransaction.thoi_gian_tao).format(
                                'DD/MM/YYYY HH:mm'
                            )}
                        </Descriptions.Item>
                        <Descriptions.Item label='Thời gian cập nhật'>
                            {moment(
                                selectedTransaction.thoi_gian_cap_nhat
                            ).format('DD/MM/YYYY HH:mm')}
                        </Descriptions.Item>
                    </Descriptions>
                )}
            </Modal>
        </div>
    );
};

export default TransactionManagementPage;
