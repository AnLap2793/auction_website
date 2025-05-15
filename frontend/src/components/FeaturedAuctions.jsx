import React, { useState, useEffect } from 'react';
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
    Divider,
    message
} from 'antd';
import {
    HeartOutlined,
    FireOutlined,
    ClockCircleOutlined,
    TagOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import auctionService from '../services/auctionService';

const { Title, Text } = Typography;
const { Meta } = Card;
const { Countdown } = Statistic;

const FeaturedAuctions = () => {
    const [auctions, setAuctions] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchFeaturedAuctions();
    }, []);

    const fetchFeaturedAuctions = async () => {
        try {
            setLoading(true);
            const response = await auctionService.getAllAuctions({
                limit: 4,
                status: 'active',
                sort: 'current_bid:desc'
            });
            setAuctions(response.data);
        } catch (error) {
            message.error('Không thể tải danh sách phiên đấu giá nổi bật');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            style={{
                padding: '60px 20px',
                maxWidth: '1200px',
                margin: '0 auto'
            }}
        >
            <div style={{ marginBottom: '40px', textAlign: 'center' }}>
                <Title level={2}>Phiên đấu giá nổi bật</Title>
                <Text type='secondary' style={{ fontSize: '16px' }}>
                    Khám phá những phiên đấu giá có giá trị cao nhất hiện đang
                    diễn ra
                </Text>
            </div>

            <Row gutter={[24, 24]}>
                {auctions.map((auction) => (
                    <Col xs={24} sm={12} md={8} lg={6} key={auction.id}>
                        <Badge.Ribbon
                            text='HOT'
                            color='red'
                            style={{
                                display:
                                    auction.current_bid >= 5000
                                        ? 'block'
                                        : 'none'
                            }}
                        >
                            <Card
                                hoverable
                                loading={loading}
                                cover={
                                    <div
                                        style={{
                                            height: '200px',
                                            overflow: 'hidden',
                                            position: 'relative'
                                        }}
                                    >
                                        <img
                                            alt={auction.Product.title}
                                            src={
                                                auction.Product.ProductImages[0]
                                                    ?.image_url ||
                                                '/placeholder.png'
                                            }
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover'
                                            }}
                                        />
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
                                                value={new Date(
                                                    auction.end_time
                                                ).getTime()}
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
                                        Theo dõi
                                    </Button>,
                                    <Link to={`/auction/${auction.id}`}>
                                        <Button
                                            type='primary'
                                            block
                                            size='medium'
                                        >
                                            Đấu giá ngay
                                        </Button>
                                    </Link>
                                ]}
                            >
                                <Meta
                                    title={
                                        <Link to={`/auction/${auction.id}`}>
                                            {auction.Product.title}
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
                                                    {auction.Product.Category
                                                        ?.name ||
                                                        'Chưa phân loại'}
                                                </Tag>
                                                {auction.current_bid >=
                                                    5000 && (
                                                    <Tag
                                                        icon={<FireOutlined />}
                                                        color='volcano'
                                                    >
                                                        Nổi bật
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
                                                        Giá hiện tại
                                                    </Text>
                                                    <div>
                                                        <Text
                                                            strong
                                                            style={{
                                                                fontSize: '16px'
                                                            }}
                                                        >
                                                            {Number(
                                                                auction.current_bid ||
                                                                    auction
                                                                        .Product
                                                                        .starting_price
                                                            ).toLocaleString()}{' '}
                                                            VNĐ
                                                        </Text>
                                                    </div>
                                                </div>
                                                <div
                                                    style={{
                                                        textAlign: 'right'
                                                    }}
                                                >
                                                    <Text type='secondary'>
                                                        Bước giá
                                                    </Text>
                                                    <div>
                                                        <Text>
                                                            {Number(
                                                                auction.bid_increment
                                                            ).toLocaleString()}{' '}
                                                            VNĐ
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
                <Link to='/auctions'>
                    <Button type='primary' size='large'>
                        Xem tất cả
                    </Button>
                </Link>
            </div>
        </div>
    );
};

export default FeaturedAuctions;
