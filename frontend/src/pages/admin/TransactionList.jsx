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
    Badge,
    message
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
import transactionService from '../../services/transactionService';

const { Title } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

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

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await transactionService.getAllTransactions();
            let filteredData = response;

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
                        item.transaction_code
                            .toLowerCase()
                            .includes(searchText.toLowerCase()) ||
                        item.auction_id
                            .toLowerCase()
                            .includes(searchText.toLowerCase())
                );
            }

            setData(filteredData);
        } catch (error) {
            message.error('Có lỗi xảy ra khi tải dữ liệu: ' + error.message);
        } finally {
            setLoading(false);
        }
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

    const handleViewDetails = async (record) => {
        try {
            const transactionDetail =
                await transactionService.getTransactionById(record.id);
            setSelectedTransaction(transactionDetail);
            setIsModalVisible(true);
        } catch (error) {
            message.error(
                'Có lỗi xảy ra khi tải chi tiết giao dịch: ' + error.message
            );
        }
    };

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            await transactionService.updateTransactionStatus(id, newStatus);
            message.success('Cập nhật trạng thái thành công');
            fetchData();
        } catch (error) {
            message.error(
                'Có lỗi xảy ra khi cập nhật trạng thái: ' + error.message
            );
        }
    };

    const getStatusTag = (status) => {
        switch (status) {
            case 'completed':
                return (
                    <Tag icon={<CheckCircleOutlined />} color='success'>
                        Hoàn thành
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
            title: 'Mã giao dịch',
            dataIndex: 'transaction_code',
            key: 'transaction_code',
            width: 150
        },
        {
            title: 'Phiên đấu giá',
            dataIndex: 'auction_id',
            key: 'auction_id',
            render: (text) => (
                <Space>
                    <ShoppingOutlined />
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
                    {Number(amount).toLocaleString()} VND
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
            width: 150,
            render: (_, record) => (
                <Space>
                    <Tooltip title='Xem chi tiết'>
                        <Button
                            type='primary'
                            icon={<EyeOutlined />}
                            onClick={() => handleViewDetails(record)}
                        />
                    </Tooltip>
                    <Select
                        defaultValue={record.status}
                        style={{ width: 120 }}
                        onChange={(value) =>
                            handleStatusUpdate(record.id, value)
                        }
                    >
                        <Option value='pending'>Đang xử lý</Option>
                        <Option value='completed'>Hoàn thành</Option>
                        <Option value='failed'>Thất bại</Option>
                    </Select>
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
                                title='Hoàn thành'
                                value={
                                    data.filter((t) => t.status === 'completed')
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
                            <Option value='completed'>Hoàn thành</Option>
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
                                <Descriptions.Item
                                    label='Mã giao dịch'
                                    span={2}
                                >
                                    {selectedTransaction.transaction_code}
                                </Descriptions.Item>
                                <Descriptions.Item
                                    label='Phiên đấu giá'
                                    span={2}
                                >
                                    {selectedTransaction.auction_id}
                                </Descriptions.Item>
                                <Descriptions.Item label='Số tiền' span={2}>
                                    <span
                                        style={{
                                            fontWeight: 'bold',
                                            color: '#1890ff'
                                        }}
                                    >
                                        {Number(
                                            selectedTransaction.amount
                                        ).toLocaleString()}{' '}
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
                                <Descriptions.Item label='Thời gian tạo'>
                                    {moment(
                                        selectedTransaction.created_at
                                    ).format('DD/MM/YYYY HH:mm:ss')}
                                </Descriptions.Item>
                                <Descriptions.Item label='Thời gian cập nhật'>
                                    {moment(
                                        selectedTransaction.updated_at
                                    ).format('DD/MM/YYYY HH:mm:ss')}
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
