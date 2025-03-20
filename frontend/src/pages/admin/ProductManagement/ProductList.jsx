import React, { useState } from 'react';
import {
    Card,
    Row,
    Col,
    Modal,
    Typography,
    Descriptions,
    Image,
    Carousel,
    Space,
    Input
} from 'antd';
import moment from 'moment';
import { SearchOutlined } from '@ant-design/icons';

const { Meta } = Card;
const { Title, Text } = Typography;

// Giả lập dữ liệu từ API
const mockData = [
    {
        id: '550e8400-e29b-41d4-a716-446655440000',
        tieu_de: 'Sản phẩm 1',
        hinh_anh: [
            'https://i1-giaitri.vnecdn.net/2022/12/23/tranh-dat-nhat-nam-2022-6-1671774864.jpg?w=1200&h=0&q=100&dpr=1&fit=crop&s=CoBckktu6w2mrScw2rk7hA',
            'https://i1-giaitri.vnecdn.net/2022/12/23/tranh-dat-nhat-nam-2022-4-1671767439.jpg?w=1200&h=0&q=100&dpr=1&fit=crop&s=HBVhoZAtvu3uL-8jQGCnSA',
            'https://i1-giaitri.vnecdn.net/2022/12/23/tranh-dat-nhat-nam-2022-1-1671761008.jpg?w=1200&h=0&q=100&dpr=1&fit=crop&s=dqHqX8wIsC5SKMVowS6cuQ'
        ],
        mo_ta: 'Mô tả sản phẩm 1',
        gia_khoi_diem: 100.0,
        gia_hien_tai: 150.0,
        thoi_gian_tao: '2023-10-01T10:00:00Z'
    },
    {
        id: '550e8400-e29b-41d4-a716-446655440001',
        tieu_de: 'Sản phẩm 2',
        hinh_anh: [
            'https://i1-giaitri.vnecdn.net/2022/12/23/tranh-dat-nhat-nam-2022-8-1671776739.jpg?w=1200&h=0&q=100&dpr=1&fit=crop&s=6Ef2NJjcIfxPkuy6_sJZOA',
            'https://i1-giaitri.vnecdn.net/2022/12/23/tranh-dat-nhat-nam-2022-4-1671767439.jpg?w=1200&h=0&q=100&dpr=1&fit=crop&s=HBVhoZAtvu3uL-8jQGCnSA',
            'https://i1-giaitri.vnecdn.net/2022/12/23/tranh-dat-nhat-nam-2022-1-1671761008.jpg?w=1200&h=0&q=100&dpr=1&fit=crop&s=dqHqX8wIsC5SKMVowS6cuQ'
        ],
        mo_ta: 'Mô tả sản phẩm 2',
        gia_khoi_diem: 200.0,
        gia_hien_tai: 250.0,
        thoi_gian_tao: '2023-10-02T11:00:00Z'
    },
    {
        id: '550e8400-e29b-41d4-a716-446655440002',
        tieu_de: 'Sản phẩm 1',
        hinh_anh: [
            'https://i1-giaitri.vnecdn.net/2022/12/23/tranh-dat-nhat-nam-2022-2-1671762031.jpg?w=1200&h=0&q=100&dpr=1&fit=crop&s=iGELb-fLrG_DHqKWURfdIg',
            'https://i1-giaitri.vnecdn.net/2022/12/23/tranh-dat-nhat-nam-2022-4-1671767439.jpg?w=1200&h=0&q=100&dpr=1&fit=crop&s=HBVhoZAtvu3uL-8jQGCnSA',
            'https://i1-giaitri.vnecdn.net/2022/12/23/tranh-dat-nhat-nam-2022-1-1671761008.jpg?w=1200&h=0&q=100&dpr=1&fit=crop&s=dqHqX8wIsC5SKMVowS6cuQ'
        ],
        mo_ta: 'Mô tả sản phẩm 1',
        gia_khoi_diem: 100.0,
        gia_hien_tai: 150.0,
        thoi_gian_tao: '2023-10-01T10:00:00Z'
    },
    {
        id: '550e8400-e29b-41d4-a716-446655440003',
        tieu_de: 'Sản phẩm 1',
        hinh_anh: [
            'https://i1-giaitri.vnecdn.net/2022/12/23/tranh-dat-nhat-nam-2022-3-1671763899.jpg?w=1200&h=0&q=100&dpr=1&fit=crop&s=61siNmSSjBCp0_TCal3QHw',
            'https://i1-giaitri.vnecdn.net/2022/12/23/tranh-dat-nhat-nam-2022-4-1671767439.jpg?w=1200&h=0&q=100&dpr=1&fit=crop&s=HBVhoZAtvu3uL-8jQGCnSA',
            'https://i1-giaitri.vnecdn.net/2022/12/23/tranh-dat-nhat-nam-2022-1-1671761008.jpg?w=1200&h=0&q=100&dpr=1&fit=crop&s=dqHqX8wIsC5SKMVowS6cuQ'
        ],
        mo_ta: 'Mô tả sản phẩm 1',
        gia_khoi_diem: 100.0,
        gia_hien_tai: 150.0,
        thoi_gian_tao: '2023-10-01T10:00:00Z'
    },
    {
        id: '550e8400-e29b-41d4-a716-446655440004',
        tieu_de: 'Sản phẩm 1',
        hinh_anh: [
            'https://i1-giaitri.vnecdn.net/2022/12/23/tranh-dat-nhat-nam-2022-9-1671776887.jpg?w=1200&h=0&q=100&dpr=1&fit=crop&s=rd53unWbe0ksIHB9PV2H8Q',
            'https://i1-giaitri.vnecdn.net/2022/12/23/tranh-dat-nhat-nam-2022-4-1671767439.jpg?w=1200&h=0&q=100&dpr=1&fit=crop&s=HBVhoZAtvu3uL-8jQGCnSA',
            'https://i1-giaitri.vnecdn.net/2022/12/23/tranh-dat-nhat-nam-2022-1-1671761008.jpg?w=1200&h=0&q=100&dpr=1&fit=crop&s=dqHqX8wIsC5SKMVowS6cuQ'
        ],
        mo_ta: 'Mô tả sản phẩm 1',
        gia_khoi_diem: 100.0,
        gia_hien_tai: 150.0,
        thoi_gian_tao: '2023-10-01T10:00:00Z'
    }
];

const ProductList = () => {
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);

    const handleCardClick = (product) => {
        setSelectedProduct(product);
        setIsModalVisible(true);
    };

    const handleModalClose = () => {
        setIsModalVisible(false);
        setSelectedProduct(null);
    };

    return (
        <div style={{ padding: '24px' }}>
            <Title level={2}>Danh sách sản phẩm</Title>
            <Space style={{ marginBottom: '16px' }}>
                <Input
                    placeholder='Tìm kiếm theo tên'
                    prefix={<SearchOutlined />}
                    // value={searchText}
                    // onChange={(e) => handleSearch(e.target.value)}
                    style={{ width: 300 }}
                />
            </Space>
            <Row gutter={[16, 16]}>
                {mockData.map((product) => (
                    <Col key={product.id} xs={24} sm={12} md={8} lg={6}>
                        <Card
                            hoverable
                            onClick={() => handleCardClick(product)}
                            cover={
                                <img
                                    alt={product.tieu_de}
                                    src={product.hinh_anh[0]}
                                    style={{
                                        height: '200px',
                                        objectFit: 'cover'
                                    }}
                                />
                            }
                        >
                            <Meta
                                title={product.tieu_de}
                                description={
                                    <>
                                        <Text strong>Giá khởi điểm: </Text>
                                        <Text>
                                            {product.gia_khoi_diem.toLocaleString()}{' '}
                                            VND
                                        </Text>
                                        <br />
                                        <Text strong>Giá hiện tại: </Text>
                                        <Text>
                                            {product.gia_hien_tai.toLocaleString()}{' '}
                                            VND
                                        </Text>
                                    </>
                                }
                            />
                        </Card>
                    </Col>
                ))}
            </Row>

            <Modal
                title='Chi tiết sản phẩm'
                align='center'
                open={isModalVisible}
                onCancel={handleModalClose}
                footer={null}
            >
                {selectedProduct && (
                    <Row gutter={[16, 16]}>
                        <Col span={24}>
                            <Carousel arrows infinite={false}>
                                {Array.isArray(selectedProduct.hinh_anh) ? (
                                    selectedProduct.hinh_anh.map(
                                        (image, index) => (
                                            <div>
                                                <Image
                                                    key={index}
                                                    src={image}
                                                    alt={
                                                        selectedProduct.tieu_de
                                                    }
                                                    style={{
                                                        width: '50%',
                                                        borderRadius: '8px',
                                                        objectFit: 'cover',
                                                        margin: '0 auto'
                                                    }}
                                                />
                                            </div>
                                        )
                                    )
                                ) : (
                                    <div>
                                        <Image
                                            src={selectedProduct.hinh_anh}
                                            alt={selectedProduct.tieu_de}
                                            style={{
                                                width: '50%',
                                                borderRadius: '8px'
                                            }}
                                        />
                                    </div>
                                )}
                            </Carousel>
                        </Col>
                        <Col span={24}>
                            <Descriptions bordered column={1}>
                                <Descriptions.Item label='Tiêu đề'>
                                    {selectedProduct.tieu_de}
                                </Descriptions.Item>
                                <Descriptions.Item label='Mô tả'>
                                    {selectedProduct.mo_ta}
                                </Descriptions.Item>
                                <Descriptions.Item label='Giá khởi điểm'>
                                    {selectedProduct.gia_khoi_diem.toLocaleString()}{' '}
                                    VND
                                </Descriptions.Item>
                                <Descriptions.Item label='Giá hiện tại'>
                                    {selectedProduct.gia_hien_tai.toLocaleString()}{' '}
                                    VND
                                </Descriptions.Item>
                                <Descriptions.Item label='Thời gian tạo'>
                                    {moment(
                                        selectedProduct.thoi_gian_tao
                                    ).format('DD/MM/YYYY HH:mm')}
                                </Descriptions.Item>
                            </Descriptions>
                        </Col>
                    </Row>
                )}
            </Modal>
        </div>
    );
};

export default ProductList;
