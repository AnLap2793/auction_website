import React from 'react';
import { Row, Col, Card, Typography, Button, List, Divider, Badge, Space, Tag } from 'antd';
import { 
  ClockCircleOutlined, 
  CarOutlined, 
  HomeOutlined, 
  GiftOutlined, 
  CrownOutlined, 
  BulbOutlined,
  CameraOutlined,
  TrophyOutlined,
  RightOutlined,
  TagOutlined,
  FireOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';

const { Title, Text, Paragraph } = Typography;
const { Meta } = Card;

const Categories = () => {
  const categories = [
    {
      id: 1,
      title: 'Watches & Jewelry',
      icon: <ClockCircleOutlined style={{ fontSize: '32px' }} />,
      color: '#1890ff',
      itemCount: 158,
      featuredItems: [
        {
          id: 101,
          title: 'Vintage Rolex Submariner',
          image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?q=80&w=1180',
          currentBid: 7650,
          hot: true,
        },
        {
          id: 102,
          title: 'Diamond Engagement Ring',
          image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=1470',
          currentBid: 3900,
          hot: true,
        }
      ]
    },
    {
      id: 2,
      title: 'Vehicles',
      icon: <CarOutlined style={{ fontSize: '32px' }} />,
      color: '#722ed1',
      itemCount: 67,
      featuredItems: [
        {
          id: 201,
          title: 'Classic Porsche 911',
          image: 'https://images.unsplash.com/photo-1580274455191-1c62238fa333?q=80&w=1364',
          currentBid: 42000,
          hot: true,
        },
        {
          id: 202,
          title: 'Restored Vintage Motorcycle',
          image: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?q=80&w=1470',
          currentBid: 8500,
          hot: false,
        }
      ]
    },
    {
      id: 3,
      title: 'Real Estate',
      icon: <HomeOutlined style={{ fontSize: '32px' }} />,
      color: '#eb2f96',
      itemCount: 43,
      featuredItems: [
        {
          id: 301,
          title: 'Beachfront Vacation Property',
          image: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?q=80&w=1365',
          currentBid: 325000,
          hot: true,
        },
        {
          id: 302,
          title: 'Urban Loft Apartment',
          image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=1470',
          currentBid: 187500,
          hot: false,
        }
      ]
    },
    {
      id: 4,
      title: 'Collectibles',
      icon: <GiftOutlined style={{ fontSize: '32px' }} />,
      color: '#fa8c16',
      itemCount: 210,
      featuredItems: [
        {
          id: 401,
          title: 'Rare Comic Book Collection',
          image: 'https://images.unsplash.com/photo-1601850494422-3cf14624b0b3?q=80&w=1470',
          currentBid: 2250,
          hot: false,
        },
        {
          id: 402,
          title: 'Vintage Action Figure Set',
          image: 'https://images.unsplash.com/photo-1608278047522-58806a6ac85b?q=80&w=1470',
          currentBid: 780,
          hot: true,
        }
      ]
    },
    {
      id: 5,
      title: 'Luxury Items',
      icon: <CrownOutlined style={{ fontSize: '32px' }} />,
      color: '#faad14',
      itemCount: 89,
      featuredItems: [
        {
          id: 501,
          title: 'Designer Handbag Collection',
          image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=1470',
          currentBid: 4750,
          hot: true,
        },
        {
          id: 502,
          title: 'Limited Edition Watch',
          image: 'https://images.unsplash.com/photo-1526045612212-70caf35c14df?q=80&w=1470',
          currentBid: 8900,
          hot: false,
        }
      ]
    },
    {
      id: 6,
      title: 'Art',
      icon: <BulbOutlined style={{ fontSize: '32px' }} />,
      color: '#a0d911',
      itemCount: 126,
      featuredItems: [
        {
          id: 601,
          title: 'Original Oil Painting',
          image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=1145',
          currentBid: 3200,
          hot: false,
        },
        {
          id: 602,
          title: 'Bronze Sculpture',
          image: 'https://images.unsplash.com/photo-1561839561-b13ccb4a2921?q=80&w=1374',
          currentBid: 5400,
          hot: true,
        }
      ]
    },
    {
      id: 7,
      title: 'Electronics',
      icon: <CameraOutlined style={{ fontSize: '32px' }} />,
      color: '#13c2c2',
      itemCount: 175,
      featuredItems: [
        {
          id: 701,
          title: 'Vintage Camera Collection',
          image: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?q=80&w=1470',
          currentBid: 850,
          hot: false,
        },
        {
          id: 702,
          title: 'Rare Prototype Gadget',
          image: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?q=80&w=1401',
          currentBid: 1275,
          hot: true,
        }
      ]
    },
    {
      id: 8,
      title: 'Sports Memorabilia',
      icon: <TrophyOutlined style={{ fontSize: '32px' }} />,
      color: '#cf1322',
      itemCount: 82,
      featuredItems: [
        {
          id: 801,
          title: 'Signed Championship Jersey',
          image: 'https://images.unsplash.com/photo-1610372374545-147bc62e1fed?q=80&w=1374',
          currentBid: 1800,
          hot: true,
        },
        {
          id: 802,
          title: 'Game-Used Equipment Collection',
          image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=1470',
          currentBid: 950,
          hot: false,
        }
      ]
    }
  ];

  return (
    <div>
      <div style={{ backgroundColor: '#f7f7f7', padding: '40px 20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {/* Page Header */}
          <div style={{ marginBottom: '40px', textAlign: 'center' }}>
            <Title level={2}>Browse By Category</Title>
            <Paragraph style={{ fontSize: '16px', maxWidth: '800px', margin: '0 auto' }}>
              Explore our wide range of auction categories to find items you're interested in
            </Paragraph>
          </div>

          {/* Categories Grid */}
          <List
            grid={{
              gutter: 24,
              xs: 1,
              sm: 1,
              md: 2,
              lg: 2,
              xl: 2,
              xxl: 2,
            }}
            dataSource={categories}
            renderItem={category => (
              <List.Item>
                <Card
                  style={{ marginBottom: '30px' }}
                  title={
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <div style={{ 
                        color: category.color, 
                        marginRight: '15px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        {category.icon}
                      </div>
                      <div>
                        <Title level={4} style={{ margin: 0 }}>{category.title}</Title>
                        <Text type="secondary">{category.itemCount} items</Text>
                      </div>
                    </div>
                  }
                  extra={
                    <Link to={`/category/${category.id}`}>
                      <Button type="primary" icon={<RightOutlined />}>
                        View All
                      </Button>
                    </Link>
                  }
                >
                  <Row gutter={16}>
                    {category.featuredItems.map(item => (
                      <Col xs={24} sm={24} md={12} key={item.id}>
                        <Badge.Ribbon 
                          text="HOT" 
                          color="red" 
                          style={{ display: item.hot ? 'block' : 'none' }}
                        >
                          <Card
                            hoverable
                            cover={
                              <div style={{ height: '150px', overflow: 'hidden' }}>
                                <img 
                                  alt={item.title} 
                                  src={item.image} 
                                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                />
                              </div>
                            }
                          >
                            <Meta 
                              title={
                                <Link to={`/auction/${item.id}`}>{item.title}</Link>
                              }
                              description={
                                <Space direction="vertical" size={0} style={{ width: '100%' }}>
                                  <div>
                                    <Tag icon={<TagOutlined />} color="blue">{category.title}</Tag>
                                    {item.hot && <Tag icon={<FireOutlined />} color="volcano">Popular</Tag>}
                                  </div>
                                  <div style={{ marginTop: '8px' }}>
                                    <Text type="secondary">Current Bid</Text>
                                    <div>
                                      <Text strong style={{ fontSize: '16px' }}>${item.currentBid.toLocaleString()}</Text>
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
                </Card>
              </List.Item>
            )}
          />
          
          {/* Explore All Categories Button */}
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <Divider>
              <Text type="secondary">Can't find what you're looking for?</Text>
            </Divider>
            <Button type="primary" size="large">
              Explore All Categories
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Categories;