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
    Statistic,
    Form,
    DatePicker,
    InputNumber,
    Select,
    Tooltip,
    Popconfirm,
    message
} from 'antd';
import {
    SearchOutlined,
    EditOutlined,
    DeleteOutlined,
    SaveOutlined,
    CloseCircleOutlined,
    ShoppingOutlined,
    EyeOutlined,
    FilterOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    DollarOutlined,
    TeamOutlined,
    PlusOutlined
} from '@ant-design/icons';
import moment from 'moment';
import auctionService from '../../services/auctionService';
import { getAllProducts } from '../../services/productService';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

const AuctionList = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [selectedAuction, setSelectedAuction] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
    const [createForm] = Form.useForm();
    const [form] = Form.useForm();
    const [products, setProducts] = useState([]);
    const [filters, setFilters] = useState({
        status: 'all',
        dateRange: null
    });
    const [registrations, setRegistrations] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalAuctions, setTotalAuctions] = useState(0);
    const [statistic, setStatistic] = useState({
        total: 0,
        active: 0,
        pending: 0,
        closed: 0
    });

    // Lấy dữ liệu từ API
    const fetchAuctions = async () => {
        try {
            setLoading(true);

            // Tạo filter cho admin
            const adminFilters = {
                page: currentPage,
                limit: pageSize,
                status: filters.status !== 'all' ? filters.status : undefined,
                search: searchText || undefined,
                isAdmin: true // Đánh dấu đây là truy vấn từ admin
            };

            // Xử lý bộ lọc ngày tháng
            if (filters.dateRange && filters.dateRange.length === 2) {
                adminFilters.startDate =
                    filters.dateRange[0].format('YYYY-MM-DD');
                adminFilters.endDate =
                    filters.dateRange[1].format('YYYY-MM-DD');
            }

            const response = await auctionService.getAllAuctions(adminFilters);
            setData(response.data);
            setTotalAuctions(response.metadata?.total || 0);

            // Lấy số lượt đăng ký cho mỗi phiên đấu giá
            const registrationsData = {};
            for (const auction of response.data) {
                try {
                    const regResponse =
                        await auctionService.getAuctionRegistrations(
                            auction.id
                        );
                    registrationsData[auction.id] =
                        regResponse.data.total_registrations;
                } catch (error) {
                    console.error('Lỗi khi lấy số lượt đăng ký:', error);
                    message.error(
                        error.response?.data?.message ||
                            'Không thể lấy số lượt đăng ký'
                    );
                }
            }
            setRegistrations(registrationsData);
        } catch (error) {
            message.error(
                error.response?.data?.message ||
                    'Không thể tải danh sách phiên đấu giá'
            );
        } finally {
            setLoading(false);
        }
    };

    // Thêm hàm lấy danh sách sản phẩm
    const fetchProducts = async () => {
        try {
            const response = await getAllProducts();
            setProducts(response.data);
        } catch (error) {
            console.error('Lỗi khi lấy danh sách sản phẩm:', error);
            message.error(
                error.response?.data?.message ||
                    'Không thể tải danh sách sản phẩm'
            );
        }
    };

    // Thêm useEffect để tự động cập nhật trạng thái mỗi phút
    useEffect(() => {
        const updateStatus = async () => {
            try {
                await auctionService.updateAuctionStatus();
                fetchAuctions(); // Tải lại danh sách sau khi cập nhật trạng thái
            } catch (error) {
                console.error('Lỗi khi cập nhật trạng thái:', error);
            }
        };

        // Cập nhật ngay khi component mount
        updateStatus();

        // Thiết lập interval để cập nhật mỗi phút
        const interval = setInterval(updateStatus, 60000);

        // Cleanup interval khi component unmount
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        fetchAuctions();
        fetchProducts();
    }, [currentPage, pageSize, filters.status]);

    // Hàm tìm kiếm
    const handleSearch = (value) => {
        setSearchText(value);
        setCurrentPage(1); // Reset về trang đầu tiên khi tìm kiếm

        // Không cần lọc dữ liệu local, để API xử lý việc tìm kiếm
        fetchAuctions();
    };

    const handleRowClick = (auction) => {
        setSelectedAuction(auction);
        setIsModalVisible(true);
    };

    const handleModalClose = () => {
        setIsModalVisible(false);
        setIsEditing(false);
        form.resetFields();
    };

    const handleEdit = () => {
        setIsEditing(true);
        if (selectedAuction) {
            form.setFieldsValue({
                product_id: selectedAuction.product_id,
                start_time: moment(selectedAuction.start_time),
                end_time: moment(selectedAuction.end_time),
                bid_increment: selectedAuction.bid_increment,
                status: selectedAuction.status
            });
        }
    };

    const handleSave = async () => {
        try {
            const values = await form.validateFields();
            const updateData = {
                product_id: values.product_id,
                bid_increment: values.bid_increment,
                start_time: values.start_time.toISOString(),
                end_time: values.end_time.toISOString(),
                status: values.status
            };

            await auctionService.updateAuction(selectedAuction.id, updateData);
            message.success('Cập nhật phiên đấu giá thành công');
            setIsEditing(false);
            fetchAuctions();
        } catch (error) {
            console.error('Lỗi khi cập nhật:', error);
            message.error(
                error.response?.data?.message ||
                    'Không thể cập nhật phiên đấu giá'
            );
        }
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        form.resetFields();
    };

    const handleCancel = async (id) => {
        try {
            await auctionService.cancelAuction(id);
            message.success('Hoãn phiên đấu giá thành công');
            fetchAuctions();
        } catch (error) {
            message.error(
                error.response?.data?.message || 'Không thể hoãn phiên đấu giá'
            );
        }
    };

    const handleDelete = async (id) => {
        try {
            await auctionService.deleteAuction(id);
            message.success('Xóa phiên đấu giá thành công');
            fetchAuctions();
        } catch (error) {
            message.error(
                error.response?.data?.message || 'Không thể xóa phiên đấu giá'
            );
        }
    };

    // Hàm hiển thị trạng thái phiên đấu giá
    const renderStatusTag = (status) => {
        switch (status) {
            case 'active':
                return <Tag color='green'>Đang diễn ra</Tag>;
            case 'pending':
                return <Tag color='blue'>Sắp diễn ra</Tag>;
            case 'closed':
                return <Tag color='red'>Đã kết thúc</Tag>;
            case 'canceled':
                return <Tag color='orange'>Tạm hoãn</Tag>;
            default:
                return <Tag color='red'>Đã kết thúc</Tag>;
        }
    };

    // Hàm lọc
    const handleFilterChange = (type, value) => {
        setCurrentPage(1); // Reset về trang đầu tiên khi thay đổi bộ lọc

        if (type === 'status') {
            setFilters({ ...filters, status: value });
        } else if (type === 'dateRange') {
            setFilters({ ...filters, dateRange: value });
        }
    };

    const handleCreate = () => {
        setIsCreateModalVisible(true);
        createForm.resetFields();
    };

    const handleCreateSubmit = async () => {
        try {
            const values = await createForm.validateFields();
            const createData = {
                product_id: values.product_id,
                bid_increment: values.bid_increment,
                start_time: values.start_time.toISOString(),
                end_time: values.end_time.toISOString(),
                status: 'pending'
            };

            await auctionService.createAuction(createData);
            message.success('Tạo phiên đấu giá thành công');
            setIsCreateModalVisible(false);
            fetchAuctions();
        } catch (error) {
            console.error('Lỗi khi tạo phiên đấu giá:', error);
            message.error(
                error.response?.data?.message || 'Không thể tạo phiên đấu giá'
            );
        }
    };

    const handleCreateCancel = () => {
        setIsCreateModalVisible(false);
        createForm.resetFields();
    };

    const handlePageChange = (page, pageSize) => {
        setCurrentPage(page);
        setPageSize(pageSize);
    };

    // Hàm lấy thống kê
    const fetchStatistic = async () => {
        try {
            // Lấy tổng số phiên đấu giá mà không phân trang
            const response = await auctionService.getAllAuctions({
                isAdmin: true,
                limit: 1,
                page: 1
            });

            // Lấy số lượng theo từng trạng thái
            const activeResponse = await auctionService.getAllAuctions({
                isAdmin: true,
                status: 'active',
                limit: 1,
                page: 1
            });

            const pendingResponse = await auctionService.getAllAuctions({
                isAdmin: true,
                status: 'pending',
                limit: 1,
                page: 1
            });

            const closedResponse = await auctionService.getAllAuctions({
                isAdmin: true,
                status: 'closed',
                limit: 1,
                page: 1
            });

            setStatistic({
                total: response.metadata?.total || 0,
                active: activeResponse.metadata?.total || 0,
                pending: pendingResponse.metadata?.total || 0,
                closed: closedResponse.metadata?.total || 0
            });
        } catch (error) {
            console.error('Lỗi khi lấy thống kê:', error);
        }
    };

    useEffect(() => {
        fetchStatistic();
    }, []);

    // Cột cho bảng
    const columns = [
        {
            title: 'Sản phẩm',
            key: 'product',
            fixed: 'left',
            width: 250,
            render: (_, record) => (
                <Space direction='vertical' size={0}>
                    <Text strong>{record.Product.title}</Text>
                    <Text type='secondary'>ID: {record.product_id}</Text>
                </Space>
            )
        },
        {
            title: 'Thời gian',
            key: 'time',
            width: 300,
            render: (_, record) => (
                <Space direction='vertical' size={0}>
                    <Text>
                        <ClockCircleOutlined /> Bắt đầu:{' '}
                        {moment(record.start_time).format('DD/MM/YYYY HH:mm')}
                    </Text>
                    <Text>
                        <ClockCircleOutlined /> Kết thúc:{' '}
                        {moment(record.end_time).format('DD/MM/YYYY HH:mm')}
                    </Text>
                </Space>
            )
        },
        {
            title: 'Thông tin đấu giá',
            key: 'info',
            width: 200,
            render: (_, record) => (
                <Space direction='vertical' size={0}>
                    <Text>
                        <DollarOutlined /> Bước giá:{' '}
                        {Number(record.bid_increment).toLocaleString()} VNĐ
                    </Text>
                    <Text>
                        <TeamOutlined /> Lượt đăng ký:{' '}
                        {registrations[record.id] || 0}
                    </Text>
                </Space>
            )
        },
        {
            title: 'Trạng thái',
            key: 'status',
            width: 150,
            render: (_, record) => {
                let color, icon, text;
                switch (record.status) {
                    case 'active':
                        color = 'success';
                        icon = <CheckCircleOutlined />;
                        text = 'Đang diễn ra';
                        break;
                    case 'pending':
                        color = 'processing';
                        icon = <ClockCircleOutlined />;
                        text = 'Sắp diễn ra';
                        break;
                    case 'closed':
                        color = 'default';
                        icon = <CloseCircleOutlined />;
                        text = 'Đã kết thúc';
                        break;
                    case 'canceled':
                        color = 'default';
                        icon = <ClockCircleOutlined />;
                        text = 'Tạm hoãn';
                        break;
                    default:
                        color = 'default';
                        icon = <CloseCircleOutlined />;
                        text = 'Đã kết thúc';
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
                    {record.status === 'pending' && (
                        <Tooltip title='Hoãn'>
                            <Popconfirm
                                title='Hoãn phiên đấu giá'
                                description='Bạn có chắc chắn muốn hoãn phiên đấu giá này?'
                                onConfirm={(e) => {
                                    e.stopPropagation();
                                    handleCancel(record.id);
                                }}
                                okText='Hoãn'
                                cancelText='Bỏ'
                            >
                                <Button
                                    danger
                                    icon={<DeleteOutlined />}
                                    onClick={(e) => e.stopPropagation()}
                                />
                            </Popconfirm>
                        </Tooltip>
                    )}
                    {record.status === 'closed' && (
                        <Tooltip title='Xóa'>
                            <Popconfirm
                                title='Xóa phiên đấu giá'
                                description='Bạn có chắc chắn muốn xóa phiên đấu giá này?'
                                onConfirm={(e) => {
                                    e.stopPropagation();
                                    handleDelete(record.id);
                                }}
                                okText='Xóa'
                                cancelText='Bỏ'
                            >
                                <Button
                                    danger
                                    icon={<DeleteOutlined />}
                                    onClick={(e) => e.stopPropagation()}
                                />
                            </Popconfirm>
                        </Tooltip>
                    )}
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
                            <Button
                                type='primary'
                                icon={<PlusOutlined />}
                                onClick={handleCreate}
                            >
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
                                value={statistic.total}
                                prefix={<ShoppingOutlined />}
                            />
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card>
                            <Statistic
                                title='Đang diễn ra'
                                value={statistic.active}
                                valueStyle={{ color: '#3f8600' }}
                                prefix={<CheckCircleOutlined />}
                            />
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card>
                            <Statistic
                                title='Sắp diễn ra'
                                value={statistic.pending}
                                valueStyle={{ color: '#1890ff' }}
                                prefix={<ClockCircleOutlined />}
                            />
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card>
                            <Statistic
                                title='Đã kết thúc'
                                value={statistic.closed}
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
                            <Option value='active'>Đang diễn ra</Option>
                            <Option value='pending'>Sắp diễn ra</Option>
                            <Option value='closed'>Đã kết thúc</Option>
                            <Option value='canceled'>Tạm hoãn</Option>
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
                        current: currentPage,
                        pageSize: pageSize,
                        total: totalAuctions,
                        onChange: handlePageChange,
                        showSizeChanger: true,
                        onShowSizeChange: handlePageChange,
                        pageSizeOptions: ['10', '20', '50', '100'],
                        showQuickJumper: true,
                        showTotal: (total) => `Tổng ${total} phiên đấu giá`
                    }}
                />
            </Space>

            {/* Modal chi tiết phiên đấu giá */}
            <Modal
                title='Chi tiết phiên đấu giá'
                open={isModalVisible}
                onCancel={handleModalClose}
                footer={null}
                width={800}
            >
                {selectedAuction && (
                    <>
                        {isEditing ? (
                            <Form form={form} layout='vertical'>
                                <Form.Item
                                    name='product_id'
                                    label='Sản phẩm'
                                    rules={[
                                        {
                                            required: true,
                                            message: 'Vui lòng chọn sản phẩm'
                                        }
                                    ]}
                                >
                                    <Select placeholder='Chọn sản phẩm'>
                                        {products.map((product) => (
                                            <Option
                                                key={product.id}
                                                value={product.id}
                                            >
                                                {product.title}
                                            </Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                                <Form.Item
                                    name='bid_increment'
                                    label='Bước giá'
                                    rules={[
                                        {
                                            required: true,
                                            message: 'Vui lòng nhập bước giá'
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
                                            value.replace(/\$\s?|(,*)/g, '')
                                        }
                                        placeholder='Nhập bước giá'
                                    />
                                </Form.Item>
                                <Row gutter={16}>
                                    <Col span={12}>
                                        <Form.Item
                                            name='start_time'
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
                                                showTime
                                                format='DD/MM/YYYY HH:mm'
                                                style={{ width: '100%' }}
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item
                                            name='end_time'
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
                                                showTime
                                                format='DD/MM/YYYY HH:mm'
                                                style={{ width: '100%' }}
                                            />
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Form.Item name='status' label='Trạng thái'>
                                    <Select>
                                        <Option value='pending'>
                                            Sắp diễn ra
                                        </Option>
                                        <Option value='active'>
                                            Đang diễn ra
                                        </Option>
                                        <Option value='closed'>
                                            Đã kết thúc
                                        </Option>
                                        <Option value='canceled'>
                                            Tạm hoãn
                                        </Option>
                                    </Select>
                                </Form.Item>
                                <Row justify='end'>
                                    <Space>
                                        <Button onClick={handleCancelEdit}>
                                            Hủy
                                        </Button>
                                        <Button
                                            type='primary'
                                            onClick={handleSave}
                                        >
                                            Lưu
                                        </Button>
                                    </Space>
                                </Row>
                            </Form>
                        ) : (
                            <>
                                <Descriptions
                                    bordered
                                    column={2}
                                    style={{ marginBottom: '16px' }}
                                >
                                    <Descriptions.Item label='ID' span={2}>
                                        {selectedAuction.id}
                                    </Descriptions.Item>
                                    <Descriptions.Item
                                        label='Sản phẩm'
                                        span={2}
                                    >
                                        {selectedAuction.Product.title}
                                    </Descriptions.Item>
                                    <Descriptions.Item
                                        label='Mô tả sản phẩm'
                                        span={2}
                                    >
                                        {selectedAuction.Product.description}
                                    </Descriptions.Item>
                                    <Descriptions.Item label='Thời gian bắt đầu'>
                                        {moment(
                                            selectedAuction.start_time
                                        ).format('DD/MM/YYYY HH:mm')}
                                    </Descriptions.Item>
                                    <Descriptions.Item label='Thời gian kết thúc'>
                                        {moment(
                                            selectedAuction.end_time
                                        ).format('DD/MM/YYYY HH:mm')}
                                    </Descriptions.Item>
                                    <Descriptions.Item label='Giá khởi điểm'>
                                        {Number(
                                            selectedAuction.Product
                                                .starting_price
                                        ).toLocaleString()}{' '}
                                        VNĐ
                                    </Descriptions.Item>
                                    <Descriptions.Item label='Bước giá'>
                                        {Number(
                                            selectedAuction.bid_increment
                                        ).toLocaleString()}{' '}
                                        VNĐ
                                    </Descriptions.Item>
                                    <Descriptions.Item label='Trạng thái'>
                                        {renderStatusTag(
                                            selectedAuction.status
                                        )}
                                    </Descriptions.Item>
                                    <Descriptions.Item label='Số lượt đăng ký'>
                                        {registrations[selectedAuction.id] || 0}
                                    </Descriptions.Item>
                                </Descriptions>
                                <Row justify='end'>
                                    <Space>
                                        <Button onClick={handleModalClose}>
                                            Đóng
                                        </Button>
                                        {selectedAuction.status ===
                                            'pending' && (
                                            <>
                                                <Button
                                                    type='primary'
                                                    onClick={handleEdit}
                                                >
                                                    <EditOutlined /> Chỉnh sửa
                                                </Button>
                                                <Popconfirm
                                                    title='Hoãn phiên đấu giá'
                                                    description='Bạn có chắc chắn muốn hoãn phiên đấu giá này?'
                                                    onConfirm={() =>
                                                        handleCancel(
                                                            selectedAuction.id
                                                        )
                                                    }
                                                    okText='Hoãn'
                                                    cancelText='Bỏ'
                                                >
                                                    <Button danger>
                                                        <DeleteOutlined /> Hoãn
                                                    </Button>
                                                </Popconfirm>
                                            </>
                                        )}
                                        {selectedAuction.status ===
                                            'closed' && (
                                            <Popconfirm
                                                title='Xóa phiên đấu giá'
                                                description='Bạn có chắc chắn muốn xóa phiên đấu giá này?'
                                                onConfirm={() =>
                                                    handleDelete(
                                                        selectedAuction.id
                                                    )
                                                }
                                                okText='Xóa'
                                                cancelText='Bỏ'
                                            >
                                                <Button danger>
                                                    <DeleteOutlined /> Xóa
                                                </Button>
                                            </Popconfirm>
                                        )}
                                    </Space>
                                </Row>
                            </>
                        )}
                    </>
                )}
            </Modal>

            {/* Modal tạo phiên đấu giá mới */}
            <Modal
                title='Tạo phiên đấu giá mới'
                open={isCreateModalVisible}
                onCancel={handleCreateCancel}
                footer={null}
                width={600}
            >
                <Form form={createForm} layout='vertical'>
                    <Form.Item
                        name='product_id'
                        label='Sản phẩm'
                        rules={[
                            {
                                required: true,
                                message: 'Vui lòng chọn sản phẩm'
                            }
                        ]}
                    >
                        <Select placeholder='Chọn sản phẩm'>
                            {products.map((product) => (
                                <Option key={product.id} value={product.id}>
                                    {product.title}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item
                        name='bid_increment'
                        label='Bước giá'
                        rules={[
                            {
                                required: true,
                                message: 'Vui lòng nhập bước giá'
                            }
                        ]}
                    >
                        <InputNumber
                            style={{ width: '100%' }}
                            formatter={(value) =>
                                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                            }
                            parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                            placeholder='Nhập bước giá'
                        />
                    </Form.Item>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name='start_time'
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
                                    showTime
                                    format='DD/MM/YYYY HH:mm'
                                    style={{ width: '100%' }}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name='end_time'
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
                                    showTime
                                    format='DD/MM/YYYY HH:mm'
                                    style={{ width: '100%' }}
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row justify='end'>
                        <Space>
                            <Button onClick={handleCreateCancel}>Hủy</Button>
                            <Button type='primary' onClick={handleCreateSubmit}>
                                Tạo mới
                            </Button>
                        </Space>
                    </Row>
                </Form>
            </Modal>
        </div>
    );
};

export default AuctionList;
