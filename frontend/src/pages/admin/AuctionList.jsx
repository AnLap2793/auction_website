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

    // Lấy dữ liệu từ API
    const fetchAuctions = async () => {
        try {
            setLoading(true);
            const response = await auctionService.getAllAuctions();
            setData(response.data);

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
    }, []);

    // Hàm tìm kiếm
    const handleSearch = (value) => {
        setSearchText(value);
        if (value.trim() === '') {
            fetchAuctions();
        } else {
            const filteredData = data.filter((item) =>
                item.Product?.title?.toLowerCase().includes(value.toLowerCase())
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

    const handleFilterChange = (type, value) => {
        setFilters((prev) => ({
            ...prev,
            [type]: value
        }));
        filterData();
    };

    const filterData = () => {
        let filteredData = [...data];

        // Lọc theo trạng thái
        if (filters.status !== 'all') {
            filteredData = filteredData.filter(
                (item) => item.status === filters.status
            );
        }

        // Lọc theo thời gian
        if (filters.dateRange) {
            const [start, end] = filters.dateRange;
            filteredData = filteredData.filter((item) => {
                const auctionStart = moment(item.start_time);
                return auctionStart.isBetween(start, end, 'day', '[]');
            });
        }

        setData(filteredData);
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
                                    data.filter((a) => a.status === 'active')
                                        .length
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
                                    data.filter((a) => a.status === 'pending')
                                        .length
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
                                    data.filter((a) => a.status === 'closed')
                                        .length
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
                                      onClick={handleEdit}
                                      //   disabled={
                                      //       selectedAuction?.status === 'active'
                                      //   }
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
                                        product_id: selectedAuction.product_id,
                                        start_time: moment(
                                            selectedAuction.start_time
                                        ),
                                        end_time: moment(
                                            selectedAuction.end_time
                                        ),
                                        bid_increment:
                                            selectedAuction.bid_increment,
                                        status: selectedAuction.status
                                    }}
                                >
                                    <Form.Item
                                        name='product_id'
                                        label='ID Sản phẩm'
                                        rules={[
                                            {
                                                required: true,
                                                message:
                                                    'Vui lòng nhập ID sản phẩm'
                                            }
                                        ]}
                                    >
                                        <Input disabled />
                                    </Form.Item>
                                    <Form.Item
                                        name='bid_increment'
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
                                                value.replace(/\$\s?|(,*)/g, '')
                                            }
                                            addonAfter='VNĐ'
                                        />
                                    </Form.Item>
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
                                            style={{ width: '100%' }}
                                            showTime
                                            format='DD/MM/YYYY HH:mm'
                                        />
                                    </Form.Item>
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
                                            style={{ width: '100%' }}
                                            showTime
                                            format='DD/MM/YYYY HH:mm'
                                        />
                                    </Form.Item>
                                    <Form.Item
                                        name='status'
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
                                </Form>
                            ) : (
                                <Descriptions bordered column={2}>
                                    <Descriptions.Item
                                        label='Tên sản phẩm'
                                        span={2}
                                    >
                                        {selectedAuction.Product.title}
                                    </Descriptions.Item>
                                    <Descriptions.Item label='ID sản phẩm'>
                                        {selectedAuction.product_id}
                                    </Descriptions.Item>
                                    <Descriptions.Item label='Bước giá'>
                                        <Text strong style={{ color: '#f50' }}>
                                            {Number(
                                                selectedAuction.bid_increment
                                            ).toLocaleString()}{' '}
                                            VNĐ
                                        </Text>
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
                                    <Descriptions.Item label='Trạng thái'>
                                        {renderStatusTag(
                                            selectedAuction.status
                                        )}
                                    </Descriptions.Item>
                                </Descriptions>
                            )}
                        </div>
                    )}
                </Modal>

                {/* Modal tạo phiên đấu giá mới */}
                <Modal
                    title={
                        <Space>
                            <PlusOutlined />
                            <span>Tạo phiên đấu giá mới</span>
                        </Space>
                    }
                    open={isCreateModalVisible}
                    onCancel={handleCreateCancel}
                    footer={[
                        <Button key='cancel' onClick={handleCreateCancel}>
                            Hủy
                        </Button>,
                        <Button
                            key='create'
                            type='primary'
                            icon={<PlusOutlined />}
                            onClick={handleCreateSubmit}
                        >
                            Tạo
                        </Button>
                    ]}
                    width={800}
                >
                    <Form form={createForm} layout='vertical'>
                        <Form.Item
                            name='product_id'
                            label='Chọn sản phẩm'
                            rules={[
                                {
                                    required: true,
                                    message: 'Vui lòng chọn sản phẩm'
                                }
                            ]}
                        >
                            <Select
                                showSearch
                                placeholder='Chọn sản phẩm'
                                optionFilterProp='children'
                                filterOption={(input, option) =>
                                    (option?.label ?? '')
                                        .toLowerCase()
                                        .includes(input.toLowerCase())
                                }
                            >
                                {products.map((product) => (
                                    <Option
                                        key={product.id}
                                        value={product.id}
                                        label={product.title}
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
                                addonAfter='VNĐ'
                            />
                        </Form.Item>
                        <Form.Item
                            name='start_time'
                            label='Thời gian bắt đầu'
                            rules={[
                                {
                                    required: true,
                                    message: 'Vui lòng chọn thời gian bắt đầu'
                                }
                            ]}
                        >
                            <DatePicker
                                style={{ width: '100%' }}
                                showTime
                                format='DD/MM/YYYY HH:mm'
                            />
                        </Form.Item>
                        <Form.Item
                            name='end_time'
                            label='Thời gian kết thúc'
                            rules={[
                                {
                                    required: true,
                                    message: 'Vui lòng chọn thời gian kết thúc'
                                }
                            ]}
                        >
                            <DatePicker
                                style={{ width: '100%' }}
                                showTime
                                format='DD/MM/YYYY HH:mm'
                            />
                        </Form.Item>
                    </Form>
                </Modal>
            </Space>
        </div>
    );
};

export default AuctionList;
