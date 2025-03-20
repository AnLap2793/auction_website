import React, { useState } from 'react';
import {
    Typography,
    Row,
    Col,
    Card,
    Form,
    Input,
    Select,
    Divider,
    Button,
    message
} from 'antd';
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react';

const { Title, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const Contact = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const onFinish = (values) => {
        setLoading(true);

        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            form.resetFields();

            message.success('Message Sent Successfully');
        }, 1000);
    };

    const contactInfo = [
        {
            title: 'Visit Us',
            description: '123 Auction Ave, Suite 500, San Francisco, CA 94103',
            icon: <MapPin className='h-6 w-6 text-primary' />
        },
        {
            title: 'Call Us',
            description: '+1 (555) 123-4567',
            icon: <Phone className='h-6 w-6 text-primary' />
        },
        {
            title: 'Email Us',
            description: 'support@auctionmaster.com',
            icon: <Mail className='h-6 w-6 text-primary' />
        },
        {
            title: 'Business Hours',
            description: 'Monday to Friday: 9am - 5pm PST',
            icon: <Clock className='h-6 w-6 text-primary' />
        }
    ];

    const faqItems = [
        {
            question: 'How do I register for an auction?',
            answer: 'Registration is quick and easy. Simply click on the "Register" button in the top right corner of our website and follow the instructions. You\'ll need to provide some basic information and verify your email address to get started.'
        },
        {
            question: 'How does bidding work?',
            answer: "Once you're registered and logged in, you can place bids on any active auction. Set your maximum bid and our system will automatically bid for you up to that amount. You'll be notified when you're outbid or when you win an auction."
        },
        {
            question: 'What payment methods do you accept?',
            answer: 'We accept major credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers for auction payments. All transactions are processed securely through our encrypted payment system.'
        },
        {
            question: 'How is shipping handled?',
            answer: 'Shipping arrangements vary by seller. Each auction listing includes specific information about shipping costs and methods. Some sellers offer free shipping, while others charge based on your location.'
        }
    ];

    return (
        <div
            style={{
                padding: '50px 20px',
                background: '#f5f5f5'
            }}
        >
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <Card style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
                    <Title level={2} style={{ textAlign: 'center' }}>
                        Contact Us
                    </Title>
                    <Paragraph>
                        Have questions about AuctionMaster? Our team is here to
                        help! Reach out through any of the methods below or use
                        our contact form.
                    </Paragraph>
                    <Form
                        form={form}
                        layout='vertical'
                        onFinish={onFinish}
                        autoComplete='off'
                    >
                        <Row gutter={16}>
                            <Col xs={24} sm={12}>
                                <Form.Item
                                    name='name'
                                    label='Your Name'
                                    rules={[
                                        {
                                            required: true,
                                            message: 'Please enter your name'
                                        }
                                    ]}
                                >
                                    <Input
                                        placeholder='John Doe'
                                        size='large'
                                    />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={12}>
                                <Form.Item
                                    name='email'
                                    label='Email Address'
                                    rules={[
                                        {
                                            required: true,
                                            message: 'Please enter your email'
                                        },
                                        {
                                            type: 'email',
                                            message:
                                                'Please enter a valid email'
                                        }
                                    ]}
                                >
                                    <Input
                                        placeholder='john@example.com'
                                        size='large'
                                    />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Form.Item
                            name='subject'
                            label='Subject'
                            rules={[
                                {
                                    required: true,
                                    message: 'Please select a subject'
                                }
                            ]}
                        >
                            <Select placeholder='Select a subject' size='large'>
                                <Option value='general'>General Inquiry</Option>
                                <Option value='support'>
                                    Customer Support
                                </Option>
                                <Option value='feedback'>Feedback</Option>
                                <Option value='partnership'>
                                    Partnership Opportunity
                                </Option>
                                <Option value='other'>Other</Option>
                            </Select>
                        </Form.Item>
                        <Form.Item
                            name='message'
                            label='Message'
                            rules={[
                                {
                                    required: true,
                                    message: 'Please enter your message'
                                }
                            ]}
                        >
                            <TextArea
                                placeholder='How can we help you today?'
                                rows={5}
                                size='large'
                            />
                        </Form.Item>
                        <Form.Item>
                            <Button
                                type='primary'
                                htmlType='submit'
                                loading={loading}
                                style={{ width: '100%' }}
                            >
                                <Send className='mr-2' /> Send Message
                            </Button>
                        </Form.Item>
                    </Form>
                </Card>
            </div>
        </div>
    );
};

export default Contact;
