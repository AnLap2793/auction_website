import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
    Typography,
    Row,
    Col,
    Image,
    Descriptions,
    Card,
    Statistic,
    Tag,
    Button,
    Space,
    Divider,
    Input,
    Modal,
    Form,
    message
} from 'antd';
import {
    ClockCircleOutlined,
    UserOutlined,
    DollarOutlined,
    HeartOutlined,
    EyeOutlined,
    TagOutlined,
    HistoryOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

// Simulated auction data - in a real app, this would come from an API
const getAuctionData = (id) => {
    const auctions = [
        {
            id: 1,
            title: 'Vintage Rolex Submariner',
            image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?q=80&w=1180',
            images: [
                'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?q=80&w=1180',
                'https://images.unsplash.com/photo-1604242692760-2f7b0c26856d?q=80&w=1169',
                'https://images.unsplash.com/photo-1547996160-81dfa63595aa?q=80&w=1287'
            ],
            currentBid: 7650,
            startingBid: 5000,
            bidCount: 24,
            timeLeft: Date.now() + 1000 * 60 * 60 * 48, // 48 hours
            category: 'Watches',
            condition: 'Excellent',
            seller: 'LuxuryWatchStore',
            sellerRating: 4.9,
            sellerSales: 158,
            description:
                'This is an authentic vintage Rolex Submariner from the 1970s in excellent condition. The watch features a black dial with luminous hour markers and hands. It comes with the original box and papers. The movement has been recently serviced and is functioning perfectly.',
            location: 'New York, USA',
            shippingPrice: 50,
            returnPolicy: 'Returns accepted within 14 days',
            bidHistory: [
                {
                    username: 'watch_collector88',
                    bid: 7650,
                    time: '2 hours ago'
                },
                { username: 'luxury_items', bid: 7500, time: '5 hours ago' },
                { username: 'timepiece_lover', bid: 7200, time: '1 day ago' },
                { username: 'vintage_hunter', bid: 6800, time: '2 days ago' },
                { username: 'collector123', bid: 6500, time: '2 days ago' }
            ],
            views: 342,
            watchers: 68
        },
        {
            id: 2,
            title: 'Modern Abstract Art Painting',
            image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=1145',
            images: [
                'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=1145',
                'https://images.unsplash.com/photo-1549887534-1541e9326642?q=80&w=1365',
                'https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?q=80&w=1472'
            ],
            currentBid: 2300,
            startingBid: 1000,
            bidCount: 16,
            timeLeft: Date.now() + 1000 * 60 * 60 * 24, // 24 hours
            category: 'Art',
            condition: 'New',
            seller: 'ModernArtGallery',
            sellerRating: 4.7,
            sellerSales: 87,
            description:
                'This is a stunning modern abstract painting by renowned artist James Smith. The painting uses vibrant colors and bold strokes to create a visually striking piece. It is painted on high-quality canvas and measures 36" x 48". This painting would make a dramatic statement in any modern interior.',
            location: 'Los Angeles, USA',
            shippingPrice: 75,
            returnPolicy: 'All sales are final',
            bidHistory: [
                { username: 'art_lover', bid: 2300, time: '6 hours ago' },
                { username: 'modern_collector', bid: 2100, time: '1 day ago' },
                {
                    username: 'interior_designer',
                    bid: 1800,
                    time: '2 days ago'
                },
                { username: 'gallery_owner', bid: 1500, time: '3 days ago' },
                { username: 'art_enthusiast', bid: 1200, time: '4 days ago' }
            ],
            views: 213,
            watchers: 42
        },
        {
            id: 3,
            title: 'Antique Mahogany Desk',
            image: 'https://images.unsplash.com/photo-1519974719765-e6559eac2575?q=80&w=1170',
            images: [
                'https://images.unsplash.com/photo-1519974719765-e6559eac2575?q=80&w=1170',
                'https://images.unsplash.com/photo-1536140691919-10d2f368876b?q=80&w=1287',
                'https://images.unsplash.com/photo-1584586958565-d0306efaa1e2?q=80&w=1287'
            ],
            currentBid: 1250,
            startingBid: 800,
            bidCount: 9,
            timeLeft: Date.now() + 1000 * 60 * 60 * 72, // 72 hours
            category: 'Furniture',
            condition: 'Good',
            seller: 'AntiqueCollectibles',
            sellerRating: 4.8,
            sellerSales: 203,
            description:
                'This beautiful antique mahogany desk dates back to the early 1900s. It features intricate carvings and inlaid leather top. The desk has three drawers with original brass handles. There are minor signs of wear consistent with its age, but it remains in very good condition and is fully functional.',
            location: 'Chicago, USA',
            shippingPrice: 150,
            returnPolicy: 'Returns accepted within 7 days',
            bidHistory: [
                { username: 'vintage_collector', bid: 1250, time: '1 day ago' },
                { username: 'antique_lover', bid: 1100, time: '2 days ago' },
                { username: 'home_decor', bid: 1000, time: '3 days ago' },
                {
                    username: 'furniture_restorer',
                    bid: 950,
                    time: '4 days ago'
                },
                { username: 'collector456', bid: 900, time: '5 days ago' }
            ],
            views: 178,
            watchers: 31
        },
        {
            id: 4,
            title: 'Rare First Edition Book',
            image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=1073',
            images: [
                'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=1073',
                'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=1287',
                'https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=1298'
            ],
            currentBid: 5500,
            startingBid: 3000,
            bidCount: 31,
            timeLeft: Date.now() + 1000 * 60 * 60 * 36, // 36 hours
            category: 'Books',
            condition: 'Very Good',
            seller: 'RareBookDealer',
            sellerRating: 5.0,
            sellerSales: 127,
            description:
                'This is a rare first edition of "The Great Gatsby" by F. Scott Fitzgerald, published in 1925. The book is in very good condition with the original dust jacket (some minor edge wear). The binding is tight, and the pages are clean with no writing or marks. A true collector\'s item for literature enthusiasts.',
            location: 'Boston, USA',
            shippingPrice: 25,
            returnPolicy:
                'Returns accepted within 30 days with authentication issues only',
            bidHistory: [
                { username: 'book_collector', bid: 5500, time: '12 hours ago' },
                { username: 'literary_lover', bid: 5200, time: '1 day ago' },
                { username: 'rare_books', bid: 4800, time: '1 day ago' },
                { username: 'first_editions', bid: 4500, time: '2 days ago' },
                { username: 'gatsby_fan', bid: 4000, time: '3 days ago' }
            ],
            views: 256,
            watchers: 54
        }
    ];

    return auctions.find((auction) => auction.id === parseInt(id));
};

const BiddingDetail = () => {
    const { id } = useParams();
    const [auction, setAuction] = useState(getAuctionData(id));
    const [bidAmount, setBidAmount] = useState(
        (auction?.currentBid || 0) + 100
    );
    const [isModalOpen, setIsModalOpen] = useState(false);

    if (!auction) {
        return (
            <div>
                <div style={{ padding: '50px 20px', textAlign: 'center' }}>
                    <Title level={3}>Auction not found</Title>
                    <Text>
                        The auction you're looking for doesn't exist or has been
                        removed.
                    </Text>
                </div>
            </div>
        );
    }

    const showBidModal = () => {
        setIsModalOpen(true);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    const handleBid = () => {
        if (bidAmount <= auction.currentBid) {
            message.error('Your bid must be higher than the current bid');
            return;
        }

        // In a real app, this would be an API call
        setAuction({
            ...auction,
            currentBid: bidAmount,
            bidCount: auction.bidCount + 1,
            bidHistory: [
                { username: 'you', bid: bidAmount, time: 'just now' },
                ...auction.bidHistory
            ]
        });

        message.success(`Bid of $${bidAmount} placed successfully!`);
        setIsModalOpen(false);
    };

    const minimumBid = auction.currentBid + 100;

    return (
        <div>
            <div
                style={{
                    padding: '30px 20px',
                    maxWidth: '1200px',
                    margin: '0 auto'
                }}
            >
                <Row gutter={[32, 32]}>
                    {/* Left column - Images */}
                    <Col xs={24} md={12}>
                        <Card>
                            <Image
                                src={auction.image}
                                alt={auction.title}
                                style={{ width: '100%', height: 'auto' }}
                            />
                            <div style={{ marginTop: '20px' }}>
                                <Row gutter={[8, 8]}>
                                    {auction.images.map((img, index) => (
                                        <Col span={8} key={index}>
                                            <Image
                                                src={img}
                                                alt={`${auction.title} view ${
                                                    index + 1
                                                }`}
                                                style={{
                                                    width: '100%',
                                                    height: 'auto',
                                                    cursor: 'pointer'
                                                }}
                                            />
                                        </Col>
                                    ))}
                                </Row>
                            </div>
                        </Card>
                    </Col>

                    {/* Right column - Info and Bidding */}
                    <Col xs={24} md={12}>
                        <Card>
                            <Tag color='blue'>{auction.category}</Tag>
                            <Title level={2}>{auction.title}</Title>

                            {/* Item stats */}
                            <Row gutter={16} style={{ marginBottom: '20px' }}>
                                <Col span={8}>
                                    <Statistic
                                        title='Current Bid'
                                        value={`$${auction.currentBid}`}
                                        precision={0}
                                        valueStyle={{ color: '#1890ff' }}
                                        prefix={<DollarOutlined />}
                                    />
                                </Col>
                                <Col span={8}>
                                    <Statistic
                                        title='Bids'
                                        value={auction.bidCount}
                                        prefix={<UserOutlined />}
                                    />
                                </Col>
                                <Col span={8}>
                                    <Statistic
                                        title='Watching'
                                        value={auction.watchers}
                                        prefix={<EyeOutlined />}
                                    />
                                </Col>
                            </Row>

                            {/* Auction timer */}
                            <Card
                                style={{
                                    marginBottom: '20px',
                                    background: '#f9f9f9'
                                }}
                                styles={{ padding: '15px' }}
                            >
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between'
                                    }}
                                >
                                    <div>
                                        <Text
                                            strong
                                            style={{ fontSize: '16px' }}
                                        >
                                            <ClockCircleOutlined /> Time Left:
                                        </Text>
                                    </div>
                                    <div>
                                        <Statistic.Countdown
                                            value={auction.timeLeft}
                                            format='D [days] H [hrs] m [mins] s [secs]'
                                            valueStyle={{
                                                fontSize: '16px',
                                                fontWeight: 'bold'
                                            }}
                                        />
                                    </div>
                                </div>
                            </Card>

                            {/* Bidding actions */}
                            <Space
                                direction='vertical'
                                size='large'
                                style={{ width: '100%' }}
                            >
                                <Space direction='horizontal'>
                                    <Text>Enter your maximum bid:</Text>
                                    <Text type='secondary'>
                                        Minimum bid: ${minimumBid}
                                    </Text>
                                </Space>
                                <Space.Compact>
                                    <Input
                                        style={{ width: 'calc(100% - 100px)' }}
                                        prefix='$'
                                        type='number'
                                        placeholder={minimumBid.toString()}
                                        value={bidAmount}
                                        onChange={(e) =>
                                            setBidAmount(
                                                parseInt(e.target.value)
                                            )
                                        }
                                        min={minimumBid}
                                    />
                                    <Button
                                        type='primary'
                                        style={{ width: '100px' }}
                                        onClick={showBidModal}
                                    >
                                        Place Bid
                                    </Button>
                                </Space.Compact>
                                <Space
                                    style={{
                                        width: '100%',
                                        justifyContent: 'space-between'
                                    }}
                                >
                                    <Button icon={<HeartOutlined />}>
                                        Add to Watchlist
                                    </Button>
                                    <Button type='link'>Ask a Question</Button>
                                </Space>
                            </Space>

                            <Divider />

                            {/* Seller info */}
                            <div style={{ marginBottom: '20px' }}>
                                <Title level={5}>Seller Information</Title>
                                <Space align='center'>
                                    <UserOutlined />
                                    <Text strong>{auction.seller}</Text>
                                    <Tag color='green'>
                                        {auction.sellerRating} ★
                                    </Tag>
                                    <Text type='secondary'>
                                        {auction.sellerSales} sales
                                    </Text>
                                </Space>
                            </div>

                            {/* Shipping info */}
                            <Descriptions bordered size='small' column={1}>
                                <Descriptions.Item label='Item Location'>
                                    {auction.location}
                                </Descriptions.Item>
                                <Descriptions.Item label='Shipping Cost'>
                                    ${auction.shippingPrice}
                                </Descriptions.Item>
                                <Descriptions.Item label='Returns'>
                                    {auction.returnPolicy}
                                </Descriptions.Item>
                                <Descriptions.Item label='Condition'>
                                    {auction.condition}
                                </Descriptions.Item>
                            </Descriptions>
                        </Card>
                    </Col>
                </Row>

                {/* Item details section */}
                <Row gutter={[32, 32]} style={{ marginTop: '30px' }}>
                    <Col span={24}>
                        <Card title='Item Description'>
                            <Paragraph style={{ fontSize: '16px' }}>
                                {auction.description}
                            </Paragraph>
                        </Card>
                    </Col>
                </Row>

                {/* Bid history section */}
                <Row gutter={[32, 32]} style={{ marginTop: '30px' }}>
                    <Col span={24}>
                        <Card
                            title={
                                <Space>
                                    <HistoryOutlined />
                                    <span>
                                        Bid History ({auction.bidCount} bids)
                                    </span>
                                </Space>
                            }
                        >
                            <table
                                style={{
                                    width: '100%',
                                    borderCollapse: 'collapse'
                                }}
                            >
                                <thead>
                                    <tr
                                        style={{
                                            borderBottom: '1px solid #f0f0f0'
                                        }}
                                    >
                                        <th
                                            style={{
                                                padding: '12px 8px',
                                                textAlign: 'left'
                                            }}
                                        >
                                            Bidder
                                        </th>
                                        <th
                                            style={{
                                                padding: '12px 8px',
                                                textAlign: 'right'
                                            }}
                                        >
                                            Bid Amount
                                        </th>
                                        <th
                                            style={{
                                                padding: '12px 8px',
                                                textAlign: 'right'
                                            }}
                                        >
                                            Time
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {auction.bidHistory.map((bid, index) => (
                                        <tr
                                            key={index}
                                            style={{
                                                borderBottom:
                                                    '1px solid #f0f0f0'
                                            }}
                                        >
                                            <td style={{ padding: '12px 8px' }}>
                                                <Space>
                                                    <UserOutlined />
                                                    <Text>{bid.username}</Text>
                                                    {index === 0 && (
                                                        <Tag color='green'>
                                                            Current Highest
                                                        </Tag>
                                                    )}
                                                </Space>
                                            </td>
                                            <td
                                                style={{
                                                    padding: '12px 8px',
                                                    textAlign: 'right'
                                                }}
                                            >
                                                <Text strong>${bid.bid}</Text>
                                            </td>
                                            <td
                                                style={{
                                                    padding: '12px 8px',
                                                    textAlign: 'right'
                                                }}
                                            >
                                                <Text type='secondary'>
                                                    {bid.time}
                                                </Text>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </Card>
                    </Col>
                </Row>
            </div>

            {/* Bidding Confirmation Modal */}
            <Modal
                title='Confirm Your Bid'
                open={isModalOpen}
                onCancel={handleCancel}
                footer={[
                    <Button key='back' onClick={handleCancel}>
                        Cancel
                    </Button>,
                    <Button key='submit' type='primary' onClick={handleBid}>
                        Confirm Bid
                    </Button>
                ]}
            >
                <p>
                    You are about to place a bid of{' '}
                    <strong>${bidAmount}</strong> on:
                </p>
                <p>
                    <strong>{auction.title}</strong>
                </p>
                <Divider />
                <p>
                    By confirming, you agree to the terms and conditions of this
                    auction.
                </p>
                <p>
                    Note: This bid is binding and cannot be withdrawn once
                    placed.
                </p>
            </Modal>
        </div>
    );
};

export default BiddingDetail;
