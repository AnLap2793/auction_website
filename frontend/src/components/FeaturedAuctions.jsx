import React from 'react';
import {
    Row,
    Col,
    Card,
    Typography,
    Button,
    Badge,
    Tag,
    Statistic,
    Space,
    Divider
} from 'antd';
import {
    HeartOutlined,
    FireOutlined,
    ClockCircleOutlined,
    TagOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';

const { Title, Text } = Typography;
const { Meta } = Card;
const { Countdown } = Statistic;

const FeaturedAuctions = () => {
    // Mock data for auctions
    const auctions = [
        {
            id: 1,
            title: 'Vintage Rolex Submariner',
            image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?q=80&w=1180',
            currentBid: 7650,
            bidCount: 24,
            timeLeft: Date.now() + 1000 * 60 * 60 * 48, // 48 hours
            category: 'Watches',
            hot: true
        },
        {
            id: 2,
            title: 'Modern Abstract Art Painting',
            image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=1145',
            currentBid: 2300,
            bidCount: 16,
            timeLeft: Date.now() + 1000 * 60 * 60 * 24, // 24 hours
            category: 'Art',
            hot: false
        },
        {
            id: 3,
            title: 'Antique Mahogany Desk',
            image: 'https://images.unsplash.com/photo-1519974719765-e6559eac2575?q=80&w=1170',
            currentBid: 1250,
            bidCount: 9,
            timeLeft: Date.now() + 1000 * 60 * 60 * 72, // 72 hours
            category: 'Furniture',
            hot: false
        },
        {
            id: 4,
            title: 'Rare First Edition Book',
            image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=1073',
            currentBid: 5500,
            bidCount: 31,
            timeLeft: Date.now() + 1000 * 60 * 60 * 36, // 36 hours
            category: 'Books',
            hot: true
        }
    ];

    return (
        <div
            style={{
                padding: '60px 20px',
                maxWidth: '1200px',
                margin: '0 auto'
            }}
        >
            <div style={{ marginBottom: '40px', textAlign: 'center' }}>
                <Title level={2}>Featured Auctions</Title>
                <Text type='secondary' style={{ fontSize: '16px' }}>
                    Discover our most exciting auction items currently available
                    for bidding
                </Text>
            </div>

            <Row gutter={[24, 24]}>
                {auctions.map((auction) => (
                    <Col xs={24} sm={12} md={8} lg={6} key={auction.id}>
                        <Badge.Ribbon
                            text='HOT'
                            color='red'
                            style={{ display: auction.hot ? 'block' : 'none' }}
                        >
                            <Card
                                hoverable
                                cover={
                                    <div
                                        style={{
                                            height: '200px',
                                            overflow: 'hidden',
                                            position: 'relative'
                                        }}
                                    >
                                        <img
                                            alt={auction.title}
                                            src={auction.image}
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover'
                                            }}
                                        />
                                        <Link to={`/auction/${auction.id}`}>
                                            <img
                                                alt={auction.title}
                                                src={auction.image}
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'cover'
                                                }}
                                            />
                                        </Link>
                                        <div
                                            style={{
                                                position: 'absolute',
                                                bottom: '10px',
                                                left: '10px',
                                                background: 'rgba(0,0,0,0.7)',
                                                padding: '5px 10px',
                                                borderRadius: '4px'
                                            }}
                                        >
                                            <Countdown
                                                value={auction.timeLeft}
                                                format='D[d] H[h] m[m]'
                                                valueStyle={{
                                                    color: '#fff',
                                                    fontSize: '14px'
                                                }}
                                                prefix={
                                                    <ClockCircleOutlined
                                                        style={{
                                                            marginRight: '5px'
                                                        }}
                                                    />
                                                }
                                            />
                                        </div>
                                    </div>
                                }
                                actions={[
                                    <Button
                                        type='text'
                                        icon={<HeartOutlined />}
                                    >
                                        Watch
                                    </Button>,
                                    <Link to={`/auction/${auction.id}`}>
                                        <Button
                                            type='primary'
                                            block
                                            size='medium'
                                            style={{ marginRight: '10px' }}
                                        >
                                            Bid Now
                                        </Button>
                                    </Link>
                                ]}
                            >
                                <Meta
                                    title={
                                        <Link to={`/auction/${auction.id}`}>
                                            {auction.title}
                                        </Link>
                                    }
                                    description={
                                        <Space
                                            direction='vertical'
                                            size={0}
                                            style={{ width: '100%' }}
                                        >
                                            <div>
                                                <Tag
                                                    icon={<TagOutlined />}
                                                    color='blue'
                                                >
                                                    {auction.category}
                                                </Tag>
                                                {auction.hot && (
                                                    <Tag
                                                        icon={<FireOutlined />}
                                                        color='volcano'
                                                    >
                                                        Popular
                                                    </Tag>
                                                )}
                                            </div>
                                            <Divider
                                                style={{ margin: '8px 0' }}
                                            />
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    justifyContent:
                                                        'space-between',
                                                    alignItems: 'center'
                                                }}
                                            >
                                                <div>
                                                    <Text type='secondary'>
                                                        Current Bid
                                                    </Text>
                                                    <div>
                                                        <Text
                                                            strong
                                                            style={{
                                                                fontSize: '16px'
                                                            }}
                                                        >
                                                            $
                                                            {auction.currentBid.toLocaleString()}
                                                        </Text>
                                                    </div>
                                                </div>
                                                <div
                                                    style={{
                                                        textAlign: 'right'
                                                    }}
                                                >
                                                    <Text type='secondary'>
                                                        Bids
                                                    </Text>
                                                    <div>
                                                        <Text>
                                                            {auction.bidCount}
                                                        </Text>
                                                    </div>
                                                </div>
                                            </div>
                                        </Space>
                                    }
                                />
                            </Card>
                        </Badge.Ribbon>
                    </Col>
                ))}
            </Row>

            <div style={{ textAlign: 'center', marginTop: '40px' }}>
                <Button type='primary' size='large'>
                    View All Auctions
                </Button>
            </div>
        </div>
    );
};

export default FeaturedAuctions;
