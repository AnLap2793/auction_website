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
    Avatar,
    Form,
    DatePicker,
    InputNumber,
    Select,
    Tooltip,
    Popconfirm
} from 'antd';
import {
    SearchOutlined,
    EditOutlined,
    DeleteOutlined,
    SaveOutlined,
    CloseCircleOutlined,
    ShoppingOutlined,
    EyeOutlined,
    UserOutlined,
    HistoryOutlined,
    FilterOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    DollarOutlined,
    TeamOutlined,
    PlusOutlined
} from '@ant-design/icons';
import moment from 'moment';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

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
    const [isEditing, setIsEditing] = useState(false);
    const [form] = Form.useForm();
    const [filters, setFilters] = useState({
        status: 'all',
        dateRange: null
    });

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
        setIsEditing(true);
        form.setFieldsValue({
            tieu_de: selectedAuction.san_pham.tieu_de,
            mo_ta: selectedAuction.san_pham.mo_ta,
            danh_muc: selectedAuction.san_pham.danh_muc,
            gia_khoi_diem: selectedAuction.gia_khoi_diem,
            buoc_gia: selectedAuction.buoc_gia,
            thoi_gian_bat_dau: moment(selectedAuction.thoi_gian_bat_dau),
            thoi_gian_ket_thuc: moment(selectedAuction.thoi_gian_ket_thuc),
            trang_thai: selectedAuction.trang_thai
        });
    };

    const handleSave = async () => {
        try {
            const values = await form.validateFields();
            console.log('Cập nhật thông tin phiên đấu giá:', values);
            // Thêm logic cập nhật thông tin phiên đấu giá ở đây
            setIsEditing(false);
        } catch (error) {
            console.error('Lỗi validation:', error);
        }
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        form.resetFields();
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

    const handleFilterChange = (type, value) => {
        setFilters((prev) => ({
            ...prev,
            [type]: value
        }));
        filterData();
    };

    const filterData = () => {
        let filteredData = [...mockData];

        // Lọc theo trạng thái
        if (filters.status !== 'all') {
            filteredData = filteredData.filter(
                (item) => item.trang_thai === filters.status
            );
        }

        // Lọc theo thời gian
        if (filters.dateRange) {
            const [start, end] = filters.dateRange;
            filteredData = filteredData.filter((item) => {
                const auctionStart = moment(item.thoi_gian_bat_dau);
                return auctionStart.isBetween(start, end, 'day', '[]');
            });
        }

        setData(filteredData);
    };

    // Cột cho bảng
    const columns = [
        {
            title: 'Sản phẩm',
            key: 'san_pham',
            fixed: 'left',
            width: 250,
            render: (_, record) => (
                <Space>
                    <Avatar size={48} icon={<ShoppingOutlined />} />
                    <Space direction='vertical' size={0}>
                        <Text strong>{record.san_pham.tieu_de}</Text>
                        <Text type='secondary'>ID: {record.san_pham.id}</Text>
                    </Space>
                </Space>
            )
        },
        {
            title: 'Người thắng',
            key: 'nguoi_thang',
            width: 200,
            render: (_, record) => (
                <Space>
                    <UserOutlined />
                    <Text>{record.nguoi_thang?.ho_ten || 'Chưa có'}</Text>
                </Space>
            )
        },
        {
            title: 'Thời gian',
            key: 'thoi_gian',
            width: 300,
            render: (_, record) => (
                <Space direction='vertical' size={0}>
                    <Text>
                        <ClockCircleOutlined /> Bắt đầu:{' '}
                        {moment(record.thoi_gian_bat_dau).format(
                            'DD/MM/YYYY HH:mm'
                        )}
                    </Text>
                    <Text>
                        <ClockCircleOutlined /> Kết thúc:{' '}
                        {moment(record.thoi_gian_ket_thuc).format(
                            'DD/MM/YYYY HH:mm'
                        )}
                    </Text>
                </Space>
            )
        },
        {
            title: 'Thông tin đấu giá',
            key: 'thong_tin',
            width: 200,
            render: (_, record) => (
                <Space direction='vertical' size={0}>
                    <Text>
                        <DollarOutlined /> Bước giá:{' '}
                        {record.buoc_gia.toLocaleString()} VNĐ
                    </Text>
                    <Text>
                        <TeamOutlined /> Lượt đăng ký: {record.so_luot_dang_ky}
                    </Text>
                </Space>
            )
        },
        {
            title: 'Trạng thái',
            key: 'trang_thai',
            width: 150,
            render: (_, record) => {
                let color, icon, text;
                switch (record.trang_thai) {
                    case 'dang_dien_ra':
                        color = 'success';
                        icon = <CheckCircleOutlined />;
                        text = 'Đang diễn ra';
                        break;
                    case 'sap_dien_ra':
                        color = 'processing';
                        icon = <ClockCircleOutlined />;
                        text = 'Sắp diễn ra';
                        break;
                    case 'da_ket_thuc':
                        color = 'default';
                        icon = <CloseCircleOutlined />;
                        text = 'Đã kết thúc';
                        break;
                    default:
                        color = 'default';
                        icon = <CloseCircleOutlined />;
                        text = 'Không xác định';
                }
                return (
                    <Tag color={color} icon={icon}>
                        {text}
                    </Tag>
                );
            }
        },
        {
            title: 'Thao tác',
            key: 'action',
            fixed: 'right',
            width: 120,
            render: (_, record) => (
                <Space>
                    <Tooltip title='Chi tiết'>
                        <Button
                            type='primary'
                            icon={<EyeOutlined />}
                            onClick={(e) => {
                                e.stopPropagation();
                                handleRowClick(record);
                            }}
                        />
                    </Tooltip>
                    <Tooltip title='Xóa'>
                        <Popconfirm
                            title='Xóa phiên đấu giá'
                            description='Bạn có chắc chắn muốn xóa phiên đấu giá này?'
                            onConfirm={(e) => {
                                e.stopPropagation();
                                handleDelete(record.id);
                            }}
                            okText='Xóa'
                            cancelText='Hủy'
                        >
                            <Button
                                danger
                                icon={<DeleteOutlined />}
                                onClick={(e) => e.stopPropagation()}
                            />
                        </Popconfirm>
                    </Tooltip>
                </Space>
            )
        }
    ];

    return (
        <div style={{ padding: '24px' }}>
            <Space direction='vertical' size='large' style={{ width: '100%' }}>
                {/* Tiêu đề và thanh tìm kiếm */}
                <Row justify='space-between' align='middle'>
                    <Col>
                        <Title level={2}>Quản lý phiên đấu giá</Title>
                    </Col>
                    <Col>
                        <Space>
                            <Input
                                placeholder='Tìm kiếm phiên đấu giá...'
                                prefix={<SearchOutlined />}
                                style={{ width: 300 }}
                                value={searchText}
                                onChange={(e) => handleSearch(e.target.value)}
                            />
                            <Button icon={<FilterOutlined />}>Lọc</Button>
                            <Button type='primary' icon={<PlusOutlined />}>
                                Thêm phiên đấu giá
                            </Button>
                        </Space>
                    </Col>
                </Row>

                {/* Thống kê */}
                <Row gutter={16}>
                    <Col span={6}>
                        <Card>
                            <Statistic
                                title='Tổng phiên đấu giá'
                                value={data.length}
                                prefix={<ShoppingOutlined />}
                            />
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card>
                            <Statistic
                                title='Đang diễn ra'
                                value={
                                    data.filter(
                                        (a) => a.trang_thai === 'dang_dien_ra'
                                    ).length
                                }
                                valueStyle={{ color: '#3f8600' }}
                                prefix={<CheckCircleOutlined />}
                            />
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card>
                            <Statistic
                                title='Sắp diễn ra'
                                value={
                                    data.filter(
                                        (a) => a.trang_thai === 'sap_dien_ra'
                                    ).length
                                }
                                valueStyle={{ color: '#1890ff' }}
                                prefix={<ClockCircleOutlined />}
                            />
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card>
                            <Statistic
                                title='Đã kết thúc'
                                value={
                                    data.filter(
                                        (a) => a.trang_thai === 'da_ket_thuc'
                                    ).length
                                }
                                valueStyle={{ color: '#cf1322' }}
                                prefix={<CloseCircleOutlined />}
                            />
                        </Card>
                    </Col>
                </Row>

                {/* Bộ lọc */}
                <Card>
                    <Space>
                        <Select
                            style={{ width: 200 }}
                            placeholder='Trạng thái'
                            defaultValue='all'
                            onChange={(value) =>
                                handleFilterChange('status', value)
                            }
                        >
                            <Option value='all'>Tất cả trạng thái</Option>
                            <Option value='dang_dien_ra'>Đang diễn ra</Option>
                            <Option value='sap_dien_ra'>Sắp diễn ra</Option>
                            <Option value='da_ket_thuc'>Đã kết thúc</Option>
                        </Select>
                        <RangePicker
                            onChange={(dates) =>
                                handleFilterChange('dateRange', dates)
                            }
                            format='DD/MM/YYYY'
                            placeholder={['Từ ngày', 'Đến ngày']}
                        />
                    </Space>
                </Card>

                {/* Bảng dữ liệu */}
                <Table
                    columns={columns}
                    dataSource={data}
                    loading={loading}
                    rowKey='id'
                    scroll={{ x: 1500 }}
                    pagination={{
                        total: data.length,
                        pageSize: 10,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total) => `Tổng ${total} phiên đấu giá`
                    }}
                />

                {/* Modal chi tiết/chỉnh sửa */}
                <Modal
                    title={
                        <Space>
                            <ShoppingOutlined />
                            <span>
                                {isEditing
                                    ? 'Chỉnh sửa phiên đấu giá'
                                    : 'Chi tiết phiên đấu giá'}
                            </span>
                        </Space>
                    }
                    open={isModalVisible}
                    onCancel={handleModalClose}
                    footer={
                        isEditing
                            ? [
                                  <Button
                                      key='cancel'
                                      onClick={handleCancelEdit}
                                  >
                                      Hủy
                                  </Button>,
                                  <Button
                                      key='save'
                                      type='primary'
                                      icon={<SaveOutlined />}
                                      onClick={handleSave}
                                  >
                                      Lưu
                                  </Button>
                              ]
                            : [
                                  <Button
                                      key='edit'
                                      type='primary'
                                      icon={<EditOutlined />}
                                      onClick={() => setIsEditing(true)}
                                  >
                                      Chỉnh sửa
                                  </Button>,
                                  <Button
                                      key='close'
                                      onClick={handleModalClose}
                                  >
                                      Đóng
                                  </Button>
                              ]
                    }
                    width={800}
                >
                    {selectedAuction && (
                        <div>
                            {isEditing ? (
                                <Form
                                    form={form}
                                    layout='vertical'
                                    initialValues={{
                                        ...selectedAuction,
                                        thoi_gian_bat_dau: moment(
                                            selectedAuction.thoi_gian_bat_dau
                                        ),
                                        thoi_gian_ket_thuc: moment(
                                            selectedAuction.thoi_gian_ket_thuc
                                        )
                                    }}
                                >
                                    <Row gutter={16}>
                                        <Col span={12}>
                                            <Form.Item
                                                name={['san_pham', 'tieu_de']}
                                                label='Tên sản phẩm'
                                                rules={[
                                                    {
                                                        required: true,
                                                        message:
                                                            'Vui lòng nhập tên sản phẩm'
                                                    }
                                                ]}
                                            >
                                                <Input />
                                            </Form.Item>
                                        </Col>
                                        <Col span={12}>
                                            <Form.Item
                                                name='buoc_gia'
                                                label='Bước giá'
                                                rules={[
                                                    {
                                                        required: true,
                                                        message:
                                                            'Vui lòng nhập bước giá'
                                                    }
                                                ]}
                                            >
                                                <InputNumber
                                                    style={{ width: '100%' }}
                                                    formatter={(value) =>
                                                        `${value}`.replace(
                                                            /\B(?=(\d{3})+(?!\d))/g,
                                                            ','
                                                        )
                                                    }
                                                    parser={(value) =>
                                                        value.replace(
                                                            /\$\s?|(,*)/g,
                                                            ''
                                                        )
                                                    }
                                                    addonAfter='VNĐ'
                                                />
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                    <Row gutter={16}>
                                        <Col span={12}>
                                            <Form.Item
                                                name='thoi_gian_bat_dau'
                                                label='Thời gian bắt đầu'
                                                rules={[
                                                    {
                                                        required: true,
                                                        message:
                                                            'Vui lòng chọn thời gian bắt đầu'
                                                    }
                                                ]}
                                            >
                                                <DatePicker
                                                    style={{ width: '100%' }}
                                                    showTime
                                                    format='DD/MM/YYYY HH:mm'
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col span={12}>
                                            <Form.Item
                                                name='thoi_gian_ket_thuc'
                                                label='Thời gian kết thúc'
                                                rules={[
                                                    {
                                                        required: true,
                                                        message:
                                                            'Vui lòng chọn thời gian kết thúc'
                                                    }
                                                ]}
                                            >
                                                <DatePicker
                                                    style={{ width: '100%' }}
                                                    showTime
                                                    format='DD/MM/YYYY HH:mm'
                                                />
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                    <Form.Item
                                        name='trang_thai'
                                        label='Trạng thái'
                                        rules={[
                                            {
                                                required: true,
                                                message:
                                                    'Vui lòng chọn trạng thái'
                                            }
                                        ]}
                                    >
                                        <Select>
                                            <Option value='dang_dien_ra'>
                                                Đang diễn ra
                                            </Option>
                                            <Option value='sap_dien_ra'>
                                                Sắp diễn ra
                                            </Option>
                                            <Option value='da_ket_thuc'>
                                                Đã kết thúc
                                            </Option>
                                        </Select>
                                    </Form.Item>
                                </Form>
                            ) : (
                                <Descriptions bordered column={2}>
                                    <Descriptions.Item
                                        label='Tên sản phẩm'
                                        span={2}
                                    >
                                        {selectedAuction.san_pham.tieu_de}
                                    </Descriptions.Item>
                                    <Descriptions.Item label='ID sản phẩm'>
                                        {selectedAuction.san_pham.id}
                                    </Descriptions.Item>
                                    <Descriptions.Item label='Bước giá'>
                                        <Text strong style={{ color: '#f50' }}>
                                            {selectedAuction.buoc_gia.toLocaleString()}{' '}
                                            VNĐ
                                        </Text>
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
                                    <Descriptions.Item label='Trạng thái'>
                                        {renderStatusTag(
                                            selectedAuction.trang_thai
                                        )}
                                    </Descriptions.Item>
                                    <Descriptions.Item label='Số lượt đăng ký'>
                                        {selectedAuction.so_luot_dang_ky}
                                    </Descriptions.Item>
                                    <Descriptions.Item
                                        label='Người thắng'
                                        span={2}
                                    >
                                        {selectedAuction.nguoi_thang ? (
                                            <Space>
                                                <UserOutlined />
                                                {
                                                    selectedAuction.nguoi_thang
                                                        .ho_ten
                                                }
                                            </Space>
                                        ) : (
                                            'Chưa có'
                                        )}
                                    </Descriptions.Item>
                                    <Descriptions.Item label='Thời gian tạo'>
                                        {moment(
                                            selectedAuction.thoi_gian_tao
                                        ).format('DD/MM/YYYY HH:mm')}
                                    </Descriptions.Item>
                                    <Descriptions.Item label='Cập nhật lần cuối'>
                                        {moment(
                                            selectedAuction.thoi_gian_cap_nhat
                                        ).format('DD/MM/YYYY HH:mm')}
                                    </Descriptions.Item>
                                </Descriptions>
                            )}
                        </div>
                    )}
                </Modal>
            </Space>
        </div>
    );
};

export default AuctionList;
