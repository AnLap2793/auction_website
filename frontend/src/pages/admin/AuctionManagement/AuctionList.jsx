import React, { useEffect, useState } from 'react';
import {
    Card,
    Row,
    Col,
    Modal,
    Typography,
    Descriptions,
    Tag,
    Table,
    Space,
    Input,
    Button,
    Image,
    Statistic,
    Divider,
    List,
    Avatar
} from 'antd';
import {
    SearchOutlined,
    EditOutlined,
    DeleteOutlined,
    ClockCircleOutlined,
    HistoryOutlined,
    ShoppingOutlined,
    EyeOutlined,
    UserOutlined
} from '@ant-design/icons';
import moment from 'moment';

const { Title, Text, Paragraph } = Typography;

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
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [selectedAuction, setSelectedAuction] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);

    // Khởi tạo dữ liệu từ mockData khi component mount
    useEffect(() => {
        setLoading(true);
        // Giả lập delay khi gọi API
        setTimeout(() => {
            setData(mockData);
            setLoading(false);
        }, 500);
    }, []);

    // Hàm tìm kiếm
    const handleSearch = (value) => {
        setSearchText(value);
        if (value.trim() === '') {
            setData(mockData);
        } else {
            const filteredData = mockData.filter((item) =>
                item.san_pham.tieu_de
                    .toLowerCase()
                    .includes(value.toLowerCase())
            );
            setData(filteredData);
        }
    };

    const handleRowClick = (auction) => {
        setSelectedAuction(auction);
        setIsModalVisible(true);
    };

    const handleModalClose = () => {
        setIsModalVisible(false);
    };

    const handleEdit = () => {
        console.log('Chỉnh sửa phiên đấu giá:', selectedAuction);
        // Thêm logic xử lý chỉnh sửa ở đây
    };

    const handleDelete = () => {
        console.log('Xóa phiên đấu giá:', selectedAuction);
        // Thêm logic xử lý xóa ở đây
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
            <h1>Danh sách phiên đấu giá</h1>
            <Space style={{ marginBottom: '16px' }}>
                <Input
                    placeholder='Tìm kiếm theo tên sản phẩm'
                    prefix={<SearchOutlined />}
                    value={searchText}
                    onChange={(e) => handleSearch(e.target.value)}
                    style={{ width: 300 }}
                />
            </Space>

            <Table
                dataSource={data}
                loading={loading}
                rowKey='id'
                onRow={(record) => ({
                    onClick: () => handleRowClick(record),
                    style: { cursor: 'pointer' }
                })}
                columns={columns}
            />

            <Modal
                title={
                    <Space>
                        <ShoppingOutlined />
                        <span>Chi tiết phiên đấu giá</span>
                    </Space>
                }
                open={isModalVisible}
                onCancel={handleModalClose}
                footer={null}
                width={800}
            >
                {selectedAuction && (
                    <div>
                        <Row gutter={[16, 16]} style={{ marginBottom: '20px' }}>
                            <Col span={24} style={{ textAlign: 'right' }}>
                                <Space>
                                    <Button
                                        type='primary'
                                        icon={<EditOutlined />}
                                        onClick={handleEdit}
                                    >
                                        Chỉnh sửa
                                    </Button>
                                    <Button
                                        type='primary'
                                        danger
                                        icon={<DeleteOutlined />}
                                        onClick={handleDelete}
                                    >
                                        Xóa
                                    </Button>
                                </Space>
                            </Col>
                        </Row>

                        <Descriptions bordered column={1}>
                            <Descriptions.Item label='Tên sản phẩm'>
                                {selectedAuction.san_pham.tieu_de}
                            </Descriptions.Item>
                            <Descriptions.Item label='Người thắng'>
                                {selectedAuction.nguoi_thang?.ho_ten ||
                                    'Chưa có'}
                            </Descriptions.Item>
                            <Descriptions.Item label='Thời gian bắt đầu'>
                                {moment(
                                    selectedAuction.thoi_gian_bat_dau
                                ).format('DD/MM/YYYY HH:mm')}
                            </Descriptions.Item>
                            <Descriptions.Item label='Thời gian kết thúc'>
                                {moment(
                                    selectedAuction.thoi_gian_ket_thuc
                                ).format('DD/MM/YYYY HH:mm')}
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
                                {moment(
                                    selectedAuction.thoi_gian_cap_nhat
                                ).format('DD/MM/YYYY HH:mm')}
                            </Descriptions.Item>
                        </Descriptions>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default AuctionList;
