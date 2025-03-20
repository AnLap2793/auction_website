import React from 'react';
import { Carousel, Button, Typography, Space } from 'antd';
import { SearchOutlined, RightCircleOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const Hero = () => {
    const carouselStyle = {
        height: '500px',
        color: '#fff',
        textAlign: 'center',
        background: '#001529',
        position: 'relative'
    };

    const overlayStyle = {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '0 20px'
    };

    const slides = [
        {
            id: 1,
            image: 'https://media.istockphoto.com/id/1209088835/vi/anh/m%E1%BA%B7t-sau-c%E1%BB%A7a-ng%C6%B0%E1%BB%9Di-mua-gi%C6%A1-tay-cho-nh%C3%A0-%C4%91%E1%BA%A5u-gi%C3%A1-trong-qu%C3%A1-tr%C3%ACnh-%C4%91%E1%BA%A5u-gi%C3%A1.jpg?s=2048x2048&w=is&k=20&c=ssmNXqTqoaW09oQZZpDIlM_-ABpZ17F_yxOgTxMlFNU=',
            title: 'Find Unique Treasures',
            subtitle:
                'Discover exclusive items and place your bids in our exciting online auctions'
        },
        {
            id: 2,
            image: 'https://media.istockphoto.com/id/153062798/vi/anh/di%E1%BB%85n-gi%E1%BA%A3-k%C3%AAu-g%E1%BB%8Di-th%C3%A0nh-vi%C3%AAn-kh%C3%A1n-gi%E1%BA%A3.jpg?s=612x612&w=0&k=20&c=-XHkFfTQxHjtG9pPT82jbUe6HulZ83xlIbklbeIIe1k=',
            title: 'Luxury Watches & Jewelry',
            subtitle:
                'Bid on premium timepieces and stunning jewelry from renowned brands'
        },
        {
            id: 3,
            image: 'https://media.istockphoto.com/id/1434800254/vi/anh/m%E1%BB%99t-nh%C3%A0-%C4%91%E1%BA%A5u-gi%C3%A1-t%E1%BB%95-ch%E1%BB%A9c-m%E1%BB%99t-cu%E1%BB%99c-%C4%91%E1%BA%A5u-gi%C3%A1-v%E1%BB%9Bi-ng%C6%B0%E1%BB%9Di-mua.jpg?s=612x612&w=0&k=20&c=GDD4Io9G8TsN1UUAQP3enn272vMir45ATHHt6nwkJP4=',
            title: 'Art & Collectibles',
            subtitle:
                'Expand your collection with rare and valuable art pieces and collectibles'
        }
    ];

    return (
        <Carousel autoplay effect='fade'>
            {slides.map((slide) => (
                <div key={slide.id}>
                    <div
                        style={{
                            ...carouselStyle,
                            backgroundImage: `url(${slide.image})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                        }}
                    >
                        <div style={overlayStyle}>
                            <Title
                                style={{
                                    color: '#fff',
                                    fontSize: '2.5rem',
                                    marginBottom: '16px'
                                }}
                            >
                                {slide.title}
                            </Title>
                            <Paragraph
                                style={{
                                    color: '#fff',
                                    fontSize: '1.25rem',
                                    marginBottom: '24px'
                                }}
                            >
                                {slide.subtitle}
                            </Paragraph>
                            {/* <Space>
                                <Button
                                    type='primary'
                                    size='large'
                                    icon={<SearchOutlined />}
                                >
                                    Browse Auctions
                                </Button>
                                <Button
                                    size='large'
                                    style={{
                                        borderColor: '#fff',
                                        color: '#fff'
                                    }}
                                    icon={<RightCircleOutlined />}
                                >
                                    How It Works
                                </Button>
                            </Space> */}
                        </div>
                    </div>
                </div>
            ))}
        </Carousel>
    );
};

export default Hero;
