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
import {
    FacebookOutlined,
    TwitterOutlined,
    InstagramOutlined,
    YoutubeOutlined,
    MailOutlined,
    PhoneOutlined,
    EnvironmentOutlined,
    ArrowRightOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';

const { Footer } = Layout;
const { Title, Text, Paragraph } = Typography;

const AppFooter = () => {
    return (
        <Footer
            style={{
                background: '#001529',
                padding: '40px 20px 20px',
                color: '#fff'
            }}
        >
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <Row gutter={[24, 32]}>
                    <Col xs={24} sm={24} md={8} lg={8}>
                        <div>
                            <Title
                                level={3}
                                style={{ color: '#fff', marginBottom: '20px' }}
                            >
                                Auction
                            </Title>
                            <Paragraph style={{ color: '#ffffffcc' }}>
                                Your premier destination for online auctions.
                                Find unique items, bid with confidence, and win
                                amazing deals on our secure platform.
                            </Paragraph>
                            <Space size='middle'>
                                <Button
                                    shape='circle'
                                    icon={<FacebookOutlined />}
                                    style={{
                                        color: '#1890ff',
                                        background: 'transparent',
                                        borderColor: '#1890ff'
                                    }}
                                />
                                <Button
                                    shape='circle'
                                    icon={<TwitterOutlined />}
                                    style={{
                                        color: '#1890ff',
                                        background: 'transparent',
                                        borderColor: '#1890ff'
                                    }}
                                />
                                <Button
                                    shape='circle'
                                    icon={<InstagramOutlined />}
                                    style={{
                                        color: '#1890ff',
                                        background: 'transparent',
                                        borderColor: '#1890ff'
                                    }}
                                />
                                <Button
                                    shape='circle'
                                    icon={<YoutubeOutlined />}
                                    style={{
                                        color: '#1890ff',
                                        background: 'transparent',
                                        borderColor: '#1890ff'
                                    }}
                                />
                            </Space>
                        </div>
                    </Col>

                    <Col xs={24} sm={12} md={8} lg={8}>
                        <Title level={4} style={{ color: '#fff' }}>
                            Quick Links
                        </Title>
                        <Row>
                            <Col span={12}>
                                <ul style={{ listStyle: 'none', padding: 0 }}>
                                    <li style={{ marginBottom: '10px' }}>
                                        <Link
                                            to='/'
                                            style={{ color: '#ffffffcc' }}
                                        >
                                            Home
                                        </Link>
                                    </li>
                                    <li style={{ marginBottom: '10px' }}>
                                        <Link
                                            to='/auctions'
                                            style={{ color: '#ffffffcc' }}
                                        >
                                            All Auctions
                                        </Link>
                                    </li>
                                    <li style={{ marginBottom: '10px' }}>
                                        <Link
                                            to='/categories'
                                            style={{ color: '#ffffffcc' }}
                                        >
                                            Categories
                                        </Link>
                                    </li>
                                    <li style={{ marginBottom: '10px' }}>
                                        <Link
                                            to='/how-it-works'
                                            style={{ color: '#ffffffcc' }}
                                        >
                                            How It Works
                                        </Link>
                                    </li>
                                </ul>
                            </Col>
                            <Col span={12}>
                                <ul style={{ listStyle: 'none', padding: 0 }}>
                                    <li style={{ marginBottom: '10px' }}>
                                        <Link
                                            to='/about'
                                            style={{ color: '#ffffffcc' }}
                                        >
                                            About Us
                                        </Link>
                                    </li>
                                    <li style={{ marginBottom: '10px' }}>
                                        <Link
                                            to='/contact'
                                            style={{ color: '#ffffffcc' }}
                                        >
                                            Contact
                                        </Link>
                                    </li>
                                    <li style={{ marginBottom: '10px' }}>
                                        <Link
                                            to='/terms'
                                            style={{ color: '#ffffffcc' }}
                                        >
                                            Terms & Conditions
                                        </Link>
                                    </li>
                                    <li style={{ marginBottom: '10px' }}>
                                        <Link
                                            to='/privacy'
                                            style={{ color: '#ffffffcc' }}
                                        >
                                            Privacy Policy
                                        </Link>
                                    </li>
                                </ul>
                            </Col>
                        </Row>
                    </Col>

                    <Col xs={24} sm={12} md={8} lg={8}>
                        <Title level={4} style={{ color: '#fff' }}>
                            Newsletter
                        </Title>
                        <Paragraph style={{ color: '#ffffffcc' }}>
                            Subscribe to get the latest updates on new auctions
                            and exclusive offers.
                        </Paragraph>
                        <Space.Compact style={{ display: 'flex' }}>
                            <Input
                                style={{ width: 'calc(100% - 40px)' }}
                                placeholder='Enter your email'
                            />
                            <Button
                                type='primary'
                                icon={<ArrowRightOutlined />}
                            />
                        </Space.Compact>

                        <div style={{ marginTop: '20px' }}>
                            <Title level={4} style={{ color: '#fff' }}>
                                Contact
                            </Title>
                            <div style={{ marginBottom: '10px' }}>
                                <PhoneOutlined style={{ marginRight: '8px' }} />{' '}
                                +1 (234) 567-8900
                            </div>
                            <div style={{ marginBottom: '10px' }}>
                                <MailOutlined style={{ marginRight: '8px' }} />{' '}
                                info@master.com
                            </div>
                            <div>
                                <EnvironmentOutlined
                                    style={{ marginRight: '8px' }}
                                />{' '}
                                123 Auction Street, Bidvale, NY 10001
                            </div>
                        </div>
                    </Col>
                </Row>

                <Divider
                    style={{ background: '#ffffff33', margin: '30px 0 20px' }}
                />

                <div style={{ textAlign: 'center', color: '#ffffffcc' }}>
                    <Text style={{ color: '#ffffffcc' }}>
                        © {new Date().getFullYear()} AuctionMaster. All rights
                        reserved.
                    </Text>
                </div>
            </div>
        </Footer>
    );
};

export default AppFooter;
