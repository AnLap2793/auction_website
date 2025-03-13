import React from 'react';
import { List, Avatar, Typography, Empty } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import './BidHistory.less';

const { Text } = Typography;

const BidHistory = ({ bids = [] }) => {
    if (!bids || bids.length === 0) {
        return (
            <Empty
                description='No bids yet'
                image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
        );
    }

    return (
        <List
            className='bid-history-list'
            itemLayout='horizontal'
            dataSource={bids}
            renderItem={(bid) => (
                <List.Item className='bid-history-item'>
                    <List.Item.Meta
                        avatar={
                            <Avatar
                                src={bid.bidder?.avatar}
                                icon={!bid.bidder?.avatar && <UserOutlined />}
                            />
                        }
                        title={
                            <div className='bid-history-title'>
                                <span className='bidder-name'>
                                    {bid.bidder?.name || 'Anonymous'}
                                </span>
                                <span className='bid-amount'>
                                    {formatCurrency(bid.amount)}
                                </span>
                            </div>
                        }
                        description={
                            <div className='bid-history-description'>
                                <Text type='secondary'>
                                    {formatDateTime(bid.timestamp)}
                                </Text>
                            </div>
                        }
                    />
                </List.Item>
            )}
        />
    );
};

export default BidHistory;
