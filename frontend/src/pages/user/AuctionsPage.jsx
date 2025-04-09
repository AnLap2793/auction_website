import React, { useState, useEffect } from 'react';
import {
    Row,
    Col,
    Card,
    Typography,
    Tag,
    Badge,
    Select,
    Input,
    Pagination,
    Space,
    Divider,
    Statistic,
    Button,
    message,
    Empty,
    Modal,
    Form,
    Checkbox
} from 'antd';
import {
    SearchOutlined,
    FilterOutlined,
    HeartOutlined,
    ClockCircleOutlined,
    TagOutlined,
    FireOutlined,
    UserAddOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import auctionService from '../../services/auctionService';
import { getAllCategories } from '../../services/categoryService';
import { useAuth } from '../../context/AuthContext';

const { Title, Text, Paragraph } = Typography;
const { Meta } = Card;
const { Countdown } = Statistic;
const { Option } = Select;

const Auctions = () => {
    const { user } = useAuth();
    const [filter, setFilter] = useState('all');
    const [sortBy, setSortBy] = useState('ending-soon');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(12);
    const [auctions, setAuctions] = useState([]);
    const [totalAuctions, setTotalAuctions] = useState(0);
    const [categories, setCategories] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [registrations, setRegistrations] = useState({});
    const [isRegistrationModalVisible, setIsRegistrationModalVisible] =
        useState(false);
    const [selectedAuction, setSelectedAuction] = useState(null);
    const [form] = Form.useForm();

    useEffect(() => {
        fetchCategories();
        fetchAuctions();
    }, [currentPage, pageSize, filter, sortBy, searchTerm]);

    const fetchCategories = async () => {
        try {
            const categoriesData = await getAllCategories();
            //console.log('Đã nhận danh mục:', categoriesData);
            setCategories(categoriesData.data);
        } catch (error) {
            message.error('Không thể tải danh mục sản phẩm');
            //console.error('Lỗi khi tải danh mục:', error);
            setCategories([]);
        }
    };

    const fetchAuctions = async () => {
        setLoading(true);
        try {
            const baseFilters = {
                page: currentPage,
                limit: pageSize,
                search: searchTerm,
                sort: getSortParams(sortBy),
                status: ['active', 'pending'],
                isAdmin: false // Xác định đây là truy vấn từ phía người dùng
            };

            // Nếu lọc theo danh mục, thêm vào filter
            if (filter !== 'all') {
                baseFilters.category_id = filter;
            }

            //console.log('Gửi filters tới API:', baseFilters);
            const response = await auctionService.getAllAuctions(baseFilters);
            console.log('Dữ liệu nhận về từ API:', response);

            // Dữ liệu trả về từ API
            let auctionData = response.data || [];
            const totalCount = response.metadata?.total || 0;

            setAuctions(auctionData);
            setTotalAuctions(totalCount);

            // Lấy số lượt đăng ký cho mỗi phiên đấu giá
            const registrationsData = {};
            for (const auction of auctionData) {
                try {
                    const regResponse =
                        await auctionService.getAuctionRegistrations(
                            auction.id
                        );
                    registrationsData[auction.id] =
                        regResponse.data.total_registrations;
                } catch (error) {
                    console.error('Lỗi khi lấy số lượt đăng ký:', error);
                    message.error(
                        error.response?.data?.message ||
                            'Không thể lấy số lượt đăng ký'
                    );
                }
            }
            setRegistrations(registrationsData);
        } catch (error) {
            message.error('Không thể tải dữ liệu phiên đấu giá');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const getSortParams = (sortOption) => {
        switch (sortOption) {
            case 'ending-soon':
                return 'end_time:asc';
            case 'price-low':
                return 'starting_price:asc';
            case 'price-high':
                return 'starting_price:desc';
            case 'recently-added':
                return 'created_at:desc';
            default:
                return 'end_time:asc';
        }
    };

    const handleFilterChange = (value) => {
        setLoading(true);
        setFilter(value);
        setCurrentPage(1);
    };

    const handleSortChange = (value) => {
        setLoading(true);
        setSortBy(value);
        setCurrentPage(1);
    };

    const handlePageChange = (page, pageSize) => {
        setLoading(true);
        setCurrentPage(page);
        setPageSize(pageSize);
        // Scroll to top when changing pages
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSearch = (value) => {
        setLoading(true);
        setSearchTerm(value);
        setCurrentPage(1);
    };

    const resetFilters = () => {
        setLoading(true);
        setFilter('all');
        setSearchTerm('');
        setSortBy('ending-soon');
        setCurrentPage(1);
    };

    // Format time remaining for countdown
    const getTimeRemaining = (endDate) => {
        const endTime = new Date(endDate).getTime();
        return endTime;
    };

    const handleRegister = async (auction) => {
        if (!user) {
            message.error('Vui lòng đăng nhập để đăng ký tham gia đấu giá');
            return;
        }
        setSelectedAuction(auction);
        setIsRegistrationModalVisible(true);
    };

    const handleRegistrationSubmit = async () => {
        try {
            const values = await form.validateFields();
            const response = await auctionService.registerForAuction(
                selectedAuction.id
            );
            if (response.success) {
                message.success('Đăng ký tham gia đấu giá thành công');
                setIsRegistrationModalVisible(false);
                fetchAuctions(); // Refresh danh sách đấu giá
            }
        } catch (error) {
            message.error(error.message || 'Đăng ký thất bại');
        }
    };

    return (
        <div>
            <div
                style={{
                    backgroundColor: '#f7f7f7',
                    padding: '40px 20px',
                    minHeight: 'calc(100vh - 64px - 200px)'
                }}
            >
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    {/* Page Header */}
                    <div style={{ marginBottom: '30px', textAlign: 'center' }}>
                        <Title level={2}>Phiên Đấu Giá Hiện Tại</Title>
                        <Paragraph
                            style={{
                                fontSize: '16px',
                                maxWidth: '800px',
                                margin: '0 auto'
                            }}
                        >
                            Khám phá các sản phẩm độc đáo đang được đấu giá. Đặt
                            giá của bạn trước khi hết thời gian!
                        </Paragraph>
                    </div>

                    {/* Filters */}
                    <div
                        style={{
                            marginBottom: '30px',
                            padding: '20px',
                            backgroundColor: '#fff',
                            borderRadius: '8px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                        }}
                    >
                        <Row gutter={[16, 16]} align='middle'>
                            <Col xs={24} sm={24} md={8} lg={6}>
                                <Input.Search
                                    placeholder='Tìm kiếm phiên đấu giá...'
                                    allowClear
                                    enterButton={<SearchOutlined />}
                                    size='large'
                                    onSearch={handleSearch}
                                    loading={loading}
                                />
                            </Col>
                            <Col xs={24} sm={12} md={8} lg={6}>
                                <Space>
                                    <Text strong>
                                        <FilterOutlined /> Lọc theo:
                                    </Text>
                                    <Select
                                        defaultValue='all'
                                        style={{ width: 150 }}
                                        onChange={handleFilterChange}
                                        size='large'
                                        loading={loading}
                                        disabled={loading}
                                    >
                                        <Option value='all'>Tất cả</Option>
                                        {categories.map((category) => (
                                            <Option
                                                key={category.id}
                                                value={category.id}
                                            >
                                                {category.name}
                                            </Option>
                                        ))}
                                    </Select>
                                </Space>
                            </Col>
                            <Col xs={24} sm={12} md={8} lg={6}>
                                <Space>
                                    <Text strong>Sắp xếp theo:</Text>
                                    <Select
                                        defaultValue='ending-soon'
                                        style={{ width: 180 }}
                                        onChange={handleSortChange}
                                        size='large'
                                        loading={loading}
                                        disabled={loading}
                                    >
                                        <Option value='ending-soon'>
                                            Sắp kết thúc
                                        </Option>
                                        <Option value='price-low'>
                                            Giá: Thấp đến cao
                                        </Option>
                                        <Option value='price-high'>
                                            Giá: Cao đến thấp
                                        </Option>
                                        <Option value='recently-added'>
                                            Mới thêm
                                        </Option>
                                    </Select>
                                </Space>
                            </Col>
                            <Col
                                xs={24}
                                sm={24}
                                md={24}
                                lg={6}
                                style={{ textAlign: 'right' }}
                            >
                                <Text>
                                    Hiển thị {auctions.length} / {totalAuctions}{' '}
                                    phiên đấu giá
                                </Text>
                            </Col>
                        </Row>
                    </div>

                    {/* Auction Items Grid */}
                    <Row gutter={[24, 24]}>
                        {loading ? (
                            // Hiển thị skeleton loading cards
                            Array(pageSize)
                                .fill(null)
                                .map((_, index) => (
                                    <Col
                                        xs={24}
                                        sm={12}
                                        md={8}
                                        lg={6}
                                        key={`skeleton-${index}`}
                                    >
                                        <Card loading={true} hoverable />
                                    </Col>
                                ))
                        ) : auctions.length > 0 ? (
                            auctions.map((auction) => (
                                <Col
                                    xs={24}
                                    sm={12}
                                    md={8}
                                    lg={6}
                                    key={auction.id || auction._id}
                                >
                                    <Card
                                        loading={loading}
                                        hoverable
                                        cover={
                                            <div
                                                style={{
                                                    height: '200px',
                                                    overflow: 'hidden',
                                                    position: 'relative'
                                                }}
                                            >
                                                <img
                                                    alt={auction.product?.title}
                                                    src={
                                                        auction.Product
                                                            .ProductImages[0]
                                                            .image_url
                                                    }
                                                    style={{
                                                        width: '100%',
                                                        height: '100%',
                                                        objectFit: 'cover'
                                                    }}
                                                />
                                                <div
                                                    style={{
                                                        position: 'absolute',
                                                        bottom: '10px',
                                                        left: '10px',
                                                        background:
                                                            'rgba(0,0,0,0.7)',
                                                        padding: '5px 10px',
                                                        borderRadius: '4px'
                                                    }}
                                                >
                                                    <Countdown
                                                        value={getTimeRemaining(
                                                            auction.end_time
                                                        )}
                                                        format='D[d] H[h] m[m]'
                                                        valueStyle={{
                                                            color: '#fff',
                                                            fontSize: '14px'
                                                        }}
                                                        prefix={
                                                            <ClockCircleOutlined
                                                                style={{
                                                                    marginRight:
                                                                        '5px'
                                                                }}
                                                            />
                                                        }
                                                    />
                                                </div>
                                            </div>
                                        }
                                        actions={[
                                            auction.status === 'pending' ? (
                                                <Button
                                                    type='primary'
                                                    icon={<UserAddOutlined />}
                                                    onClick={() =>
                                                        handleRegister(auction)
                                                    }
                                                >
                                                    Đăng ký tham gia
                                                </Button>
                                            ) : (
                                                <Link
                                                    to={`/auctions/${auction.id}`}
                                                >
                                                    <Button
                                                        style={{
                                                            margin: '0 auto',
                                                            maxWidth: '100px'
                                                        }}
                                                        type={
                                                            auction.status ===
                                                            'active'
                                                                ? 'primary'
                                                                : 'default'
                                                        }
                                                        block
                                                    >
                                                        {auction.status ===
                                                        'active'
                                                            ? 'Đang diễn ra'
                                                            : 'Xem chi tiết'}
                                                    </Button>
                                                </Link>
                                            )
                                        ]}
                                    >
                                        <Meta
                                            title={
                                                <Link
                                                    to={`/auctions/${auction.id}`}
                                                >
                                                    {auction.Product?.title}
                                                </Link>
                                            }
                                            description={
                                                <Space
                                                    direction='vertical'
                                                    size={0}
                                                    style={{ width: '100%' }}
                                                >
                                                    <div>
                                                        <Tag
                                                            icon={
                                                                <TagOutlined />
                                                            }
                                                            color='blue'
                                                        >
                                                            {(() => {
                                                                const productCategoryId =
                                                                    auction
                                                                        .Product
                                                                        .category_id;
                                                                const matchedCategory =
                                                                    categories.find(
                                                                        (
                                                                            item
                                                                        ) =>
                                                                            item.id ===
                                                                            productCategoryId
                                                                    );
                                                                return (
                                                                    matchedCategory?.name ??
                                                                    'Không tìm thấy'
                                                                );
                                                            })()}
                                                        </Tag>
                                                    </div>
                                                    <Paragraph
                                                        ellipsis={{ rows: 2 }}
                                                        style={{
                                                            marginTop: '8px'
                                                        }}
                                                    >
                                                        {
                                                            auction.Product
                                                                ?.description
                                                        }
                                                    </Paragraph>
                                                    <Divider
                                                        style={{
                                                            margin: '8px 0'
                                                        }}
                                                    />
                                                    <div
                                                        style={{
                                                            display: 'flex',
                                                            justifyContent:
                                                                'space-between',
                                                            alignItems: 'center'
                                                        }}
                                                    >
                                                        <div>
                                                            <Text type='secondary'>
                                                                Giá khởi điểm
                                                            </Text>
                                                            <div>
                                                                <Text
                                                                    strong
                                                                    style={{
                                                                        fontSize:
                                                                            '16px'
                                                                    }}
                                                                >
                                                                    {Number(
                                                                        auction
                                                                            .Product
                                                                            .starting_price
                                                                    ).toLocaleString()}{' '}
                                                                    ₫
                                                                </Text>
                                                            </div>
                                                        </div>
                                                        <div
                                                            style={{
                                                                textAlign:
                                                                    'right'
                                                            }}
                                                        >
                                                            <Text type='secondary'>
                                                                Lượt đăng kí
                                                            </Text>
                                                            <div>
                                                                <Text>
                                                                    {
                                                                        registrations[
                                                                            auction
                                                                                .id
                                                                        ]
                                                                    }
                                                                </Text>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Space>
                                            }
                                        />
                                    </Card>
                                </Col>
                            ))
                        ) : (
                            <Col
                                span={24}
                                style={{
                                    textAlign: 'center',
                                    margin: '40px 0'
                                }}
                            >
                                <Empty description='Không tìm thấy phiên đấu giá nào phù hợp với điều kiện tìm kiếm' />
                            </Col>
                        )}
                    </Row>

                    {/* Registration Modal */}
                    <Modal
                        title='Đăng ký tham gia đấu giá'
                        open={isRegistrationModalVisible}
                        onCancel={() => setIsRegistrationModalVisible(false)}
                        footer={[
                            <Button
                                key='back'
                                onClick={() =>
                                    setIsRegistrationModalVisible(false)
                                }
                            >
                                Hủy
                            </Button>,
                            <Button
                                key='submit'
                                type='primary'
                                onClick={handleRegistrationSubmit}
                            >
                                Xác nhận đăng ký
                            </Button>
                        ]}
                    >
                        <Form form={form} layout='vertical'>
                            <Form.Item label='Thông tin phiên đấu giá'>
                                <Space direction='vertical'>
                                    <Text strong>
                                        {selectedAuction?.Product?.title}
                                    </Text>
                                    <Text type='secondary'>
                                        Bắt đầu:{' '}
                                        {new Date(
                                            selectedAuction?.start_time
                                        ).toLocaleString()}
                                    </Text>
                                    <Text type='secondary'>
                                        Kết thúc:{' '}
                                        {new Date(
                                            selectedAuction?.end_time
                                        ).toLocaleString()}
                                    </Text>
                                </Space>
                            </Form.Item>
                            <Form.Item
                                name='agreement'
                                valuePropName='checked'
                                rules={[
                                    {
                                        required: true,
                                        message:
                                            'Vui lòng đồng ý với điều khoản tham gia'
                                    }
                                ]}
                            >
                                <Checkbox>
                                    Tôi đồng ý với các điều khoản và điều kiện
                                    tham gia đấu giá
                                </Checkbox>
                            </Form.Item>
                        </Form>
                    </Modal>

                    {/* Pagination */}
                    <div style={{ marginTop: '40px', textAlign: 'center' }}>
                        {auctions.length === 0 && !loading ? (
                            <Button
                                onClick={resetFilters}
                                type='primary'
                                loading={loading}
                            >
                                Xem tất cả phiên đấu giá
                            </Button>
                        ) : (
                            <Pagination
                                current={currentPage}
                                total={totalAuctions}
                                pageSize={pageSize}
                                onChange={handlePageChange}
                                showSizeChanger={true}
                                pageSizeOptions={['12', '24', '36', '48']}
                                showTotal={(total, range) =>
                                    `${range[0]}-${range[1]} của ${total} phiên đấu giá`
                                }
                                disabled={loading}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Auctions;
