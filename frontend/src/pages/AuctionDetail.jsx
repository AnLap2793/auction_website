import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Row, 
  Col, 
  Card, 
  Typography, 
  Divider, 
  Button, 
  Tag, 
  Skeleton, 
  message, 
  Tabs,
  Breadcrumb,
  Affix,
  Space,
  Modal
} from 'antd';
import { 
  HeartOutlined, 
  HeartFilled, 
  ShareAltOutlined, 
  UserOutlined, 
  TagOutlined,
  ClockCircleOutlined,
  HistoryOutlined,
  InfoCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { Helmet } from 'react-helmet-async';
import { 
  ImageGallery, 
  BidForm, 
  BidHistory, 
  CountdownTimer 
} from '../components/auction';
import { useSocket } from '../hooks/useSocket';
import { useAuth } from '../hooks/useAuth';
import { getAuctionById, toggleWishlist } from '../services/auctionService';
import { formatCurrency, formatDate } from '../utils/formatters';
import './AuctionDetail.less';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { confirm } = Modal;

const AuctionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { socket, joinAuctionRoom, leaveAuctionRoom } = useSocket();
  const { user, isAuthenticated } = useAuth();
  const [auction, setAuction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bidHistory, setBidHistory] = useState([]);
  const [inWishlist, setInWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [auctionEnded, setAuctionEnded] = useState(false);

  const fetchAuctionData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAuctionById(id);
      setAuction(data.auction);
      setBidHistory(data.bidHistory);
      setInWishlist(data.inWishlist);
      
      // Check if auction has ended
      const now = new Date();
      const endDate = new Date(data.auction.endDate);
      setAuctionEnded(now > endDate);
    } catch (error) {
      message.error('Failed to load auction details');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchAuctionData();
  }, [fetchAuctionData]);

  useEffect(() => {
    if (socket && auction) {
      joinAuctionRoom(id);

      // Listen for new bids
      socket.on('new-bid', (bid) => {
        setBidHistory(prevBids => [bid, ...prevBids]);
      });

      // Listen for auction updates
      socket.on('auction-update', (updatedData) => {
        setAuction(prev => ({
          ...prev,
          currentPrice: updatedData.currentPrice,
          highestBidder: updatedData.highestBidder
        }));
      });

      // Listen for auction end
      socket.on('auction-ended', () => {
        setAuctionEnded(true);
        message.info('This auction has ended');
      });

      return () => {
        leaveAuctionRoom(id);
        socket.off('new-bid');
        socket.off('auction-update');
        socket.off('auction-ended');
      };
    }
  }, [socket, id, auction, joinAuctionRoom, leaveAuctionRoom]);

  const handleWishlistToggle = async () => {
    if (!isAuthenticated) {
      message.info('Please login to add items to your wishlist');
      return;
    }

    try {
      setWishlistLoading(true);
      await toggleWishlist(id, !inWishlist);
      setInWishlist(!inWishlist);
      message.success(inWishlist ? 'Removed from wishlist' : 'Added to wishlist');
    } catch (error) {
      message.error('Failed to update wishlist');
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleShare = () => {
    const url = window.location.href;
    
    if (navigator.share) {
      navigator.share({
        title: auction?.title,
        text: `Check out this auction: ${auction?.title}`,
        url: url
      })
      .catch(error => console.log('Error sharing', error));
    } else {
      // Fallback for browsers that don't support navigator.share
      navigator.clipboard.writeText(url)
        .then(() => message.success('Link copied to clipboard'))
        .catch(() => message.error('Failed to copy link'));
    }
  };

  const handleCountdownComplete = () => {
    setAuctionEnded(true);
    message.info('This auction has ended');
  };

  const showBuyNowConfirm = () => {
    if (!isAuthenticated) {
      message.info('Please login to proceed with checkout');
      return;
    }

    confirm({
      title: 'Proceed to Checkout',
      icon: <ExclamationCircleOutlined />,
      content: `You are about to purchase "${auction.title}" for ${formatCurrency(auction.currentPrice)}. Do you want to continue?`,
      onOk() {
        navigate(`/checkout/${id}`);
      }
    });
  };

  if (loading) {
    return (
      <div className="auction-detail-skeleton">
        <Row gutter={[24, 24]}>
          <Col xs={24} md={12}>
            <Skeleton.Image className="image-skeleton" active />
          </Col>
          <Col xs={24} md={12}>
            <Skeleton active paragraph={{ rows: 10 }} />
          </Col>
        </Row>
      </div>
    );
  }

  if (!auction) {
    return (
      <div className="auction-not-found">
        <Title level={3}>Auction not found</Title>
        <Button type="primary">
          <Link to="/search">Browse Other Auctions</Link>
        </Button>
      </div>
    );
  }

  const isOwner = user && auction.sellerId === user.id;
  const isHighestBidder = user && auction.highestBidderId === user.id;

  return (
    <>
      <Helmet>
        <title>{auction.title} | Auction Hub</title>
        <meta name="description" content={auction.description.substring(0, 160)} />
      </Helmet>

      <div className="auction-detail-container">
        <Breadcrumb className="breadcrumb">
          <Breadcrumb.Item>
            <Link to="/">Home</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <Link to="/search">Auctions</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <Link to={`/search?category=${auction.categoryId}`}>{auction.category?.name}</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>{auction.title}</Breadcrumb.Item>
        </Breadcrumb>

        <Row gutter={[24, 24]} className="auction-detail-content">
          <Col xs={24} md={12} lg={14}>
            <ImageGallery images={auction.images} />
            
            <Card className="auction-description-card">
              <Tabs defaultActiveKey="description">
                <TabPane 
                  tab={<span><InfoCircleOutlined />Description</span>} 
                  key="description"
                >
                  <Paragraph>{auction.description}</Paragraph>
                </TabPane>
                <TabPane 
                  tab={<span><HistoryOutlined />Bid History</span>} 
                  key="history"
                >
                  <BidHistory bids={bidHistory} />
                </TabPane>
              </Tabs>
            </Card>
          </Col>

          <Col xs={24} md={12} lg={10}>
            <Affix offsetTop={20}>
              <Card className="auction-info-card">
                <div className="auction-header">
                  <div className="auction-status">
                    <Tag color={auction.status === 'active' ? 'green' : auction.status === 'pending' ? 'blue' : 'red'}>
                      {auction.status === 'active' ? 'Active' : auction.status === 'pending' ? 'Upcoming' : 'Ended'}
                    </Tag>
                    {auction.featured && <Tag color="gold">Featured</Tag>}
                  </div>
                  <div className="auction-actions">
                    <Button 
                      icon={inWishlist ? <HeartFilled /> : <HeartOutlined />} 
                      onClick={handleWishlistToggle}
                      loading={wishlistLoading}
                      className={inWishlist ? 'wishlist-active' : ''}
                    >
                      {inWishlist ? 'Saved' : 'Save'}
                    </Button>
                    <Button icon={<ShareAltOutlined />} onClick={handleShare}>
                      Share
                    </Button>
                  </div>
                </div>

                <Title level={3} className="auction-title">{auction.title}</Title>

                <div className="auction-meta">
                  <div className="meta-item">
                    <UserOutlined /> Seller: <Link to={`/profile/${auction.sellerId}`}>{auction.seller?.name}</Link>
                  </div>
                  <div className="meta-item">
                    <TagOutlined /> Category: <Link to={`/search?category=${auction.categoryId}`}>{auction.category?.name}</Link>
                  </div>
                </div>

                <Divider />

                <div className="auction-price-section">
                  <div className="current-price">
                    <Text>Current Bid:</Text>
                    <Title level={2}>{formatCurrency(auction.currentPrice)}</Title>
                  </div>
                  
                  {auction.highestBidder && (
                    <div className="highest-bidder">
                      <Text>Highest Bidder: </Text>
                      <Text strong>{auction.highestBidder?.name}</Text>
                      {isHighestBidder && <Tag color="green">You</Tag>}
                    </div>
                  )}
                  
                  <div className="bid-count">
                    <Text>{auction.bidCount || bidHistory.length} bids</Text>
                  </div>
                </div>

                {auction.status === 'active' && !auctionEnded && (
                  <div className="time-remaining">
                    <div className="time-label">
                      <ClockCircleOutlined /> Time Remaining:
                    </div>
                    <CountdownTimer 
                      endTime={auction.endDate} 
                      onComplete={handleCountdownComplete} 
                    />
                  </div>
                )}

                <Divider />

                {auction.status === 'active' && !auctionEnded ? (
                  !isOwner ? (
                    <BidForm 
                      auctionId={auction.id} 
                      currentPrice={auction.currentPrice} 
                      minIncrement={auction.minIncrement} 
                    />
                  ) : (
                    <div className="owner-message">
                      <Text>You are the seller of this auction.</Text>
                    </div>
                  )
                ) : auction.status === 'ended' || auctionEnded ? (
                  <div className="auction-ended-section">
                    <Text>This auction has ended.</Text>
                    {isHighestBidder && (
                      <Button 
                        type="primary" 
                        size="large" 
                        block 
                        onClick={showBuyNowConfirm}
                      >
                        Proceed to Checkout
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="auction-pending-section">
                    <Text>This auction starts on {formatDate(auction.startDate)}</Text>
                  </div>
                )}

                <Divider />

                <div className="auction-details">
                  <div className="detail-item">
                    <Text>Starting Price:</Text>
                    <Text strong>{formatCurrency(auction.startingPrice)}</Text>
                  </div>
                  <div className="detail-item">
                    <Text>Minimum Increment:</Text>
                    <Text strong>{formatCurrency(auction.minIncrement)}</Text>
                  </div>
                  <div className="detail-item">
                    <Text>Start Date:</Text>
                    <Text strong>{formatDate(auction.startDate)}</Text>
                  </div>
                  <div className="detail-item">
                    <Text>End Date:</Text>
                    <Text strong>{formatDate(auction.endDate)}</Text>
                  </div>
                </div>
              </Card>
            </Affix>
          </Col>
        </Row>
      </div>
    </>
  );
};

export default AuctionDetail;