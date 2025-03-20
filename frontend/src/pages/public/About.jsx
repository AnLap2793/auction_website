import React from 'react';
import { Typography, Row, Col, Card, Avatar, Divider, Button } from 'antd';
import {
    Users,
    Trophy,
    ShieldCheck,
    Clock,
    ThumbsUp,
    Heart
} from 'lucide-react';

const { Title, Paragraph } = Typography;

const About = () => {
    const teamMembers = [
        {
            name: 'Jennifer Lee',
            role: 'CEO & Founder',
            bio: 'With over 15 years in the auction industry, Jennifer founded AuctionMaster to revolutionize online bidding.',
            avatar: 'https://randomuser.me/api/portraits/women/44.jpg'
        },
        {
            name: 'Michael Chen',
            role: 'CTO',
            bio: 'Michael leads our development team, ensuring AuctionMaster uses cutting-edge technology for secure and smooth auctions.',
            avatar: 'https://randomuser.me/api/portraits/men/32.jpg'
        },
        {
            name: 'Sarah Johnson',
            role: 'Head of Customer Relations',
            bio: 'Sarah ensures every customer has an exceptional experience on our platform from registration to winning bids.',
            avatar: 'https://randomuser.me/api/portraits/women/68.jpg'
        }
    ];

    const values = [
        {
            title: 'Trust',
            description:
                'We verify all sellers and items to ensure authenticity and build trust within our community.',
            icon: <ShieldCheck className='h-12 w-12 text-primary' />
        },
        {
            title: 'Excellence',
            description:
                'Our platform is designed for a seamless experience, from browsing to bidding to delivery.',
            icon: <Trophy className='h-12 w-12 text-primary' />
        },
        {
            title: 'Community',
            description:
                'We foster connections among collectors, enthusiasts, and sellers around the world.',
            icon: <Users className='h-12 w-12 text-primary' />
        },
        {
            title: 'Reliability',
            description:
                'Our secure bidding system ensures fair auctions and on-time transactions every time.',
            icon: <Clock className='h-12 w-12 text-primary' />
        },
        {
            title: 'Passion',
            description:
                'We are passionate about connecting unique items with people who will cherish them.',
            icon: <Heart className='h-12 w-12 text-primary' />
        },
        {
            title: 'Customer Focus',
            description:
                'Your satisfaction is our priority, with dedicated support available at every step.',
            icon: <ThumbsUp className='h-12 w-12 text-primary' />
        }
    ];

    return (
        <div
            style={{
                maxWidth: '1200px',
                margin: '0 auto',
                marginTop: '40px'
            }}
        >
            <div style={{ marginBottom: '20px' }}>
                <Title level={1} style={{ textAlign: 'center' }}>
                    About Auction
                </Title>

                <Row gutter={[24, 24]} justify='center'>
                    <Col>
                        <Card>
                            <Paragraph>
                                Founded in 2020, AuctionMaster has quickly
                                become the premier online destination for
                                collectors, enthusiasts, and sellers. Our
                                mission is to create the most trusted and
                                user-friendly auction platform in the world.
                            </Paragraph>
                        </Card>
                    </Col>
                </Row>
            </div>
            <Divider />
            <div className='mb-20' style={{ marginBottom: '20px' }}>
                <Title level={2} style={{ textAlign: 'center' }}>
                    Our Story
                </Title>
                <Row gutter={[24, 24]} justify='center'>
                    <Col>
                        <Card>
                            <Paragraph>
                                Auction began with a simple idea: create an
                                auction platform that puts users first. Our
                                founder, Jennifer Lee, experienced firsthand the
                                frustrations of online auctions – confusing
                                interfaces, hidden fees, and questionable
                                authenticity.
                            </Paragraph>
                            <Paragraph>
                                Drawing on her background in both technology and
                                traditional auction houses, Jennifer assembled a
                                team of experts passionate about creating
                                something better. Today, we host thousands of
                                auctions monthly, connecting unique items with
                                passionate buyers worldwide.
                            </Paragraph>
                            <Paragraph className='text-gray-700 mt-4'>
                                What sets us apart is our commitment to
                                transparency, security, and community. Every
                                seller is verified, every item is authenticated,
                                and our platform is designed to make bidding
                                intuitive and exciting.
                            </Paragraph>
                        </Card>
                    </Col>
                </Row>
            </div>
            <Divider />
            <div className='mb-20' style={{ marginBottom: '20px' }}>
                <Title level={2} style={{ textAlign: 'center' }}>
                    Our Values
                </Title>
                <Row gutter={[24, 24]}>
                    {values.map((value, index) => (
                        <Col xs={24} sm={12} lg={8} key={index}>
                            <Card>
                                <div className='flex justify-center mb-4'>
                                    {value.icon}
                                </div>
                                <Title level={4} className='mb-2'>
                                    {value.title}
                                </Title>
                                <Paragraph className='text-gray-600'>
                                    {value.description}
                                </Paragraph>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </div>
            <Divider />
            <div className='mb-20' style={{ marginBottom: '20px' }}>
                <Title level={2} style={{ textAlign: 'center' }}>
                    Our Team
                </Title>
                <Row gutter={[24, 24]} justify='center'>
                    {teamMembers.map((member, index) => (
                        <Col xs={24} sm={12} md={8} key={index}>
                            <Card>
                                <Avatar
                                    src={member.avatar}
                                    size={100}
                                    className='mb-4'
                                />
                                <Title level={4} className='mb-0'>
                                    {member.name}
                                </Title>
                                <p className='text-primary font-medium mb-2'>
                                    {member.role}
                                </p>
                                <Paragraph>{member.bio}</Paragraph>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </div>

            <Divider />
        </div>
    );
};

export default About;
