import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Row,
    Col,
    Card,
    Steps,
    Button,
    Form,
    Input,
    Select,
    Divider,
    Typography,
    message,
    Result,
    Spin
} from 'antd';
import {
    ShoppingCartOutlined,
    CreditCardOutlined,
    CheckCircleOutlined
} from '@ant-design/icons';
import { Helmet } from 'react-helmet-async';
import { loadStripe } from '@stripe/stripe-js';
import {
    Elements,
    CardElement,
    useStripe,
    useElements
} from '@stripe/react-stripe-js';
import { getAuctionById } from '../services/auctionService';
import { createPaymentIntent } from '../services/paymentService';
import { formatCurrency } from '../utils/formatters';
import './Checkout.less';

const { Title, Text } = Typography;
const { Step } = Steps;
const { Option } = Select;

// Load Stripe outside of component to avoid recreating it on renders
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);

const CheckoutForm = ({ auction, onSuccess }) => {
    const [form] = Form.useForm();
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [clientSecret, setClientSecret] = useState('');

    useEffect(() => {
        // Create payment intent when component mounts
        const getPaymentIntent = async () => {
            try {
                const { clientSecret } = await createPaymentIntent(auction.id);
                setClientSecret(clientSecret);
            } catch (err) {
                setError('Failed to initialize payment. Please try again.');
                console.error(err);
            }
        };

        if (auction) {
            getPaymentIntent();
        }
    }, [auction]);

    const handleSubmit = async (values) => {
        if (!stripe || !elements) {
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const cardElement = elements.getElement(CardElement);

            const { error, paymentIntent } = await stripe.confirmCardPayment(
                clientSecret,
                {
                    payment_method: {
                        card: cardElement,
                        billing_details: {
                            name: values.name,
                            email: values.email,
                            address: {
                                line1: values.address,
                                city: values.city,
                                state: values.state,
                                postal_code: values.zip,
                                country: values.country
                            }
                        }
                    }
                }
            );

            if (error) {
                setError(error.message);
            } else if (paymentIntent.status === 'succeeded') {
                message.success('Payment successful!');
                onSuccess();
            }
        } catch (err) {
            setError('Payment failed. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Form
            form={form}
            layout='vertical'
            onFinish={handleSubmit}
            className='checkout-form'
        >
            <div className='form-section'>
                <Title level={4}>Billing Information</Title>
                <Row gutter={16}>
                    <Col span={24}>
                        <Form.Item
                            name='name'
                            label='Full Name'
                            rules={[
                                {
                                    required: true,
                                    message: 'Please enter your name'
                                }
                            ]}
                        >
                            <Input placeholder='John Doe' />
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <Form.Item
                            name='email'
                            label='Email'
                            rules={[
                                {
                                    required: true,
                                    message: 'Please enter your email'
                                },
                                {
                                    type: 'email',
                                    message: 'Please enter a valid email'
                                }
                            ]}
                        >
                            <Input placeholder='email@example.com' />
                        </Form.Item>
                    </Col>

                    <Col span={24}>
                        <Form.Item
                            name='address'
                            label='Address'
                            rules={[
                                {
                                    required: true,
                                    message: 'Please enter your address'
                                }
                            ]}
                        >
                            <Input placeholder='Street address' />
                        </Form.Item>
                    </Col>

                    <Col span={12}>
                        <Form.Item
                            name='city'
                            label='City'
                            rules={[
                                {
                                    required: true,
                                    message: 'Please enter your city'
                                }
                            ]}
                        >
                            <Input placeholder='City' />
                        </Form.Item>
                    </Col>

                    <Col span={12}>
                        <Form.Item
                            name='state'
                            label='State/Province'
                            rules={[
                                {
                                    required: true,
                                    message: 'Please enter your state'
                                }
                            ]}
                        >
                            <Input placeholder='State' />
                        </Form.Item>
                    </Col>

                    <Col span={12}>
                        <Form.Item
                            name='zip'
                            label='ZIP/Postal Code'
                            rules={[
                                {
                                    required: true,
                                    message: 'Please enter your ZIP code'
                                }
                            ]}
                        >
                            <Input placeholder='ZIP code' />
                        </Form.Item>
                    </Col>

                    <Col span={12}>
                        <Form.Item
                            name='country'
                            label='Country'
                            rules={[
                                {
                                    required: true,
                                    message: 'Please select your country'
                                }
                            ]}
                        >
                            <Select placeholder='Select country'>
                                <Option value='US'>United States</Option>
                                <Option value='CA'>Canada</Option>
                                <Option value='GB'>United Kingdom</Option>
                                {/* Add more countries as needed */}
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>
            </div>

            <Divider />

            <div className='form-section'>
                <Title level={4}>Payment Details</Title>
                <div className='card-element-container'>
                    <CardElement
                        options={{
                            style: {
                                base: {
                                    fontSize: '16px',
                                    color: '#424770',
                                    '::placeholder': {
                                        color: '#aab7c4'
                                    }
                                },
                                invalid: {
                                    color: '#9e2146'
                                }
                            }
                        }}
                    />
                </div>
            </div>

            {error && <div className='error-message'>{error}</div>}

            <div className='checkout-actions'>
                <Button
                    type='primary'
                    htmlType='submit'
                    loading={loading}
                    disabled={!stripe}
                    size='large'
                    block
                >
                    Pay {formatCurrency(auction.currentPrice)}
                </Button>
            </div>
        </Form>
    );
};

const Checkout = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(0);
    const [auction, setAuction] = useState(null);
    const [loading, setLoading] = useState(true);
    const [paymentComplete, setPaymentComplete] = useState(false);

    useEffect(() => {
        const fetchAuction = async () => {
            try {
                const data = await getAuctionById(id);
                setAuction(data);
            } catch (error) {
                message.error('Failed to load auction details');
                navigate('/');
            } finally {
                setLoading(false);
            }
        };

        fetchAuction();
    }, [id, navigate]);

    const handlePaymentSuccess = () => {
        setCurrentStep(2);
        setPaymentComplete(true);
    };

    if (loading) {
        return (
            <div className='checkout-loading'>
                <Spin size='large' />
            </div>
        );
    }

    if (!auction) {
        return (
            <Result
                status='404'
                title='Auction not found'
                subTitle="The auction you're looking for does not exist."
                extra={
                    <Button type='primary' onClick={() => navigate('/')}>
                        Back Home
                    </Button>
                }
            />
        );
    }

    return (
        <>
            <Helmet>
                <title>Checkout | Auction Hub</title>
            </Helmet>

            <div className='checkout-container'>
                <Steps current={currentStep} className='checkout-steps'>
                    <Step title='Review' icon={<ShoppingCartOutlined />} />
                    <Step title='Payment' icon={<CreditCardOutlined />} />
                    <Step title='Complete' icon={<CheckCircleOutlined />} />
                </Steps>

                <Row gutter={24} className='checkout-content'>
                    <Col xs={24} lg={16}>
                        {currentStep === 0 && (
                            <Card
                                title='Review Your Purchase'
                                className='checkout-card'
                            >
                                <div className='auction-summary'>
                                    <img
                                        src={
                                            auction.images[0] ||
                                            '/placeholder.png'
                                        }
                                        alt={auction.title}
                                        className='auction-image'
                                    />
                                    <div className='auction-details'>
                                        <Title level={4}>{auction.title}</Title>
                                        <Text>
                                            Seller: {auction.seller.name}
                                        </Text>
                                        <Text strong>
                                            Final Bid:{' '}
                                            {formatCurrency(
                                                auction.currentPrice
                                            )}
                                        </Text>
                                    </div>
                                </div>
                                <div className='checkout-actions'>
                                    <Button
                                        type='primary'
                                        size='large'
                                        block
                                        onClick={() => setCurrentStep(1)}
                                    >
                                        Proceed to Payment
                                    </Button>
                                </div>
                            </Card>
                        )}

                        {currentStep === 1 && (
                            <Card
                                title='Payment Information'
                                className='checkout-card'
                            >
                                <Elements stripe={stripePromise}>
                                    <CheckoutForm
                                        auction={auction}
                                        onSuccess={handlePaymentSuccess}
                                    />
                                </Elements>
                            </Card>
                        )}

                        {currentStep === 2 && (
                            <Result
                                status='success'
                                title='Payment Successful!'
                                subTitle={`Thank you for your purchase. Your transaction ID is: ${auction.id}`}
                                extra={[
                                    <Button
                                        type='primary'
                                        key='profile'
                                        onClick={() =>
                                            navigate('/profile/purchases')
                                        }
                                    >
                                        View My Purchases
                                    </Button>,
                                    <Button
                                        key='home'
                                        onClick={() => navigate('/')}
                                    >
                                        Back to Home
                                    </Button>
                                ]}
                            />
                        )}
                    </Col>

                    <Col xs={24} lg={8}>
                        <Card
                            title='Order Summary'
                            className='order-summary-card'
                        >
                            <div className='summary-item'>
                                <Text>Item Price</Text>
                                <Text>
                                    {formatCurrency(auction.currentPrice)}
                                </Text>
                            </div>
                            <div className='summary-item'>
                                <Text>Processing Fee</Text>
                                <Text>
                                    {formatCurrency(
                                        auction.currentPrice * 0.05
                                    )}
                                </Text>
                            </div>
                            <Divider />
                            <div className='summary-item total'>
                                <Text strong>Total</Text>
                                <Text strong>
                                    {formatCurrency(
                                        auction.currentPrice * 1.05
                                    )}
                                </Text>
                            </div>
                        </Card>

                        <Card className='help-card'>
                            <Title level={5}>Need Help?</Title>
                            <Text>
                                If you have any questions about your purchase,
                                please contact our support team:
                            </Text>
                            <div className='help-contacts'>
                                <Text>Email: support@auctionhub.com</Text>
                                <Text>Phone: 1-800-AUCTION</Text>
                            </div>
                        </Card>
                    </Col>
                </Row>
            </div>
        </>
    );
};

export default Checkout;
