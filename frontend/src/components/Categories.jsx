import React from 'react';
import { Row, Col, Card, Typography, Button } from 'antd';
import {
    ClockCircleOutlined,
    CarOutlined,
    HomeOutlined,
    GiftOutlined,
    CrownOutlined,
    BulbOutlined,
    CameraOutlined,
    TrophyOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';

const { Title, Text } = Typography;

const Categories = () => {
    const categories = [
        {
            id: 1,
            title: 'Watches & Jewelry',
            icon: <ClockCircleOutlined style={{ fontSize: '32px' }} />,
            color: '#1890ff',
            itemCount: 158
        },
        {
            id: 2,
            title: 'Vehicles',
            icon: <CarOutlined style={{ fontSize: '32px' }} />,
            color: '#722ed1',
            itemCount: 67
        },
        {
            id: 3,
            title: 'Real Estate',
            icon: <HomeOutlined style={{ fontSize: '32px' }} />,
            color: '#eb2f96',
            itemCount: 43
        },
        {
            id: 4,
            title: 'Collectibles',
            icon: <GiftOutlined style={{ fontSize: '32px' }} />,
            color: '#fa8c16',
            itemCount: 210
        },
        {
            id: 5,
            title: 'Luxury Items',
            icon: <CrownOutlined style={{ fontSize: '32px' }} />,
            color: '#faad14',
            itemCount: 89
        },
        {
            id: 6,
            title: 'Art',
            icon: <BulbOutlined style={{ fontSize: '32px' }} />,
            color: '#a0d911',
            itemCount: 126
        },
        {
            id: 7,
            title: 'Electronics',
            icon: <CameraOutlined style={{ fontSize: '32px' }} />,
            color: '#13c2c2',
            itemCount: 175
        },
        {
            id: 8,
            title: 'Sports Memorabilia',
            icon: <TrophyOutlined style={{ fontSize: '32px' }} />,
            color: '#cf1322',
            itemCount: 82
        }
    ];

    return (
        <div style={{ padding: '60px 20px', backgroundColor: '#f7f7f7' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{ marginBottom: '40px', textAlign: 'center' }}>
                    <Title level={2}>Browse By Category</Title>
                    <Text type='secondary' style={{ fontSize: '16px' }}>
                        Explore our wide range of auction categories
                    </Text>
                </div>

                <Row gutter={[16, 16]}>
                    {categories.map((category) => (
                        <Col xs={12} sm={8} md={6} key={category.id}>
                            <Link to={`/category/${category.id}`}>
                                <Card
                                    hoverable
                                    style={{
                                        textAlign: 'center',
                                        height: '100%'
                                    }}
                                    styles={{ padding: '20px 15px' }}
                                >
                                    <div
                                        style={{
                                            color: category.color,
                                            marginBottom: '15px',
                                            height: '60px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                    >
                                        {category.icon}
                                    </div>
                                    <Title
                                        level={5}
                                        style={{
                                            marginTop: 0,
                                            marginBottom: '5px'
                                        }}
                                    >
                                        {category.title}
                                    </Title>
                                    <Text type='secondary'>
                                        {category.itemCount} items
                                    </Text>
                                </Card>
                            </Link>
                        </Col>
                    ))}
                </Row>

                <div style={{ textAlign: 'center', marginTop: '40px' }}>
                    <Button type='default' size='large'>
                        View All Categories
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default Categories;
