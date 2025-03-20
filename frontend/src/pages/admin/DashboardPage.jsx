import React from 'react';
import { Card, Row, Col, Statistic, Table } from 'antd';
import {
    UserOutlined,
    ShoppingOutlined,
    FireOutlined,
    TransactionOutlined
} from '@ant-design/icons';

const { Column } = Table;

const dataSource = [
    {
        key: '1',
        name: 'Người dùng 1',
        email: 'user1@example.com',
        joined: '2023-10-01'
    },
    {
        key: '2',
        name: 'Người dùng 2',
        email: 'user2@example.com',
        joined: '2023-10-02'
    }
];

const productDataSource = [
    {
        key: '1',
        name: 'Sản phẩm 1',
        price: 100,
        status: 'Đang đấu giá'
    },
    {
        key: '2',
        name: 'Sản phẩm 2',
        price: 200,
        status: 'Đã kết thúc'
    }
];

const auctionDataSource = [
    {
        key: '1',
        product: 'Sản phẩm 1',
        startTime: '2023-10-10 10:00',
        endTime: '2023-10-10 12:00',
        status: 'Đang diễn ra'
    },
    {
        key: '2',
        product: 'Sản phẩm 2',
        startTime: '2023-10-11 10:00',
        endTime: '2023-10-11 12:00',
        status: 'Sắp diễn ra'
    }
];

const transactionDataSource = [
    {
        key: '1',
        product: 'Sản phẩm 1',
        buyer: 'Người dùng 1',
        price: 150,
        date: '2023-10-10 12:05'
    },
    {
        key: '2',
        product: 'Sản phẩm 2',
        buyer: 'Người dùng 2',
        price: 250,
        date: '2023-10-11 12:05'
    }
];

const Dashboard = () => {
    return (
        <div style={{ padding: '24px' }}>
            <Row gutter={16}>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title='Tổng số người dùng'
                            value={100}
                            prefix={<UserOutlined />}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title='Tổng số sản phẩm'
                            value={50}
                            prefix={<ShoppingOutlined />}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title='Tổng số phiên đấu giá'
                            value={30}
                            prefix={<FireOutlined />}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title='Tổng số giao dịch'
                            value={20}
                            prefix={<TransactionOutlined />}
                        />
                    </Card>
                </Col>
            </Row>

            <Row gutter={16} style={{ marginTop: '24px' }}>
                <Col span={24}>
                    <Card title='Danh sách người dùng'>
                        <Table dataSource={dataSource} pagination={false}>
                            <Column title='Tên' dataIndex='name' key='name' />
                            <Column
                                title='Email'
                                dataIndex='email'
                                key='email'
                            />
                            <Column
                                title='Ngày tham gia'
                                dataIndex='joined'
                                key='joined'
                            />
                        </Table>
                    </Card>
                </Col>
            </Row>

            <Row gutter={16} style={{ marginTop: '24px' }}>
                <Col span={24}>
                    <Card title='Danh sách sản phẩm'>
                        <Table
                            dataSource={productDataSource}
                            pagination={false}
                        >
                            <Column
                                title='Tên sản phẩm'
                                dataIndex='name'
                                key='name'
                            />
                            <Column title='Giá' dataIndex='price' key='price' />
                            <Column
                                title='Trạng thái'
                                dataIndex='status'
                                key='status'
                            />
                        </Table>
                    </Card>
                </Col>
            </Row>

            <Row gutter={16} style={{ marginTop: '24px' }}>
                <Col span={24}>
                    <Card title='Danh sách phiên đấu giá'>
                        <Table
                            dataSource={auctionDataSource}
                            pagination={false}
                        >
                            <Column
                                title='Sản phẩm'
                                dataIndex='product'
                                key='product'
                            />
                            <Column
                                title='Thời gian bắt đầu'
                                dataIndex='startTime'
                                key='startTime'
                            />
                            <Column
                                title='Thời gian kết thúc'
                                dataIndex='endTime'
                                key='endTime'
                            />
                            <Column
                                title='Trạng thái'
                                dataIndex='status'
                                key='status'
                            />
                        </Table>
                    </Card>
                </Col>
            </Row>

            <Row gutter={16} style={{ marginTop: '24px' }}>
                <Col span={24}>
                    <Card title='Danh sách giao dịch'>
                        <Table
                            dataSource={transactionDataSource}
                            pagination={false}
                        >
                            <Column
                                title='Sản phẩm'
                                dataIndex='product'
                                key='product'
                            />
                            <Column
                                title='Người mua'
                                dataIndex='buyer'
                                key='buyer'
                            />
                            <Column title='Giá' dataIndex='price' key='price' />
                            <Column
                                title='Ngày giao dịch'
                                dataIndex='date'
                                key='date'
                            />
                        </Table>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default Dashboard;
