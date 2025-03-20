import React, { useState } from 'react';
import { Row, Col, Card, Typography, Tag, Badge, Select, Input, Pagination, Space, Divider, Statistic, Button } from 'antd';
import { SearchOutlined, FilterOutlined, HeartOutlined, ClockCircleOutlined, TagOutlined, FireOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';

const { Title, Text, Paragraph } = Typography;
const { Meta } = Card;
const { Search } = Input;
const { Countdown } = Statistic;
const { Option } = Select;

const Auctions = () => {
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('ending-soon');
  const [currentPage, setCurrentPage] = useState(1);

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
      hot: true,
      description: 'Rare vintage Rolex Submariner in excellent condition. Original box and papers included.'
    },
    {
      id: 2,
      title: 'Modern Abstract Art Painting',
      image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=1145',
      currentBid: 2300,
      bidCount: 16,
      timeLeft: Date.now() + 1000 * 60 * 60 * 24, // 24 hours
      category: 'Art',
      hot: false,
      description: 'Original modern abstract painting by an emerging artist. Size: 36" x 48".'
    },
    {
      id: 3,
      title: 'Antique Mahogany Desk',
      image: 'https://images.unsplash.com/photo-1519974719765-e6559eac2575?q=80&w=1170',
      currentBid: 1250,
      bidCount: 9,
      timeLeft: Date.now() + 1000 * 60 * 60 * 72, // 72 hours
      category: 'Furniture',
      hot: false,
      description: '19th century mahogany writing desk with original brass hardware. Recently restored.'
    },
    {
      id: 4,
      title: 'Rare First Edition Book',
      image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=1073',
      currentBid: 5500,
      bidCount: 31,
      timeLeft: Date.now() + 1000 * 60 * 60 * 36, // 36 hours
      category: 'Books',
      hot: true,
      description: 'First edition copy of a classic novel, signed by the author. Excellent condition.'
    },
    {
      id: 5,
      title: 'Vintage Camera Collection',
      image: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?q=80&w=1470',
      currentBid: 850,
      bidCount: 13,
      timeLeft: Date.now() + 1000 * 60 * 60 * 96, // 96 hours
      category: 'Electronics',
      hot: false,
      description: 'Collection of 5 vintage film cameras from the 1960s and 1970s. All in working condition.'
    },
    {
      id: 6,
      title: 'Handcrafted Leather Bag',
      image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?q=80&w=1472',
      currentBid: 350,
      bidCount: 7,
      timeLeft: Date.now() + 1000 * 60 * 60 * 48, // 48 hours
      category: 'Fashion',
      hot: false,
      description: 'Handmade leather messenger bag crafted from premium full-grain leather.'
    },
    {
      id: 7,
      title: 'Diamond Engagement Ring',
      image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=1470',
      currentBid: 3900,
      bidCount: 19,
      timeLeft: Date.now() + 1000 * 60 * 60 * 24, // 24 hours
      category: 'Jewelry',
      hot: true,
      description: '1.2 carat diamond ring in 18K white gold setting. Comes with certificate of authenticity.'
    },
    {
      id: 8,
      title: 'Signed Sports Memorabilia',
      image: 'https://images.unsplash.com/photo-1610372374545-147bc62e1fed?q=80&w=1374',
      currentBid: 1800,
      bidCount: 11,
      timeLeft: Date.now() + 1000 * 60 * 60 * 48, // 48 hours
      category: 'Sports',
      hot: false,
      description: 'Authentic signed jersey from championship team. Includes display case and certificate.'
    },
  ];

  const handleFilterChange = (value) => {
    setFilter(value);
    setCurrentPage(1);
  };

  const handleSortChange = (value) => {
    setSortBy(value);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Scroll to top when changing pages
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div>
      <div style={{ 
        backgroundColor: '#f7f7f7', 
        padding: '40px 20px',
        minHeight: 'calc(100vh - 64px - 200px)' 
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {/* Page Header */}
          <div style={{ marginBottom: '30px', textAlign: 'center' }}>
            <Title level={2}>Current Auctions</Title>
            <Paragraph style={{ fontSize: '16px', maxWidth: '800px', margin: '0 auto' }}>
              Browse our selection of unique items available for bidding. Place your bid before time runs out!
            </Paragraph>
          </div>

          {/* Filters */}
          <div style={{ 
            marginBottom: '30px', 
            padding: '20px',
            backgroundColor: '#fff',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
          }}>
            <Row gutter={[16, 16]} align="middle">
              <Col xs={24} sm={24} md={8} lg={6}>
                <Search
                  placeholder="Search auctions..."
                  allowClear
                  enterButton={<SearchOutlined />}
                  size="large"
                />
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Space>
                  <Text strong><FilterOutlined /> Filter by:</Text>
                  <Select 
                    defaultValue="all" 
                    style={{ width: 150 }} 
                    onChange={handleFilterChange}
                    size="large"
                  >
                    <Option value="all">All Categories</Option>
                    <Option value="watches">Watches</Option>
                    <Option value="art">Art</Option>
                    <Option value="furniture">Furniture</Option>
                    <Option value="books">Books</Option>
                    <Option value="electronics">Electronics</Option>
                    <Option value="fashion">Fashion</Option>
                    <Option value="jewelry">Jewelry</Option>
                    <Option value="sports">Sports</Option>
                  </Select>
                </Space>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Space>
                  <Text strong>Sort by:</Text>
                  <Select 
                    defaultValue="ending-soon" 
                    style={{ width: 180 }} 
                    onChange={handleSortChange}
                    size="large"
                  >
                    <Option value="ending-soon">Ending Soon</Option>
                    <Option value="price-low">Price: Low to High</Option>
                    <Option value="price-high">Price: High to Low</Option>
                    <Option value="most-bids">Most Bids</Option>
                    <Option value="recently-added">Recently Added</Option>
                  </Select>
                </Space>
              </Col>
              <Col xs={24} sm={24} md={24} lg={6} style={{ textAlign: 'right' }}>
                <Text>Showing {auctions.length} items</Text>
              </Col>
            </Row>
          </div>

          {/* Auction Items Grid */}
          <Row gutter={[24, 24]}>
            {auctions.map(auction => (
              <Col xs={24} sm={12} md={8} lg={6} key={auction.id}>
                <Badge.Ribbon 
                  text="HOT" 
                  color="red" 
                  style={{ display: auction.hot ? 'block' : 'none' }}
                >
                  <Card
                    hoverable
                    cover={
                      <div style={{ height: '200px', overflow: 'hidden', position: 'relative' }}>
                        <img 
                          alt={auction.title} 
                          src={auction.image} 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                        />
                        <div style={{ 
                          position: 'absolute', 
                          bottom: '10px', 
                          left: '10px', 
                          background: 'rgba(0,0,0,0.7)', 
                          padding: '5px 10px', 
                          borderRadius: '4px' 
                        }}>
                          <Countdown 
                            value={auction.timeLeft} 
                            format="D[d] H[h] m[m]" 
                            valueStyle={{ color: '#fff', fontSize: '14px' }} 
                            prefix={<ClockCircleOutlined style={{ marginRight: '5px' }} />}
                          />
                        </div>
                      </div>
                    }
                    actions={[
                      <Button type="text" icon={<HeartOutlined />}>Watch</Button>,
                      <Link to={`/auction/${auction.id}`}>
                        <Button type="primary" block>Bid Now</Button>
                      </Link>
                    ]}
                  >
                    <Meta 
                      title={<Link to={`/auction/${auction.id}`}>{auction.title}</Link>}
                      description={
                        <Space direction="vertical" size={0} style={{ width: '100%' }}>
                          <div>
                            <Tag icon={<TagOutlined />} color="blue">{auction.category}</Tag>
                            {auction.hot && <Tag icon={<FireOutlined />} color="volcano">Popular</Tag>}
                          </div>
                          <Paragraph ellipsis={{ rows: 2 }} style={{ marginTop: '8px' }}>
                            {auction.description}
                          </Paragraph>
                          <Divider style={{ margin: '8px 0' }} />
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <Text type="secondary">Current Bid</Text>
                              <div>
                                <Text strong style={{ fontSize: '16px' }}>${auction.currentBid.toLocaleString()}</Text>
                              </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <Text type="secondary">Bids</Text>
                              <div>
                                <Text>{auction.bidCount}</Text>
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

          {/* Pagination */}
          <div style={{ marginTop: '40px', textAlign: 'center' }}>
            <Pagination 
              current={currentPage}
              total={100} 
              pageSize={12} 
              onChange={handlePageChange}
              showSizeChanger={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auctions;