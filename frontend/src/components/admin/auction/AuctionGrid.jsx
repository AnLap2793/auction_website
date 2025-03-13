import React from 'react';
import { Row, Col, Empty, Spin } from 'antd';
import AuctionCard from './AuctionCard';
import './AuctionGrid.less';

const AuctionGrid = ({
    auctions = [],
    loading = false,
    onWishlistToggle,
    emptyText = 'No auctions found'
}) => {
    if (loading) {
        return (
            <div className='auction-grid-loading'>
                <Spin size='large' />
            </div>
        );
    }

    if (!auctions || auctions.length === 0) {
        return (
            <div className='auction-grid-empty'>
                <Empty description={emptyText} />
            </div>
        );
    }

    return (
        <Row gutter={[16, 24]} className='auction-grid'>
            {auctions.map((auction) => (
                <Col xs={24} sm={12} md={8} lg={6} xl={6} key={auction.id}>
                    <AuctionCard
                        auction={auction}
                        onWishlistToggle={onWishlistToggle}
                    />
                </Col>
            ))}
        </Row>
    );
};

export default AuctionGrid;
