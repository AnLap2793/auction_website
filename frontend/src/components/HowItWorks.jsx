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
            title: 'Tạo Tài Khoản',
            description:
                'Đăng ký và hoàn tất xác minh để bắt đầu đấu giá sản phẩm',
            icon: <UserAddOutlined />
        },
        {
            title: 'Tìm Sản Phẩm',
            description:
                'Duyệt qua danh mục hoặc tìm kiếm những sản phẩm bạn quan tâm',
            icon: <SearchOutlined />
        },
        {
            title: 'Đặt Giá',
            description:
                'Đặt giá tối đa và để hệ thống của chúng tôi tự động đấu giá theo từng bước',
            icon: <DollarCircleOutlined />
        },
        {
            title: 'Thắng & Nhận Hàng',
            description:
                'Nếu thắng, hoàn tất thanh toán và sắp xếp giao hàng hoặc nhận tại chỗ',
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
                <Title level={2}>Hướng Dẫn Sử Dụng</Title>
                <Paragraph
                    style={{
                        fontSize: '16px',
                        maxWidth: '800px',
                        margin: '0 auto'
                    }}
                >
                    AuctionMaster giúp đấu giá trực tuyến đơn giản và an toàn.
                    Làm theo các bước sau để bắt đầu thắng được những sản phẩm
                    tuyệt vời.
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
                    Tìm Hiểu Thêm Về Quy Trình
                </Button>
            </div>
        </div>
    );
};

export default HowItWorks;
