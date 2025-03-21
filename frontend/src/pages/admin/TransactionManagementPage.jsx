import React, { useState, useEffect } from 'react';
import {
    Table,
    Card,
    Space,
    Tag,
    Button,
    Input,
    Row,
    Col,
    DatePicker,
    Select,
    Typography,
    Modal,
    Descriptions,
    Statistic,
    Tooltip,
    Badge
} from 'antd';
import {
    SearchOutlined,
    FilterOutlined,
    EyeOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    ClockCircleOutlined,
    DollarOutlined,
    UserOutlined,
    ShoppingOutlined
} from '@ant-design/icons';
import moment from 'moment';

const { Title } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

// Dữ liệu mẫu
const transactions = [
    {
        id: '1',
        product_name: 'iPhone 14 Pro Max',
        buyer: 'Nguyễn Văn A',
        seller: 'Trần Thị B',
        amount: 25000000,
        status: 'success',
        payment_method: 'banking',
        created_at: '2024-04-10 10:30:00',
        updated_at: '2024-04-10 10:35:00',
        auction_id: 'AUC001',
        payment_details: {
            bank: 'Vietcombank',
            transaction_id: 'VCB123456',
            paid_at: '2024-04-10 10:32:00'
        }
    },
    {
        id: '2',
        product_name: 'Macbook Pro M2',
        buyer: 'Lê Văn C',
        seller: 'Phạm Thị D',
        amount: 35000000,
        status: 'pending',
        payment_method: 'momo',
        created_at: '2024-04-09 15:20:00',
        updated_at: '2024-04-09 15:20:00',
        auction_id: 'AUC002',
        payment_details: {
            wallet: 'Momo',
            transaction_id: 'MOMO789012',
            paid_at: null
        }
    },
    {
        id: '3',
        product_name: 'Samsung S24 Ultra',
        buyer: 'Hoàng Văn E',
        seller: 'Ngô Thị F',
        amount: 28000000,
        status: 'failed',
        payment_method: 'banking',
        created_at: '2024-04-08 09:15:00',
        updated_at: '2024-04-08 09:20:00',
        auction_id: 'AUC003',
        payment_details: {
            bank: 'BIDV',
            transaction_id: 'BIDV345678',
            paid_at: null
        }
    }
];

const TransactionManagementPage = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [filters, setFilters] = useState({
        status: 'all',
        dateRange: null,
        paymentMethod: 'all'
    });
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);

    useEffect(() => {
        fetchData();
    }, [filters]);

    const fetchData = () => {
        setLoading(true);
        // Giả lập API call
        setTimeout(() => {
            let filteredData = [...transactions];

            // Lọc theo trạng thái
            if (filters.status !== 'all') {
                filteredData = filteredData.filter(
                    (item) => item.status === filters.status
                );
            }

            // Lọc theo phương thức thanh toán
            if (filters.paymentMethod !== 'all') {
                filteredData = filteredData.filter(
                    (item) => item.payment_method === filters.paymentMethod
                );
            }

            // Lọc theo khoảng thời gian
            if (filters.dateRange) {
                const [start, end] = filters.dateRange;
                filteredData = filteredData.filter((item) => {
                    const createdAt = moment(item.created_at);
                    return createdAt.isBetween(start, end, 'day', '[]');
                });
            }

            // Lọc theo từ khóa tìm kiếm
            if (searchText) {
                filteredData = filteredData.filter(
                    (item) =>
                        item.product_name
                            .toLowerCase()
                            .includes(searchText.toLowerCase()) ||
                        item.buyer
                            .toLowerCase()
                            .includes(searchText.toLowerCase()) ||
                        item.seller
                            .toLowerCase()
                            .includes(searchText.toLowerCase())
                );
            }

            setData(filteredData);
            setLoading(false);
        }, 500);
    };

    const handleSearch = (value) => {
        setSearchText(value);
        fetchData();
    };

    const handleFilterChange = (type, value) => {
        setFilters((prev) => ({
            ...prev,
            [type]: value
        }));
    };

    const handleViewDetails = (record) => {
        setSelectedTransaction(record);
        setIsModalVisible(true);
    };

    const getStatusTag = (status) => {
        switch (status) {
            case 'success':
                return (
                    <Tag icon={<CheckCircleOutlined />} color='success'>
                        Thành công
                    </Tag>
                );
            case 'pending':
                return (
                    <Tag icon={<ClockCircleOutlined />} color='warning'>
                        Đang xử lý
                    </Tag>
                );
            case 'failed':
                return (
                    <Tag icon={<CloseCircleOutlined />} color='error'>
                        Thất bại
                    </Tag>
                );
            default:
                return <Tag>Không xác định</Tag>;
        }
    };

    const getPaymentMethodTag = (method) => {
        switch (method) {
            case 'banking':
                return <Tag color='blue'>Chuyển khoản ngân hàng</Tag>;
            case 'momo':
                return <Tag color='purple'>Ví Momo</Tag>;
            default:
                return <Tag>Khác</Tag>;
        }
    };

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 80
        },
        {
            title: 'Sản phẩm',
            dataIndex: 'product_name',
            key: 'product_name',
            render: (text, record) => (
                <Space>
                    <ShoppingOutlined />
                    <span>{text}</span>
                </Space>
            )
        },
        {
            title: 'Người mua',
            dataIndex: 'buyer',
            key: 'buyer',
            render: (text) => (
                <Space>
                    <UserOutlined />
                    <span>{text}</span>
                </Space>
            )
        },
        {
            title: 'Người bán',
            dataIndex: 'seller',
            key: 'seller',
            render: (text) => (
                <Space>
                    <UserOutlined />
                    <span>{text}</span>
                </Space>
            )
        },
        {
            title: 'Số tiền',
            dataIndex: 'amount',
            key: 'amount',
            render: (amount) => (
                <span style={{ fontWeight: 'bold', color: '#1890ff' }}>
                    {amount.toLocaleString()} VND
                </span>
            )
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => getStatusTag(status)
        },
        {
            title: 'Phương thức',
            dataIndex: 'payment_method',
            key: 'payment_method',
            render: (method) => getPaymentMethodTag(method)
        },
        {
            title: 'Thời gian',
            dataIndex: 'created_at',
            key: 'created_at',
            render: (date) => moment(date).format('DD/MM/YYYY HH:mm')
        },
        {
            title: 'Thao tác',
            key: 'action',
            width: 100,
            render: (_, record) => (
                <Space>
                    <Tooltip title='Xem chi tiết'>
                        <Button
                            type='primary'
                            icon={<EyeOutlined />}
                            onClick={() => handleViewDetails(record)}
                        />
                    </Tooltip>
                </Space>
            )
        }
    ];

    return (
        <div style={{ padding: '24px' }}>
            <Space direction='vertical' size='large' style={{ width: '100%' }}>
                <Row justify='space-between' align='middle'>
                    <Col>
                        <Title level={2}>Quản lý giao dịch</Title>
                    </Col>
                    <Col>
                        <Space>
                            <Input
                                placeholder='Tìm kiếm...'
                                prefix={<SearchOutlined />}
                                style={{ width: 250 }}
                                onChange={(e) => handleSearch(e.target.value)}
                            />
                            <Button icon={<FilterOutlined />}>Lọc</Button>
                        </Space>
                    </Col>
                </Row>

                {/* Thống kê */}
                <Row gutter={16}>
                    <Col span={6}>
                        <Card>
                            <Statistic
                                title='Tổng giao dịch'
                                value={data.length}
                                prefix={<DollarOutlined />}
                            />
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card>
                            <Statistic
                                title='Thành công'
                                value={
                                    data.filter((t) => t.status === 'success')
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
                                title='Đang xử lý'
                                value={
                                    data.filter((t) => t.status === 'pending')
                                        .length
                                }
                                valueStyle={{ color: '#faad14' }}
                                prefix={<ClockCircleOutlined />}
                            />
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card>
                            <Statistic
                                title='Thất bại'
                                value={
                                    data.filter((t) => t.status === 'failed')
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
                            style={{ width: 150 }}
                            placeholder='Trạng thái'
                            defaultValue='all'
                            onChange={(value) =>
                                handleFilterChange('status', value)
                            }
                        >
                            <Option value='all'>Tất cả trạng thái</Option>
                            <Option value='success'>Thành công</Option>
                            <Option value='pending'>Đang xử lý</Option>
                            <Option value='failed'>Thất bại</Option>
                        </Select>
                        <Select
                            style={{ width: 200 }}
                            placeholder='Phương thức thanh toán'
                            defaultValue='all'
                            onChange={(value) =>
                                handleFilterChange('paymentMethod', value)
                            }
                        >
                            <Option value='all'>Tất cả phương thức</Option>
                            <Option value='banking'>Chuyển khoản</Option>
                            <Option value='momo'>Ví Momo</Option>
                        </Select>
                        <RangePicker
                            onChange={(dates) =>
                                handleFilterChange('dateRange', dates)
                            }
                            format='DD/MM/YYYY'
                        />
                    </Space>
                </Card>

                {/* Bảng dữ liệu */}
                <Table
                    columns={columns}
                    dataSource={data}
                    loading={loading}
                    rowKey='id'
                    pagination={{
                        total: data.length,
                        pageSize: 10,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total) => `Tổng ${total} giao dịch`
                    }}
                />

                {/* Modal chi tiết */}
                <Modal
                    title='Chi tiết giao dịch'
                    open={isModalVisible}
                    onCancel={() => setIsModalVisible(false)}
                    footer={[
                        <Button
                            key='back'
                            onClick={() => setIsModalVisible(false)}
                        >
                            Đóng
                        </Button>
                    ]}
                    width={700}
                >
                    {selectedTransaction && (
                        <Space direction='vertical' style={{ width: '100%' }}>
                            <Descriptions bordered column={2}>
                                <Descriptions.Item label='ID' span={2}>
                                    {selectedTransaction.id}
                                </Descriptions.Item>
                                <Descriptions.Item label='Sản phẩm' span={2}>
                                    {selectedTransaction.product_name}
                                </Descriptions.Item>
                                <Descriptions.Item label='Người mua'>
                                    {selectedTransaction.buyer}
                                </Descriptions.Item>
                                <Descriptions.Item label='Người bán'>
                                    {selectedTransaction.seller}
                                </Descriptions.Item>
                                <Descriptions.Item label='Số tiền' span={2}>
                                    <span
                                        style={{
                                            fontWeight: 'bold',
                                            color: '#1890ff'
                                        }}
                                    >
                                        {selectedTransaction.amount.toLocaleString()}{' '}
                                        VND
                                    </span>
                                </Descriptions.Item>
                                <Descriptions.Item label='Trạng thái'>
                                    {getStatusTag(selectedTransaction.status)}
                                </Descriptions.Item>
                                <Descriptions.Item label='Phương thức'>
                                    {getPaymentMethodTag(
                                        selectedTransaction.payment_method
                                    )}
                                </Descriptions.Item>
                                <Descriptions.Item label='Mã đấu giá'>
                                    {selectedTransaction.auction_id}
                                </Descriptions.Item>
                                <Descriptions.Item label='Thời gian tạo'>
                                    {moment(
                                        selectedTransaction.created_at
                                    ).format('DD/MM/YYYY HH:mm:ss')}
                                </Descriptions.Item>
                                <Descriptions.Item
                                    label='Chi tiết thanh toán'
                                    span={2}
                                >
                                    <Descriptions bordered size='small'>
                                        <Descriptions.Item label='Đơn vị thanh toán'>
                                            {selectedTransaction.payment_details
                                                .bank ||
                                                selectedTransaction
                                                    .payment_details.wallet}
                                        </Descriptions.Item>
                                        <Descriptions.Item label='Mã giao dịch'>
                                            {
                                                selectedTransaction
                                                    .payment_details
                                                    .transaction_id
                                            }
                                        </Descriptions.Item>
                                        <Descriptions.Item label='Thời gian thanh toán'>
                                            {selectedTransaction.payment_details
                                                .paid_at
                                                ? moment(
                                                      selectedTransaction
                                                          .payment_details
                                                          .paid_at
                                                  ).format(
                                                      'DD/MM/YYYY HH:mm:ss'
                                                  )
                                                : 'Chưa thanh toán'}
                                        </Descriptions.Item>
                                    </Descriptions>
                                </Descriptions.Item>
                            </Descriptions>
                        </Space>
                    )}
                </Modal>
            </Space>
        </div>
    );
};

export default TransactionManagementPage;
