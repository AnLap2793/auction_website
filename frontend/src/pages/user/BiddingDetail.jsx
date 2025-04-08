import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
    Typography,
    Row,
    Col,
    Image,
    Descriptions,
    Card,
    Statistic,
    Tag,
    Button,
    Space,
    Divider,
    Input,
    Modal,
    Form,
    message,
    Spin
} from 'antd';
import {
    ClockCircleOutlined,
    UserOutlined,
    DollarOutlined,
    HeartOutlined,
    EyeOutlined,
    TagOutlined,
    HistoryOutlined
} from '@ant-design/icons';
import auctionService from '../../services/auctionService';
import { getAllCategories } from '../../services/categoryService';

const { Title, Text, Paragraph } = Typography;

const BiddingDetail = () => {
    const { id } = useParams();
    const [auction, setAuction] = useState(null);
    const [loading, setLoading] = useState(true);
    const [bidAmount, setBidAmount] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [category, setCategory] = useState(null);
    const [currentBids, setCurrentBids] = useState([]);

    useEffect(() => {
        fetchAuctionDetail();
    }, [id]);

    const fetchAuctionDetail = async () => {
        try {
            setLoading(true);
            // Lấy thông tin phiên đấu giá
            const response = await auctionService.getAuctionById(id);
            setAuction(response.data);

            // Thiết lập giá đặt mặc định
            const currentHighestBid =
                response.data.current_bid ||
                response.data.Product.starting_price;
            setBidAmount(currentHighestBid + 100000); // Tăng 100k từ giá cao nhất

            // Lấy thông tin danh mục
            const categoriesResponse = await getAllCategories();
            const categories = categoriesResponse.data;
            const matchedCategory = categories.find(
                (cat) => cat.id === response.data.Product.category_id
            );
            setCategory(matchedCategory);

            // Lấy lịch sử đấu giá
            const bidsResponse = await auctionService.getAuctionBids(id);
            setCurrentBids(bidsResponse.data || []);

            setLoading(false);
        } catch (error) {
            message.error('Không thể tải thông tin phiên đấu giá');
            console.error('Lỗi khi tải thông tin phiên đấu giá:', error);
            setLoading(false);
        }
    };

    const showBidModal = () => {
        setIsModalOpen(true);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    const handleBid = async () => {
        const currentHighestBid =
            auction.current_bid || auction.Product.starting_price;

        if (bidAmount <= currentHighestBid) {
            message.error('Giá đặt của bạn phải cao hơn giá hiện tại');
            return;
        }

        try {
            await auctionService.placeBid(auction.id, bidAmount);
            message.success(
                `Đã đặt giá thành công: ${bidAmount.toLocaleString()} ₫`
            );
            fetchAuctionDetail(); // Cập nhật lại thông tin đấu giá
            setIsModalOpen(false);
        } catch (error) {
            message.error(
                error.response?.data?.message ||
                    'Không thể đặt giá. Vui lòng thử lại sau.'
            );
            console.error('Lỗi khi đặt giá:', error);
        }
    };

    // Format time remaining for countdown
    const getTimeRemaining = (endDate) => {
        const endTime = new Date(endDate).getTime();
        return endTime;
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '100px 0' }}>
                <Spin size='large' />
                <p>Đang tải thông tin phiên đấu giá...</p>
            </div>
        );
    }

    if (!auction) {
        return (
            <div>
                <div style={{ padding: '50px 20px', textAlign: 'center' }}>
                    <Title level={3}>Không tìm thấy phiên đấu giá</Title>
                    <Text>
                        Phiên đấu giá bạn đang tìm kiếm không tồn tại hoặc đã bị
                        xóa.
                    </Text>
                </div>
            </div>
        );
    }

    const minimumBid =
        (auction.current_bid || auction.Product.starting_price) + 100000; // Tăng ít nhất 100k

    return (
        <div>
            <div
                style={{
                    padding: '30px 20px',
                    maxWidth: '1200px',
                    margin: '0 auto'
                }}
            >
                <Row gutter={[32, 32]}>
                    {/* Left column - Images */}
                    <Col xs={24} md={12}>
                        <Card>
                            <Image
                                src={
                                    auction.Product.ProductImages[0]?.image_url
                                }
                                alt={auction.Product.title}
                                style={{ width: '100%', height: 'auto' }}
                            />
                            <div style={{ marginTop: '20px' }}>
                                <Row gutter={[8, 8]}>
                                    {auction.Product.ProductImages.map(
                                        (img, index) => (
                                            <Col span={8} key={index}>
                                                <Image
                                                    src={img.image_url}
                                                    alt={`${
                                                        auction.Product.title
                                                    } view ${index + 1}`}
                                                    style={{
                                                        width: '100%',
                                                        height: 'auto',
                                                        cursor: 'pointer'
                                                    }}
                                                />
                                            </Col>
                                        )
                                    )}
                                </Row>
                            </div>
                        </Card>
                    </Col>

                    {/* Right column - Info and Bidding */}
                    <Col xs={24} md={12}>
                        <Card>
                            <Tag color='blue'>
                                {category?.name || 'Không phân loại'}
                            </Tag>
                            <Title level={2}>{auction.Product.title}</Title>

                            {/* Item stats */}
                            <Row gutter={16} style={{ marginBottom: '20px' }}>
                                <Col span={8}>
                                    <Statistic
                                        title='Giá hiện tại'
                                        value={
                                            auction.current_bid ||
                                            auction.Product.starting_price
                                        }
                                        precision={0}
                                        valueStyle={{ color: '#1890ff' }}
                                        prefix={<DollarOutlined />}
                                        suffix='₫'
                                        formatter={(value) =>
                                            `${Number(value).toLocaleString()}`
                                        }
                                    />
                                </Col>
                                <Col span={8}>
                                    <Statistic
                                        title='Lượt đấu giá'
                                        value={currentBids.length}
                                        prefix={<UserOutlined />}
                                    />
                                </Col>
                                <Col span={8}>
                                    <Statistic
                                        title='Lượt xem'
                                        value={auction.views || 0}
                                        prefix={<EyeOutlined />}
                                    />
                                </Col>
                            </Row>

                            {/* Auction timer */}
                            <Card
                                style={{
                                    marginBottom: '20px',
                                    background: '#f9f9f9'
                                }}
                                styles={{ padding: '15px' }}
                            >
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between'
                                    }}
                                >
                                    <div>
                                        <Text
                                            strong
                                            style={{ fontSize: '16px' }}
                                        >
                                            <ClockCircleOutlined /> Thời gian
                                            còn lại:
                                        </Text>
                                    </div>
                                    <div>
                                        <Statistic.Countdown
                                            value={getTimeRemaining(
                                                auction.end_time
                                            )}
                                            format='D [ngày] H [giờ] m [phút] s [giây]'
                                            valueStyle={{
                                                fontSize: '16px',
                                                fontWeight: 'bold'
                                            }}
                                        />
                                    </div>
                                </div>
                            </Card>

                            {/* Bidding actions */}
                            <Space
                                direction='vertical'
                                size='large'
                                style={{ width: '100%' }}
                            >
                                <Space direction='horizontal'>
                                    <Text>Nhập giá đấu tối đa của bạn:</Text>
                                    <Text type='secondary'>
                                        Giá tối thiểu:{' '}
                                        {minimumBid.toLocaleString()} ₫
                                    </Text>
                                </Space>
                                <Space.Compact>
                                    <Input
                                        style={{ width: 'calc(100% - 100px)' }}
                                        type='number'
                                        placeholder={minimumBid.toString()}
                                        value={bidAmount}
                                        onChange={(e) =>
                                            setBidAmount(
                                                parseInt(e.target.value)
                                            )
                                        }
                                        min={minimumBid}
                                    />
                                    <Button
                                        type='primary'
                                        style={{ width: '100px' }}
                                        onClick={showBidModal}
                                        disabled={auction.status !== 'active'}
                                    >
                                        Đặt giá
                                    </Button>
                                </Space.Compact>
                                <Space
                                    style={{
                                        width: '100%',
                                        justifyContent: 'space-between'
                                    }}
                                >
                                    <Button icon={<HeartOutlined />}>
                                        Thêm vào danh sách yêu thích
                                    </Button>
                                    <Button type='link'>Đặt câu hỏi</Button>
                                </Space>
                            </Space>

                            <Divider />

                            {/* Seller info */}
                            <div style={{ marginBottom: '20px' }}>
                                <Title level={5}>Thông tin người bán</Title>
                                <Space align='center'>
                                    <UserOutlined />
                                    <Text strong>
                                        {auction.Seller?.username ||
                                            'Người bán ẩn danh'}
                                    </Text>
                                    {auction.Seller?.rating && (
                                        <Tag color='green'>
                                            {auction.Seller.rating} ★
                                        </Tag>
                                    )}
                                </Space>
                            </div>

                            {/* Shipping info */}
                            <Descriptions bordered size='small' column={1}>
                                <Descriptions.Item label='Địa điểm'>
                                    {auction.Product.location ||
                                        'Không có thông tin'}
                                </Descriptions.Item>
                                <Descriptions.Item label='Thời gian bắt đầu'>
                                    {new Date(
                                        auction.start_time
                                    ).toLocaleString('vi-VN')}
                                </Descriptions.Item>
                                <Descriptions.Item label='Thời gian kết thúc'>
                                    {new Date(auction.end_time).toLocaleString(
                                        'vi-VN'
                                    )}
                                </Descriptions.Item>
                                <Descriptions.Item label='Tình trạng'>
                                    {auction.Product.condition ||
                                        'Không có thông tin'}
                                </Descriptions.Item>
                            </Descriptions>
                        </Card>
                    </Col>
                </Row>

                {/* Item details section */}
                <Row gutter={[32, 32]} style={{ marginTop: '30px' }}>
                    <Col span={24}>
                        <Card title='Mô tả sản phẩm'>
                            <Paragraph style={{ fontSize: '16px' }}>
                                {auction.Product.description}
                            </Paragraph>
                        </Card>
                    </Col>
                </Row>

                {/* Bid history section */}
                <Row gutter={[32, 32]} style={{ marginTop: '30px' }}>
                    <Col span={24}>
                        <Card
                            title={
                                <Space>
                                    <HistoryOutlined />
                                    <span>
                                        Lịch sử đấu giá ({currentBids.length}{' '}
                                        lượt)
                                    </span>
                                </Space>
                            }
                        >
                            {currentBids.length > 0 ? (
                                <table
                                    style={{
                                        width: '100%',
                                        borderCollapse: 'collapse'
                                    }}
                                >
                                    <thead>
                                        <tr
                                            style={{
                                                borderBottom:
                                                    '1px solid #f0f0f0'
                                            }}
                                        >
                                            <th
                                                style={{
                                                    padding: '12px 8px',
                                                    textAlign: 'left'
                                                }}
                                            >
                                                Người đấu giá
                                            </th>
                                            <th
                                                style={{
                                                    padding: '12px 8px',
                                                    textAlign: 'right'
                                                }}
                                            >
                                                Số tiền
                                            </th>
                                            <th
                                                style={{
                                                    padding: '12px 8px',
                                                    textAlign: 'right'
                                                }}
                                            >
                                                Thời gian
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentBids.map((bid, index) => (
                                            <tr
                                                key={index}
                                                style={{
                                                    borderBottom:
                                                        '1px solid #f0f0f0'
                                                }}
                                            >
                                                <td
                                                    style={{
                                                        padding: '12px 8px'
                                                    }}
                                                >
                                                    <Space>
                                                        <UserOutlined />
                                                        <Text>
                                                            {bid.User
                                                                ?.username ||
                                                                'Ẩn danh'}
                                                        </Text>
                                                        {index === 0 && (
                                                            <Tag color='green'>
                                                                Cao nhất
                                                            </Tag>
                                                        )}
                                                    </Space>
                                                </td>
                                                <td
                                                    style={{
                                                        padding: '12px 8px',
                                                        textAlign: 'right'
                                                    }}
                                                >
                                                    <Text strong>
                                                        {Number(
                                                            bid.bid_amount
                                                        ).toLocaleString()}{' '}
                                                        ₫
                                                    </Text>
                                                </td>
                                                <td
                                                    style={{
                                                        padding: '12px 8px',
                                                        textAlign: 'right'
                                                    }}
                                                >
                                                    <Text type='secondary'>
                                                        {new Date(
                                                            bid.created_at
                                                        ).toLocaleString(
                                                            'vi-VN'
                                                        )}
                                                    </Text>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div
                                    style={{
                                        textAlign: 'center',
                                        padding: '20px'
                                    }}
                                >
                                    <Text type='secondary'>
                                        Chưa có lượt đấu giá nào
                                    </Text>
                                </div>
                            )}
                        </Card>
                    </Col>
                </Row>
            </div>

            {/* Bidding Confirmation Modal */}
            <Modal
                title='Xác nhận đặt giá'
                open={isModalOpen}
                onCancel={handleCancel}
                footer={[
                    <Button key='back' onClick={handleCancel}>
                        Hủy bỏ
                    </Button>,
                    <Button key='submit' type='primary' onClick={handleBid}>
                        Xác nhận đặt giá
                    </Button>
                ]}
            >
                <p>
                    Bạn đang đặt giá{' '}
                    <strong>{bidAmount.toLocaleString()} ₫</strong> cho:
                </p>
                <p>
                    <strong>{auction.Product.title}</strong>
                </p>
                <Divider />
                <p>
                    Bằng việc xác nhận, bạn đồng ý với các điều khoản và điều
                    kiện của phiên đấu giá này.
                </p>
                <p>
                    Lưu ý: Giá đặt này có giá trị ràng buộc và không thể rút lại
                    sau khi đã đặt.
                </p>
            </Modal>
        </div>
    );
};

export default BiddingDetail;
