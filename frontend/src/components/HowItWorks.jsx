import React from 'react';
import { Row, Col, Typography, Steps, Card, Button } from 'antd';
import {
    UserAddOutlined,
    SearchOutlined,
    DollarCircleOutlined,
    TrophyOutlined,
    RightOutlined
} from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const HowItWorks = () => {
    const steps = [
        {
            title: 'Create an Account',
            description:
                'Sign up and complete verification to start bidding on items',
            icon: <UserAddOutlined />
        },
        {
            title: 'Find Items',
            description:
                "Browse categories or search for specific items you're interested in",
            icon: <SearchOutlined />
        },
        {
            title: 'Place Bids',
            description:
                'Set your maximum bid and let our system bid incrementally for you',
            icon: <DollarCircleOutlined />
        },
        {
            title: 'Win & Collect',
            description:
                'If you win, complete payment and arrange delivery or pickup',
            icon: <TrophyOutlined />
        }
    ];

    return (
        <div
            style={{
                padding: '60px 20px',
                maxWidth: '1200px',
                margin: '0 auto'
            }}
        >
            <div style={{ marginBottom: '40px', textAlign: 'center' }}>
                <Title level={2}>How It Works</Title>
                <Paragraph
                    style={{
                        fontSize: '16px',
                        maxWidth: '800px',
                        margin: '0 auto'
                    }}
                >
                    AuctionMaster makes online bidding simple and secure. Follow
                    these easy steps to start winning amazing items.
                </Paragraph>
            </div>

            <div
                style={{
                    display: 'none'
                }}
            >
                <Steps
                    items={steps.map((step, index) => ({
                        title: step.title,
                        description: step.description,
                        status: 'process',
                        icon: step.icon
                    }))}
                />
            </div>

            <div
                style={{
                    display: 'block'
                }}
            >
                <Row gutter={[16, 16]}>
                    {steps.map((step, index) => (
                        <Col span={24} key={index}>
                            <Card>
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center'
                                    }}
                                >
                                    <div
                                        style={{
                                            backgroundColor: '#1890ff',
                                            color: 'white',
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            marginRight: '15px'
                                        }}
                                    >
                                        {step.icon}
                                    </div>
                                    <div>
                                        <Title
                                            level={5}
                                            style={{ margin: '0 0 5px 0' }}
                                        >
                                            {step.title}
                                        </Title>
                                        <Paragraph style={{ margin: 0 }}>
                                            {step.description}
                                        </Paragraph>
                                    </div>
                                </div>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </div>

            <div style={{ textAlign: 'center', marginTop: '40px' }}>
                <Button type='primary' size='large' icon={<RightOutlined />}>
                    Learn More About Our Process
                </Button>
            </div>
        </div>
    );
};

export default HowItWorks;
