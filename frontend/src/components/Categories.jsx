import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Typography, Button, Spin, message } from 'antd';
import {
    ClockCircleOutlined,
    CarOutlined,
    HomeOutlined,
    GiftOutlined,
    CrownOutlined,
    BulbOutlined,
    CameraOutlined,
    TrophyOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { getAllCategories } from '../services/categoryService';

const { Title, Text } = Typography;

// Map icon component based on category name
const getIconComponent = (categoryName) => {
    const iconMap = {
        'Đồng Hồ & Trang Sức': ClockCircleOutlined,
        'Phương Tiện': CarOutlined,
        'Bất Động Sản': HomeOutlined,
        'Đồ Sưu Tầm': GiftOutlined,
        'Hàng Cao Cấp': CrownOutlined,
        'Nghệ Thuật': BulbOutlined,
        'Điện Tử': CameraOutlined,
        'Kỷ Vật Thể Thao': TrophyOutlined
    };

    const IconComponent = iconMap[categoryName] || GiftOutlined;
    return <IconComponent style={{ fontSize: '32px' }} />;
};

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await getAllCategories();
                if (response.success) {
                    const categoriesWithUI = response.data.map((category) => ({
                        ...category,
                        icon: getIconComponent(category.name),
                        color: '#1890ff'
                    }));
                    setCategories(categoriesWithUI);
                } else {
                    message.error('Không thể tải danh mục');
                }
            } catch (error) {
                console.error('Lỗi khi tải danh mục:', error);
                message.error('Đã xảy ra lỗi khi tải danh mục');
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <Spin size='large' tip='Đang tải...' />
            </div>
        );
    }

    return (
        <div style={{ padding: '60px 20px', backgroundColor: '#f7f7f7' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{ marginBottom: '40px', textAlign: 'center' }}>
                    <Title level={2}>Danh Mục Sản Phẩm</Title>
                    <Text type='secondary' style={{ fontSize: '16px' }}>
                        Khám phá các danh mục đấu giá đa dạng của chúng tôi
                    </Text>
                </div>

                <Row gutter={[16, 16]}>
                    {categories.map((category) => (
                        <Col xs={12} sm={8} md={6} key={category.id}>
                            <Link to={`/category/${category.id}`}>
                                <Card
                                    hoverable
                                    style={{
                                        textAlign: 'center',
                                        height: '100%'
                                    }}
                                    styles={{ padding: '20px 15px' }}
                                >
                                    <div
                                        style={{
                                            color: category.color,
                                            marginBottom: '15px',
                                            height: '60px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                    >
                                        {category.icon}
                                    </div>
                                    <Title
                                        level={5}
                                        style={{
                                            marginTop: 0,
                                            marginBottom: '5px'
                                        }}
                                    >
                                        {category.name}
                                    </Title>
                                    <Text type='secondary'>
                                        {category.itemCount || 0} sản phẩm
                                    </Text>
                                </Card>
                            </Link>
                        </Col>
                    ))}
                </Row>

                <div style={{ textAlign: 'center', marginTop: '40px' }}>
                    <Button type='default' size='large'>
                        Xem Tất Cả Danh Mục
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default Categories;
