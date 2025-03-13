import React, { useState, useEffect } from 'react';
import { Form, InputNumber, Button, Alert, message } from 'antd';
import { useAuth } from '../../hooks/useAuth';
import { useSocket } from '../../hooks/useSocket';
import { formatCurrency } from '../../utils/formatters';
import './BidForm.less';

const BidForm = ({ auctionId, currentPrice, minIncrement }) => {
    const [form] = Form.useForm();
    const { isAuthenticated, user } = useAuth();
    const { placeBid } = useSocket();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [suggestedBid, setSuggestedBid] = useState(
        currentPrice + minIncrement
    );

    useEffect(() => {
        setSuggestedBid(currentPrice + minIncrement);
        form.setFieldsValue({ bidAmount: currentPrice + minIncrement });
    }, [currentPrice, minIncrement, form]);

    const handleBid = async (values) => {
        if (!isAuthenticated) {
            message.error('Please login to place a bid');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await placeBid(auctionId, values.bidAmount);
            message.success('Bid placed successfully!');
            form.setFieldsValue({ bidAmount: values.bidAmount + minIncrement });
        } catch (err) {
            setError(err.message || 'Failed to place bid. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleQuickBid = async () => {
        if (!isAuthenticated) {
            message.error('Please login to place a bid');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await placeBid(auctionId, suggestedBid);
            message.success('Bid placed successfully!');
            form.setFieldsValue({ bidAmount: suggestedBid + minIncrement });
        } catch (err) {
            setError(err.message || 'Failed to place bid. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='bid-form-container'>
            {error && (
                <Alert
                    message={error}
                    type='error'
                    showIcon
                    className='bid-error'
                />
            )}

            <div className='bid-info'>
                <div className='min-bid'>
                    <span>Minimum bid:</span>
                    <span className='min-bid-value'>
                        {formatCurrency(currentPrice + minIncrement)}
                    </span>
                </div>
                <div className='bid-increment'>
                    <span>Bid increment:</span>
                    <span>{formatCurrency(minIncrement)}</span>
                </div>
            </div>

            {isAuthenticated ? (
                <div className='bid-actions'>
                    <Button
                        type='primary'
                        size='large'
                        onClick={handleQuickBid}
                        loading={loading}
                        className='quick-bid-btn'
                    >
                        Bid {formatCurrency(suggestedBid)}
                    </Button>

                    <div className='custom-bid'>
                        <Form form={form} onFinish={handleBid} layout='inline'>
                            <Form.Item
                                name='bidAmount'
                                rules={[
                                    {
                                        required: true,
                                        message: 'Please enter bid amount'
                                    },
                                    {
                                        validator: (_, value) => {
                                            if (value <= currentPrice) {
                                                return Promise.reject(
                                                    'Bid must be higher than current price'
                                                );
                                            }
                                            if (
                                                value <
                                                currentPrice + minIncrement
                                            ) {
                                                return Promise.reject(
                                                    `Minimum bid is ${formatCurrency(
                                                        currentPrice +
                                                            minIncrement
                                                    )}`
                                                );
                                            }
                                            return Promise.resolve();
                                        }
                                    }
                                ]}
                                initialValue={suggestedBid}
                            >
                                <InputNumber
                                    min={currentPrice + minIncrement}
                                    step={minIncrement}
                                    precision={2}
                                    style={{ width: '100%' }}
                                    formatter={(value) =>
                                        `$ ${value}`.replace(
                                            /\B(?=(\d{3})+(?!\d))/g,
                                            ','
                                        )
                                    }
                                    parser={(value) =>
                                        value.replace(/\$\s?|(,*)/g, '')
                                    }
                                />
                            </Form.Item>
                            <Form.Item>
                                <Button
                                    type='default'
                                    htmlType='submit'
                                    loading={loading}
                                >
                                    Place Bid
                                </Button>
                            </Form.Item>
                        </Form>
                    </div>
                </div>
            ) : (
                <div className='login-to-bid'>
                    <Alert
                        message='Login Required'
                        description='Please login to place a bid on this auction.'
                        type='info'
                        showIcon
                    />
                </div>
            )}
        </div>
    );
};

export default BidForm;
