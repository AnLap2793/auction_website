import React from 'react';
import { Card, Typography, Tag, Button, Tooltip, Badge } from 'antd';
import { Link } from 'react-router-dom';
import {
    HeartOutlined,
    HeartFilled,
    EyeOutlined,
    ClockCircleOutlined
} from '@ant-design/icons';
import { formatCurrency, formatTimeLeft } from '../../utils/formatters';
import { useAuth } from '../../hooks/useAuth';
import { toggleWishlist } from '../../services/auctionService';
import './AuctionCard.less';

const { Title, Text } = Typography;

const AuctionCard = ({ auction, onWishlistToggle }) => {
    const { isAuthenticated } = useAuth();
    const {
        id,
        title,
        images,
        currentPrice,
        endDate,
        status,
        bidCount,
        inWishlist = false,
        seller
    } = auction;

    const handleWishlistToggle = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!isAuthenticated) {
            return;
        }

        try {
            await toggleWishlist(id, !inWishlist);
            if (onWishlistToggle) {
                onWishlistToggle(id, !inWishlist);
            }
        } catch (error) {
            console.error('Failed to toggle wishlist:', error);
        }
    };

    const getStatusBadge = () => {
        switch (status) {
            case 'active':
                return <Badge.Ribbon text='Active' color='green' />;
            case 'pending':
                return <Badge.Ribbon text='Upcoming' color='blue' />;
            case 'ended':
                return <Badge.Ribbon text='Ended' color='red' />;
            default:
                return null;
        }
    };

    const timeLeft = formatTimeLeft(endDate);

    return (
        <Badge.Ribbon {...getStatusBadge()}>
            <Card
                hoverable
                className='auction-card'
                cover={
                    <div className='card-image-container'>
                        <Link to={`/auction/${id}`}>
                            <img
                                alt={title}
                                src={
                                    images && images.length > 0
                                        ? images[0]
                                        : '/placeholder.png'
                                }
                                className='card-image'
                            />
                        </Link>
                        <div className='card-actions'>
                            <Tooltip
                                title={
                                    inWishlist
                                        ? 'Remove from wishlist'
                                        : 'Add to wishlist'
                                }
                            >
                                <Button
                                    type='text'
                                    icon={
                                        inWishlist ? (
                                            <HeartFilled />
                                        ) : (
                                            <HeartOutlined />
                                        )
                                    }
                                    onClick={handleWishlistToggle}
                                    className={`wishlist-btn ${
                                        inWishlist ? 'active' : ''
                                    }`}
                                />
                            </Tooltip>
                            <Tooltip title='Quick view'>
                                <Link to={`/auction/${id}`}>
                                    <Button
                                        type='text'
                                        icon={<EyeOutlined />}
                                    />
                                </Link>
                            </Tooltip>
                        </div>
                    </div>
                }
            >
                <div className='card-content'>
                    <Link to={`/auction/${id}`}>
                        <Title
                            level={5}
                            className='card-title'
                            ellipsis={{ rows: 2 }}
                        >
                            {title}
                        </Title>
                    </Link>

                    <div className='card-meta'>
                        <Text type='secondary'>Seller: {seller?.name}</Text>
                        <Text type='secondary'>{bidCount} bids</Text>
                    </div>

                    <div className='card-price'>
                        <Text strong>Current Bid:</Text>
                        <Text className='price-value'>
                            {formatCurrency(currentPrice)}
                        </Text>
                    </div>

                    {status === 'active' && (
                        <div className='card-time-left'>
                            <ClockCircleOutlined /> {timeLeft}
                        </div>
                    )}

                    <Link to={`/auction/${id}`} className='view-auction-link'>
                        <Button type='primary' block>
                            {status === 'active' ? 'Bid Now' : 'View Details'}
                        </Button>
                    </Link>
                </div>
            </Card>
        </Badge.Ribbon>
    );
};

export default React.memo(AuctionCard);
