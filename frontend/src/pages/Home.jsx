import React, { useState, useEffect } from 'react';
import {
    Typography,
    Row,
    Col,
    Tabs,
    Pagination,
    Carousel,
    Button,
    Card,
    Statistic
} from 'antd';
import {
    ShoppingOutlined,
    RiseOutlined,
    ClockCircleOutlined,
    UserOutlined,
    TrophyOutlined
} from '@ant-design/icons';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { AuctionGrid } from '../components/auction';
import { getHomePageData } from '../services/auctionService';
import './Home.less';

const { Title, Paragraph } = Typography;
const { TabPane } = Tabs;

const Home = () => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({
        featured: [],
        upcoming: [],
        ending: [],
        categories: [],
        stats: {}
    });
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 12,
        total: 0
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await getHomePageData(
                    pagination.current,
                    pagination.pageSize
                );
                setData(result);
                setPagination((prev) => ({
                    ...prev,
                    total: result.total || 0
                }));
            } catch (error) {
                console.error('Failed to fetch home page data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [pagination.current, pagination.pageSize]);

    const handlePageChange = (page) => {
        setPagination((prev) => ({ ...prev, current: page }));
        window.scrollTo(0, 0);
    };

    return (
        <>
            <Helmet>
                <title>Auction Hub - Online Bidding Platform</title>
                <meta
                    name='description'
                    content='Discover exclusive items and bid in real-time on our secure online auction platform.'
                />
            </Helmet>

            <div className='home-container'>
                {/* Hero Banner */}
                <section className='hero-section'>
                    <Carousel autoplay effect='fade' className='hero-carousel'>
                        <div className='carousel-item'>
                            <div className='carousel-content'>
                                <Title level={1}>Discover Unique Items</Title>
                                <Paragraph>
                                    Bid on exclusive collectibles, art, and more
                                </Paragraph>
                                <Button type='primary' size='large'>
                                    <Link to='/search'>Explore Auctions</Link>
                                </Button>
                            </div>
                            <div className='carousel-overlay'></div>
                            <img
                                src='/banner1.jpg'
                                alt='Discover Unique Items'
                            />
                        </div>
                        <div className='carousel-item'>
                            <div className='carousel-content'>
                                <Title level={1}>Sell Your Valuables</Title>
                                <Paragraph>
                                    Reach thousands of potential buyers
                                </Paragraph>
                                <Button type='primary' size='large'>
                                    <Link to='/create-auction'>
                                        Start Selling
                                    </Link>
                                </Button>
                            </div>
                            <div className='carousel-overlay'></div>
                            <img src='/banner2.jpg' alt='Sell Your Valuables' />
                        </div>
                    </Carousel>
                </section>

                {/* Featured Categories */}
                <section className='categories-section'>
                    <Title level={2} className='section-title'>
                        Browse Categories
                    </Title>
                    <Row gutter={[16, 16]} className='categories-grid'>
                        {data.categories.map((category) => (
                            <Col xs={12} sm={8} md={6} lg={4} key={category.id}>
                                <Link to={`/search?category=${category.id}`}>
                                    <Card
                                        hoverable
                                        className='category-card'
                                        cover={
                                            <img
                                                alt={category.name}
                                                src={
                                                    category.image ||
                                                    '/category-placeholder.png'
                                                }
                                            />
                                        }
                                    >
                                        <Card.Meta title={category.name} />
                                    </Card>
                                </Link>
                            </Col>
                        ))}
                    </Row>
                </section>

                {/* Platform Stats */}
                <section className='stats-section'>
                    <Row gutter={[32, 32]} justify='center'>
                        <Col xs={12} sm={6}>
                            <Statistic
                                title='Active Auctions'
                                value={data.stats.activeAuctions || 0}
                                prefix={<ShoppingOutlined />}
                            />
                        </Col>
                        <Col xs={12} sm={6}>
                            <Statistic
                                title='Registered Users'
                                value={data.stats.totalUsers || 0}
                                prefix={<UserOutlined />}
                            />
                        </Col>
                        <Col xs={12} sm={6}>
                            <Statistic
                                title='Completed Auctions'
                                value={data.stats.completedAuctions || 0}
                                prefix={<TrophyOutlined />}
                            />
                        </Col>
                        <Col xs={12} sm={6}>
                            <Statistic
                                title='Total Bids'
                                value={data.stats.totalBids || 0}
                                prefix={<RiseOutlined />}
                            />
                        </Col>
                    </Row>
                </section>

                {/* Auction Tabs */}
                <section className='auctions-section'>
                    <Title level={2} className='section-title'>
                        Explore Auctions
                    </Title>
                    <Tabs defaultActiveKey='featured' className='auction-tabs'>
                        <TabPane
                            tab={
                                <span>
                                    <TrophyOutlined />
                                    Featured
                                </span>
                            }
                            key='featured'
                        >
                            <AuctionGrid
                                auctions={data.featured}
                                loading={loading}
                                emptyText='No featured auctions available'
                            />
                        </TabPane>
                        <TabPane
                            tab={
                                <span>
                                    <ClockCircleOutlined />
                                    Ending Soon
                                </span>
                            }
                            key='ending'
                        >
                            <AuctionGrid
                                auctions={data.ending}
                                loading={loading}
                                emptyText='No auctions ending soon'
                            />
                        </TabPane>
                        <TabPane
                            tab={
                                <span>
                                    <RiseOutlined />
                                    Upcoming
                                </span>
                            }
                            key='upcoming'
                        >
                            <AuctionGrid
                                auctions={data.upcoming}
                                loading={loading}
                                emptyText='No upcoming auctions'
                            />
                        </TabPane>
                    </Tabs>

                    {data.total > pagination.pageSize && (
                        <div className='pagination-container'>
                            <Pagination
                                current={pagination.current}
                                pageSize={pagination.pageSize}
                                total={pagination.total}
                                onChange={handlePageChange}
                                showSizeChanger={false}
                            />
                        </div>
                    )}
                </section>

                {/* How It Works */}
                <section className='how-it-works-section'>
                    <Title level={2} className='section-title'>
                        How It Works
                    </Title>
                    <Row gutter={[32, 32]} className='steps-container'>
                        <Col xs={24} sm={8}>
                            <div className='step-item'>
                                <div className='step-icon'>1</div>
                                <Title level={4}>Browse & Discover</Title>
                                <Paragraph>
                                    Explore our wide range of auctions across
                                    various categories
                                </Paragraph>
                            </div>
                        </Col>
                        <Col xs={24} sm={8}>
                            <div className='step-item'>
                                <div className='step-icon'>2</div>
                                <Title level={4}>Bid & Win</Title>
                                <Paragraph>
                                    Place your bids and track auctions in
                                    real-time
                                </Paragraph>
                            </div>
                        </Col>
                        <Col xs={24} sm={8}>
                            <div className='step-item'>
                                <div className='step-icon'>3</div>
                                <Title level={4}>Pay & Receive</Title>
                                <Paragraph>
                                    Secure payment and delivery of your won
                                    items
                                </Paragraph>
                            </div>
                        </Col>
                    </Row>
                    <div className='cta-container'>
                        <Button type='primary' size='large'>
                            <Link to='/how-it-works'>Learn More</Link>
                        </Button>
                    </div>
                </section>
            </div>
        </>
    );
};

export default Home;
