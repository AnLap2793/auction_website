import React, { useState } from 'react';
import {
    Card,
    Row,
    Col,
    Modal,
    Typography,
    Descriptions,
    Tag,
    Table
} from 'antd';
import moment from 'moment';

const { Title, Text } = Typography;

// Giả lập dữ liệu từ API
const mockData = [
    {
        id: '550e8400-e29b-41d4-a716-446655440000',
        san_pham: {
            id: '550e8400-e29b-41d4-a716-446655440000',
            tieu_de: 'Sản phẩm 1'
        },
        nguoi_thang: {
            id: '550e8400-e29b-41d4-a716-446655440000',
            ho_ten: 'Nguyễn Văn A'
        },
        thoi_gian_bat_dau: '2023-10-10T10:00:00Z',
        thoi_gian_ket_thuc: '2023-10-10T12:00:00Z',
        buoc_gia: 1.0,
        so_luot_dang_ky: 10,
        trang_thai: 'dang_dien_ra', // Có thể là 'dang_dien_ra', 'sap_dien_ra', 'da_ket_thuc'
        thoi_gian_tao: '2023-10-01T10:00:00Z',
        thoi_gian_cap_nhat: '2023-10-05T15:00:00Z'
    },
    {
        id: '550e8400-e29b-41d4-a716-446655440001',
        san_pham: {
            id: '550e8400-e29b-41d4-a716-446655440001',
            tieu_de: 'Sản phẩm 2'
        },
        nguoi_thang: null, // Chưa có người thắng
        thoi_gian_bat_dau: '2023-10-11T10:00:00Z',
        thoi_gian_ket_thuc: '2023-10-11T12:00:00Z',
        buoc_gia: 2.0,
        so_luot_dang_ky: 5,
        trang_thai: 'sap_dien_ra',
        thoi_gian_tao: '2023-10-02T11:00:00Z',
        thoi_gian_cap_nhat: '2023-10-06T16:00:00Z'
    }
];

const AuctionList = () => {
    const [selectedAuction, setSelectedAuction] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);

    const handleRowClick = (auction) => {
        setSelectedAuction(auction);
        setIsModalVisible(true);
    };

    const handleModalClose = () => {
        setIsModalVisible(false);
        setSelectedAuction(null);
    };

    // Hàm hiển thị trạng thái phiên đấu giá
    const renderStatusTag = (status) => {
        switch (status) {
            case 'dang_dien_ra':
                return <Tag color='green'>Đang diễn ra</Tag>;
            case 'sap_dien_ra':
                return <Tag color='blue'>Sắp diễn ra</Tag>;
            case 'da_ket_thuc':
                return <Tag color='red'>Đã kết thúc</Tag>;
            default:
                return <Tag>Không xác định</Tag>;
        }
    };

    // Cột cho bảng
    const columns = [
        {
            title: 'Tên sản phẩm',
            dataIndex: ['san_pham', 'tieu_de'],
            key: 'san_pham'
        },
        {
            title: 'Người thắng',
            dataIndex: ['nguoi_thang', 'ho_ten'],
            key: 'nguoi_thang',
            render: (text) => text || 'Chưa có'
        },
        {
            title: 'Thời gian bắt đầu',
            dataIndex: 'thoi_gian_bat_dau',
            key: 'thoi_gian_bat_dau',
            render: (text) => moment(text).format('DD/MM/YYYY HH:mm')
        },
        {
            title: 'Thời gian kết thúc',
            dataIndex: 'thoi_gian_ket_thuc',
            key: 'thoi_gian_ket_thuc',
            render: (text) => moment(text).format('DD/MM/YYYY HH:mm')
        },
        {
            title: 'Bước giá',
            dataIndex: 'buoc_gia',
            key: 'buoc_gia',
            render: (text) => `${text.toLocaleString()} VND`
        },
        {
            title: 'Số lượt đăng ký',
            dataIndex: 'so_luot_dang_ky',
            key: 'so_luot_dang_ky'
        },
        {
            title: 'Trạng thái',
            dataIndex: 'trang_thai',
            key: 'trang_thai',
            render: (text) => renderStatusTag(text)
        }
    ];

    return (
        <div style={{ padding: '24px' }}>
            <Title level={2}>Danh sách phiên đấu giá</Title>
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
                title='Chi tiết phiên đấu giá'
                open={isModalVisible}
                onCancel={handleModalClose}
                footer={null}
                width={800}
            >
                {selectedAuction && (
                    <Descriptions bordered column={1}>
                        <Descriptions.Item label='Tên sản phẩm'>
                            {selectedAuction.san_pham.tieu_de}
                        </Descriptions.Item>
                        <Descriptions.Item label='Người thắng'>
                            {selectedAuction.nguoi_thang?.ho_ten || 'Chưa có'}
                        </Descriptions.Item>
                        <Descriptions.Item label='Thời gian bắt đầu'>
                            {moment(selectedAuction.thoi_gian_bat_dau).format(
                                'DD/MM/YYYY HH:mm'
                            )}
                        </Descriptions.Item>
                        <Descriptions.Item label='Thời gian kết thúc'>
                            {moment(selectedAuction.thoi_gian_ket_thuc).format(
                                'DD/MM/YYYY HH:mm'
                            )}
                        </Descriptions.Item>
                        <Descriptions.Item label='Bước giá'>
                            {selectedAuction.buoc_gia.toLocaleString()} VND
                        </Descriptions.Item>
                        <Descriptions.Item label='Số lượt đăng ký'>
                            {selectedAuction.so_luot_dang_ky}
                        </Descriptions.Item>
                        <Descriptions.Item label='Trạng thái'>
                            {renderStatusTag(selectedAuction.trang_thai)}
                        </Descriptions.Item>
                        <Descriptions.Item label='Thời gian tạo'>
                            {moment(selectedAuction.thoi_gian_tao).format(
                                'DD/MM/YYYY HH:mm'
                            )}
                        </Descriptions.Item>
                        <Descriptions.Item label='Thời gian cập nhật'>
                            {moment(selectedAuction.thoi_gian_cap_nhat).format(
                                'DD/MM/YYYY HH:mm'
                            )}
                        </Descriptions.Item>
                    </Descriptions>
                )}
            </Modal>
        </div>
    );
};

export default AuctionList;
