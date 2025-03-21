import React, { useState, useEffect } from 'react';
import {
    Row,
    Col,
    Card,
    Statistic,
    Typography,
    Table,
    Tag,
    Space,
    DatePicker,
    Select,
    Progress,
    List
} from 'antd';
import {
    UserOutlined,
    ShoppingOutlined,
    GiftOutlined,
    TransactionOutlined,
    ArrowUpOutlined,
    ArrowDownOutlined,
    DollarOutlined
} from '@ant-design/icons';
import { Area } from '@ant-design/plots';

const { Title } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

// Dữ liệu mẫu cho biểu đồ
const chartData = [
    { date: '2024-01', value: 3, type: 'Người dùng' },
    { date: '2024-02', value: 4, type: 'Người dùng' },
    { date: '2024-03', value: 6, type: 'Người dùng' },
    { date: '2024-04', value: 8, type: 'Người dùng' },
    { date: '2024-01', value: 2, type: 'Sản phẩm' },
    { date: '2024-02', value: 3, type: 'Sản phẩm' },
    { date: '2024-03', value: 4, type: 'Sản phẩm' },
    { date: '2024-04', value: 5, type: 'Sản phẩm' },
    { date: '2024-01', value: 1, type: 'Đấu giá' },
    { date: '2024-02', value: 2, type: 'Đấu giá' },
    { date: '2024-03', value: 3, type: 'Đấu giá' },
    { date: '2024-04', value: 4, type: 'Đấu giá' }
];

// Dữ liệu mẫu cho danh sách giao dịch gần đây
const recentTransactions = [
    {
        id: 1,
        user: 'Nguyễn Văn A',
        product: 'iPhone 14 Pro Max',
        amount: 25000000,
        status: 'success',
        date: '2024-04-10'
    },
    {
        id: 2,
        user: 'Trần Thị B',
        product: 'Macbook Pro M2',
        amount: 35000000,
        status: 'pending',
        date: '2024-04-09'
    },
    {
        id: 3,
        user: 'Lê Văn C',
        product: 'Samsung S24 Ultra',
        amount: 28000000,
        status: 'failed',
        date: '2024-04-08'
    }
];

// Dữ liệu mẫu cho top sản phẩm
const topProducts = [
    {
        title: 'iPhone 14 Pro Max',
        price: 25000000,
        bids: 15
    },
    {
        title: 'Macbook Pro M2',
        price: 35000000,
        bids: 12
    },
    {
        title: 'Samsung S24 Ultra',
        price: 28000000,
        bids: 10
    }
];

const DashboardPage = () => {
    const [timeRange, setTimeRange] = useState('week');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(true);
        // Giả lập API call
        setTimeout(() => {
            setLoading(false);
        }, 1000);
    }, [timeRange]);

    const config = {
        data: chartData,
        xField: 'date',
        yField: 'value',
        seriesField: 'type',
        smooth: true,
        animation: {
            appear: {
                animation: 'path-in',
                duration: 1000
            }
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'success':
                return 'success';
            case 'pending':
                return 'warning';
            case 'failed':
                return 'error';
            default:
                return 'default';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'success':
                return 'Thành công';
            case 'pending':
                return 'Đang xử lý';
            case 'failed':
                return 'Thất bại';
            default:
                return 'Không xác định';
        }
    };

    return (
        <div style={{ padding: '24px' }}>
            <Space direction='vertical' size='large' style={{ width: '100%' }}>
                {/* Tiêu đề và bộ lọc */}
                <Row justify='space-between' align='middle'>
                    <Col>
                        <Title level={2}>Tổng quan</Title>
                    </Col>
                    <Col>
                        <Space>
                            <Select
                                defaultValue='week'
                                style={{ width: 120 }}
                                onChange={(value) => setTimeRange(value)}
                            >
                                <Option value='today'>Hôm nay</Option>
                                <Option value='week'>Tuần này</Option>
                                <Option value='month'>Tháng này</Option>
                                <Option value='year'>Năm nay</Option>
                            </Select>
                            <RangePicker />
                        </Space>
                    </Col>
                </Row>

                {/* Thống kê tổng quan */}
                <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12} md={6}>
                        <Card loading={loading}>
                            <Statistic
                                title='Tổng người dùng'
                                value={1250}
                                prefix={<UserOutlined />}
                                suffix={
                                    <Tag
                                        color='success'
                                        style={{ marginLeft: 8 }}
                                    >
                                        <ArrowUpOutlined /> 12%
                                    </Tag>
                                }
                            />
                            <Progress percent={75} showInfo={false} />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card loading={loading}>
                            <Statistic
                                title='Tổng sản phẩm'
                                value={856}
                                prefix={<ShoppingOutlined />}
                                suffix={
                                    <Tag
                                        color='success'
                                        style={{ marginLeft: 8 }}
                                    >
                                        <ArrowUpOutlined /> 8%
                                    </Tag>
                                }
                            />
                            <Progress percent={65} showInfo={false} />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card loading={loading}>
                            <Statistic
                                title='Đấu giá đang diễn ra'
                                value={124}
                                prefix={<GiftOutlined />}
                                suffix={
                                    <Tag
                                        color='error'
                                        style={{ marginLeft: 8 }}
                                    >
                                        <ArrowDownOutlined /> 5%
                                    </Tag>
                                }
                            />
                            <Progress percent={45} showInfo={false} />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card loading={loading}>
                            <Statistic
                                title='Doanh thu'
                                value={2850000000}
                                prefix={<DollarOutlined />}
                                suffix='VND'
                            />
                            <Progress percent={85} showInfo={false} />
                        </Card>
                    </Col>
                </Row>

                {/* Biểu đồ thống kê */}
                <Row gutter={[16, 16]}>
                    <Col span={24}>
                        <Card title='Biểu đồ thống kê' loading={loading}>
                            <Area {...config} />
                        </Card>
                    </Col>
                </Row>

                {/* Giao dịch gần đây và Top sản phẩm */}
                <Row gutter={[16, 16]}>
                    <Col xs={24} md={16}>
                        <Card title='Giao dịch gần đây' loading={loading}>
                            <List
                                dataSource={recentTransactions}
                                renderItem={(item) => (
                                    <List.Item>
                                        <List.Item.Meta
                                            title={item.product}
                                            description={`${item.user} - ${item.date}`}
                                        />
                                        <Space>
                                            <span>
                                                {item.amount.toLocaleString()}{' '}
                                                VND
                                            </span>
                                            <Tag
                                                color={getStatusColor(
                                                    item.status
                                                )}
                                            >
                                                {getStatusText(item.status)}
                                            </Tag>
                                        </Space>
                                    </List.Item>
                                )}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} md={8}>
                        <Card title='Top sản phẩm đấu giá' loading={loading}>
                            <List
                                dataSource={topProducts}
                                renderItem={(item, index) => (
                                    <List.Item>
                                        <List.Item.Meta
                                            avatar={
                                                <Tag color='blue'>
                                                    #{index + 1}
                                                </Tag>
                                            }
                                            title={item.title}
                                            description={`${item.price.toLocaleString()} VND`}
                                        />
                                        <Tag color='green'>
                                            {item.bids} lượt đấu giá
                                        </Tag>
                                    </List.Item>
                                )}
                            />
                        </Card>
                    </Col>
                </Row>
            </Space>
        </div>
    );
};

export default DashboardPage;
