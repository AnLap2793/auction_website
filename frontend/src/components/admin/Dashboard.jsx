import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Typography, Table, DatePicker } from 'antd';
import {
    UserOutlined,
    ShoppingOutlined,
    DollarOutlined,
    RiseOutlined,
    TeamOutlined
} from '@ant-design/icons';
import { Line, Pie } from '@ant-design/charts';
import { getDashboardStats } from '../../services/adminService';
import './Dashboard.less';

const { Title } = Typography;
const { RangePicker } = DatePicker;

const Dashboard = () => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalAuctions: 0,
        totalRevenue: 0,
        activeAuctions: 0,
        recentTransactions: [],
        userGrowth: [],
        categoryDistribution: []
    });
    const [dateRange, setDateRange] = useState([null, null]);

    useEffect(() => {
        fetchDashboardData();
    }, [dateRange]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const data = await getDashboardStats({
                startDate: dateRange[0]?.format('YYYY-MM-DD'),
                endDate: dateRange[1]?.format('YYYY-MM-DD')
            });
            setStats(data);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const userGrowthConfig = {
        data: stats.userGrowth,
        xField: 'date',
        yField: 'count',
        smooth: true,
        meta: {
            count: {
                alias: 'Users'
            }
        }
    };

    const categoryDistributionConfig = {
        data: stats.categoryDistribution,
        angleField: 'value',
        colorField: 'category',
        radius: 0.8,
        label: {
            type: 'outer',
            content: '{name} {percentage}'
        }
    };

    const columns = [
        {
            title: 'Transaction ID',
            dataIndex: 'id',
            key: 'id'
        },
        {
            title: 'User',
            dataIndex: 'user',
            key: 'user',
            render: (user) => user.name
        },
        {
            title: 'Amount',
            dataIndex: 'amount',
            key: 'amount',
            render: (amount) => `$${amount.toFixed(2)}`
        },
        {
            title: 'Type',
            dataIndex: 'type',
            key: 'type'
        },
        {
            title: 'Date',
            dataIndex: 'date',
            key: 'date'
        }
    ];

    return (
        <div className='admin-dashboard'>
            <div className='dashboard-header'>
                <Title level={2}>Dashboard</Title>
                <RangePicker value={dateRange} onChange={setDateRange} />
            </div>

            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} lg={6}>
                    <Card loading={loading}>
                        <Statistic
                            title='Total Users'
                            value={stats.totalUsers}
                            prefix={<UserOutlined />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card loading={loading}>
                        <Statistic
                            title='Active Auctions'
                            value={stats.activeAuctions}
                            prefix={<ShoppingOutlined />}
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card loading={loading}>
                        <Statistic
                            title='Total Revenue'
                            value={stats.totalRevenue}
                            prefix={<DollarOutlined />}
                            precision={2}
                            valueStyle={{ color: '#faad14' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card loading={loading}>
                        <Statistic
                            title='User Growth'
                            value={
                                stats.userGrowth[stats.userGrowth.length - 1]
                                    ?.count || 0
                            }
                            prefix={<RiseOutlined />}
                            valueStyle={{ color: '#eb2f96' }}
                        />
                    </Card>
                </Col>
            </Row>

            <Row gutter={[16, 16]} className='charts-row'>
                <Col xs={24} lg={16}>
                    <Card title='User Growth Trend' loading={loading}>
                        <Line {...userGrowthConfig} />
                    </Card>
                </Col>
                <Col xs={24} lg={8}>
                    <Card title='Category Distribution' loading={loading}>
                        <Pie {...categoryDistributionConfig} />
                    </Card>
                </Col>
            </Row>

            <Card
                title='Recent Transactions'
                className='transactions-card'
                loading={loading}
            >
                <Table
                    columns={columns}
                    dataSource={stats.recentTransactions}
                    pagination={{ pageSize: 5 }}
                    scroll={{ x: true }}
                />
            </Card>
        </div>
    );
};

export default Dashboard;
