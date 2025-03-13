import React from 'react';
import {
    Layout,
    Row,
    Col,
    Typography,
    Input,
    Button,
    Divider,
    Space
} from 'antd';
import { Link } from 'react-router-dom';
import {
    FacebookOutlined,
    TwitterOutlined,
    InstagramOutlined,
    LinkedinOutlined,
    MailOutlined
} from '@ant-design/icons';
import './Footer.less';

const { Footer: AntFooter } = Layout;
const { Title, Text, Paragraph } = Typography;

const Footer = () => {
    return (
        <AntFooter className='site-footer'>
            <div className='footer-content'>
                <Row gutter={[24, 24]}>
                    <Col xs={24} sm={24} md={8} lg={8}>
                        <div className='footer-section'>
                            <div className='footer-logo'>
                                <img src='/logo.svg' alt='Auction Hub' />
                                <span>Auction Hub</span>
                            </div>
                            <Paragraph>
                                The premier online auction platform for unique
                                and valuable items. Bid, win, and discover
                                treasures from around the world.
                            </Paragraph>
                            <Space className='social-icons'>
                                <a
                                    href='https://facebook.com'
                                    target='_blank'
                                    rel='noopener noreferrer'
                                >
                                    <FacebookOutlined />
                                </a>
                                <a
                                    href='https://twitter.com'
                                    target='_blank'
                                    rel='noopener noreferrer'
                                >
                                    <TwitterOutlined />
                                </a>
                                <a
                                    href='https://instagram.com'
                                    target='_blank'
                                    rel='noopener noreferrer'
                                >
                                    <InstagramOutlined />
                                </a>
                                <a
                                    href='https://linkedin.com'
                                    target='_blank'
                                    rel='noopener noreferrer'
                                >
                                    <LinkedinOutlined />
                                </a>
                            </Space>
                        </div>
                    </Col>

                    <Col xs={24} sm={12} md={8} lg={8}>
                        <div className='footer-section'>
                            <Title level={4}>Quick Links</Title>
                            <ul className='footer-links'>
                                <li>
                                    <Link to='/'>Home</Link>
                                </li>
                                <li>
                                    <Link to='/search'>Browse Auctions</Link>
                                </li>
                                <li>
                                    <Link to='/how-it-works'>How It Works</Link>
                                </li>
                                <li>
                                    <Link to='/about'>About Us</Link>
                                </li>
                                <li>
                                    <Link to='/contact'>Contact Us</Link>
                                </li>
                                <li>
                                    <Link to='/faq'>FAQ</Link>
                                </li>
                            </ul>
                        </div>
                    </Col>

                    <Col xs={24} sm={12} md={8} lg={8}>
                        <div className='footer-section'>
                            <Title level={4}>Newsletter</Title>
                            <Paragraph>
                                Subscribe to our newsletter for the latest
                                auction updates and exclusive offers.
                            </Paragraph>
                            <div className='newsletter-form'>
                                <Input
                                    placeholder='Your email address'
                                    prefix={<MailOutlined />}
                                    size='large'
                                />
                                <Button type='primary' size='large'>
                                    Subscribe
                                </Button>
                            </div>
                        </div>
                    </Col>
                </Row>

                <Divider style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />

                <div className='footer-bottom'>
                    <div className='copyright'>
                        <Text>
                            © {new Date().getFullYear()} Auction Hub. All rights
                            reserved.
                        </Text>
                    </div>
                    <div className='footer-bottom-links'>
                        <Link to='/terms'>Terms of Service</Link>
                        <Link to='/privacy'>Privacy Policy</Link>
                        <Link to='/cookies'>Cookie Policy</Link>
                    </div>
                </div>
            </div>
        </AntFooter>
    );
};

export default Footer;
