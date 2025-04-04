import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    Card,
    Tabs,
    Button,
    List,
    Tag,
    Modal,
    Form,
    Input,
    InputNumber,
    Upload,
    DatePicker,
    Select,
    Empty,
    Row,
    Col,
    Typography,
    Space,
    Divider,
    Table,
    message
} from 'antd';
import {
    ShoppingOutlined,
    PlusOutlined,
    UploadOutlined,
    TagOutlined,
    ClockCircleOutlined,
    DollarOutlined,
    FileTextOutlined,
    AppstoreOutlined,
    PlusSquareOutlined
} from '@ant-design/icons';
import { getProductBySellerID } from '../../services/productService';
import { getAllCategories } from '../../services/categoryService';
import auctionService from '../../services/auctionService';
const { TabPane } = Tabs;
const { Option } = Select;
const { TextArea } = Input;
const { Title, Text, Paragraph } = Typography;

const MyAuctions = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isProductModalVisible, setIsProductModalVisible] = useState(false);
    const [form] = Form.useForm();
    const [productForm] = Form.useForm();
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [activeAuctions, setActiveAuctions] = useState([]);
    const [completedAuctions, setCompletedAuctions] = useState([]);
    const [categories, setCategories] = useState([]);
    const [registrations, setRegistrations] = useState({});

    // Kiểm tra nếu người dùng không phải là người bán hoặc chưa đăng nhập
    useEffect(() => {
        if (!user) {
            message.error('Vui lòng đăng nhập để truy cập trang này!');
            navigate('/login');
            return;
        }

        if (user.role !== 'seller') {
            message.error('Trang này chỉ dành cho người bán!');
            navigate('/');
        }
        fetchProductBySellerID();
        fetchCategories();
        //Lấy sản phẩm của người bán
    }, [user, navigate]);

    // Hiển thị trang loading trong khi kiểm tra
    if (!user || user.role !== 'seller') {
        return null; // Không hiển thị gì trong khi chờ chuyển hướng
    }

    // Lấy danh mục từ API
    const fetchCategories = async () => {
        try {
            const response = await getAllCategories();
            setCategories(response.data);
        } catch (error) {
            message.error('Lỗi khi lấy danh mục');
        }
    };

    //Lấy sản phẩm của người bán
    const fetchProductBySellerID = async () => {
        try {
            const response = await getProductBySellerID(user.id);
            //console.log(response.data[0].Auctions);
            const formattedProducts = response.data.map((product) => ({
                id: product.id,
                name: product.title,
                description: product.description,
                category: product.Category.name,
                startingPrice: product.starting_price,
                images: product.ProductImages.map((img) => img.image_url),
                addedDate: new Date(product.created_at).toLocaleDateString(
                    'vi-VN'
                ),
                seller: {
                    id: product.User.id,
                    firstName: product.User.first_name,
                    lastName: product.User.last_name,
                    email: product.User.email
                },
                auctions: product.Auctions.length > 0 ? product.Auctions : [],
                auctionStatus:
                    product.Auctions.length > 0
                        ? product.Auctions[0].status
                        : 'available'
            }));
            //console.log(formattedProducts.map((p) => p.auctions));
            setProducts(formattedProducts);

            // Xử lý dữ liệu các phiên đấu giá từ sản phẩm
            const auctionsFromProducts = [];
            formattedProducts.forEach((product) => {
                if (product.auctions && product.auctions.length > 0) {
                    product.auctions.forEach((auction) => {
                        auctionsFromProducts.push({
                            id: auction.id,
                            title: product.name,
                            description: product.description,
                            startingPrice: parseFloat(product.startingPrice),
                            currentBid: parseFloat(product.startingPrice), // Cần cập nhật từ API thực tế
                            bidCount: 0, // Cần cập nhật từ API thực tế
                            endDate: new Date(
                                auction.end_time
                            ).toLocaleDateString('vi-VN'),
                            timeLeft: getTimeLeft(auction.end_time),
                            imageUrl:
                                product.images[0] ||
                                'https://via.placeholder.com/150',
                            category: product.category,
                            productIds: [product.id],
                            status: auction.status,
                            startTime: new Date(
                                auction.start_time
                            ).toLocaleDateString('vi-VN'),
                            bidIncrement: parseFloat(auction.bid_increment)
                        });
                    });
                }
            });
            console.log(auctionsFromProducts);

            // Phân loại phiên đấu giá theo trạng thái
            const active = auctionsFromProducts.filter(
                (auction) => auction.status === 'active'
            );
            const completed = auctionsFromProducts.filter(
                (auction) =>
                    auction.status === 'closed' || auction.status === 'canceled'
            );

            setActiveAuctions(active);
            setCompletedAuctions(completed);

            // Lấy số lượt đăng ký đấu giá cho từng phiên đấu giá
            const fetchRegistrationsData = async () => {
                const registrationsData = {};

                for (const auction of auctionsFromProducts) {
                    try {
                        const regResponse =
                            await auctionService.getAuctionRegistrations(
                                auction.id
                            );
                        const updatedAuctions = [...active, ...completed].map(
                            (a) => {
                                if (a.id === auction.id) {
                                    return {
                                        ...a,
                                        bidCount:
                                            regResponse.data
                                                .total_registrations || 0
                                    };
                                }
                                return a;
                            }
                        );

                        // Cập nhật lại danh sách đấu giá
                        const updatedActive = updatedAuctions.filter(
                            (a) => a.status === 'active'
                        );
                        const updatedCompleted = updatedAuctions.filter(
                            (a) =>
                                a.status === 'closed' || a.status === 'canceled'
                        );

                        setActiveAuctions(updatedActive);
                        setCompletedAuctions(updatedCompleted);

                        // Lưu vào state registrations nếu cần
                        registrationsData[auction.id] =
                            regResponse.data.total_registrations || 0;
                    } catch (error) {
                        console.error(
                            `Lỗi khi lấy số lượt đăng ký cho phiên đấu giá ${auction.id}:`,
                            error
                        );
                    }
                }

                setRegistrations(registrationsData);
            };

            // Gọi hàm lấy số lượt đăng ký
            if (auctionsFromProducts.length > 0) {
                fetchRegistrationsData();
            }
        } catch (error) {
            message.error('Lỗi không lấy được dữ liệu');
        }
    };

    // Hàm tính thời gian còn lại
    const getTimeLeft = (endTime) => {
        const end = new Date(endTime);
        const now = new Date();

        if (now > end) return 'Đã kết thúc';

        const diffTime = Math.abs(end - now);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        const diffHours = Math.floor(
            (diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );

        return `${diffDays}d ${diffHours}h`;
    };

    const conditions = ['New', 'Like New', 'Excellent', 'Good', 'Fair', 'Poor'];

    const handleCreateAuction = () => {
        setIsModalVisible(true);
    };

    const handleCreateProduct = () => {
        setIsProductModalVisible(true);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        form.resetFields();
        setSelectedProducts([]);
    };

    const handleProductCancel = () => {
        setIsProductModalVisible(false);
        productForm.resetFields();
    };

    // Thêm hàm để kết thúc phiên đấu giá sớm
    const handleEndAuctionEarly = (auctionId) => {
        Modal.confirm({
            title: 'Kết thúc phiên đấu giá sớm',
            content:
                'Bạn có chắc chắn muốn kết thúc phiên đấu giá này sớm không? Hành động này không thể hoàn tác.',
            okText: 'Đồng ý',
            cancelText: 'Hủy',
            onOk: async () => {
                try {
                    // Trong thực tế, gọi API để kết thúc phiên đấu giá
                    // await endAuctionEarly(auctionId);

                    // Cập nhật UI
                    const updatedActiveAuctions = activeAuctions.filter(
                        (auction) => auction.id !== auctionId
                    );

                    // Tìm phiên đấu giá đã kết thúc và thêm vào danh sách hoàn thành
                    const endedAuction = activeAuctions.find(
                        (auction) => auction.id === auctionId
                    );

                    if (endedAuction) {
                        // Nếu có đấu giá, coi như đã bán
                        const status =
                            endedAuction.bidCount > 0 ? 'sold' : 'not_sold';
                        const endedAuctionWithStatus = {
                            ...endedAuction,
                            status,
                            finalPrice:
                                endedAuction.bidCount > 0
                                    ? endedAuction.currentBid
                                    : 0,
                            endDate: new Date().toISOString().split('T')[0]
                        };

                        setCompletedAuctions([
                            endedAuctionWithStatus,
                            ...completedAuctions
                        ]);
                    }

                    setActiveAuctions(updatedActiveAuctions);
                    message.success('Đã kết thúc phiên đấu giá');
                } catch (error) {
                    message.error('Lỗi khi kết thúc phiên đấu giá');
                }
            }
        });
    };

    const handleSubmit = (values) => {
        console.log('Submitted auction:', values);
        console.log('Selected products:', selectedProducts);
        // In a real app, you would submit this to your backend

        // Thêm xử lý tạo đấu giá mới
        try {
            // Giả lập API call
            // const response = await createAuction(values, selectedProducts);

            // Cập nhật trạng thái sản phẩm thành "in_auction"
            const updatedProducts = products.map((product) => {
                if (
                    selectedProducts.some(
                        (selected) => selected.id === product.id
                    )
                ) {
                    return { ...product, auctionStatus: 'in_auction' };
                }
                return product;
            });

            // Tạo đấu giá mới
            const newAuction = {
                id:
                    activeAuctions.length > 0
                        ? Math.max(...activeAuctions.map((a) => a.id)) + 1
                        : 1,
                title: values.title,
                description: values.description,
                startingPrice: values.startingPrice,
                currentBid: values.startingPrice, // Ban đầu giá hiện tại = giá khởi điểm
                bidCount: 0,
                endDate: values.endDate.format('YYYY-MM-DD'),
                timeLeft: '30d', // Tính toán thời gian còn lại
                imageUrl:
                    selectedProducts[0]?.images[0] ||
                    'https://via.placeholder.com/150',
                category: selectedProducts[0]?.category || 'Other',
                productIds: selectedProducts.map((p) => p.id),
                status: 'active'
            };

            // Cập nhật state
            setActiveAuctions([...activeAuctions, newAuction]);
            setProducts(updatedProducts);

            message.success('Đã tạo phiên đấu giá mới thành công!');
        } catch (error) {
            message.error('Lỗi khi tạo phiên đấu giá');
        }

        setIsModalVisible(false);
        form.resetFields();
        setSelectedProducts([]);
    };

    const handleProductSubmit = (values) => {
        console.log('Submitted product:', values);
        // In a real app, you would submit this to your backend and get an ID
        const newProduct = {
            id: products.length + 1,
            name: values.name,
            description: values.description,
            category: values.category,
            condition: values.condition,
            images: values.images
                ? values.images.map((img) =>
                      URL.createObjectURL(img.originFileObj)
                  )
                : [],
            addedDate: new Date().toISOString().split('T')[0]
        };

        setProducts([...products, newProduct]);
        setIsProductModalVisible(false);
        productForm.resetFields();
    };

    const normFile = (e) => {
        if (Array.isArray(e)) {
            return e;
        }
        return e?.fileList;
    };

    const rowSelection = {
        onChange: (selectedRowKeys, selectedRows) => {
            setSelectedProducts(selectedRows);
        }
    };

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
            <Row
                justify='space-between'
                align='middle'
                style={{ marginBottom: '24px' }}
            >
                <Col>
                    <Title level={2}>Trang Người Bán</Title>
                </Col>
                <Col>
                    <Space>
                        <Button
                            type='primary'
                            icon={<PlusSquareOutlined />}
                            onClick={handleCreateProduct}
                        >
                            Thêm Sản Phẩm Mới
                        </Button>
                        <Button
                            type='primary'
                            icon={<PlusOutlined />}
                            onClick={handleCreateAuction}
                        >
                            Tạo Phiên Đấu Giá Mới
                        </Button>
                    </Space>
                </Col>
            </Row>

            <Card>
                <Tabs
                    defaultActiveKey='products'
                    items={[
                        {
                            key: 'products',
                            label: (
                                <span>
                                    <AppstoreOutlined /> Sản Phẩm Của Tôi (
                                    {products.length})
                                </span>
                            ),
                            children:
                                products.length > 0 ? (
                                    <Table
                                        dataSource={products}
                                        rowKey='id'
                                        pagination={{ pageSize: 5 }}
                                    >
                                        <Table.Column
                                            title='Hình Ảnh'
                                            dataIndex='images'
                                            key='images'
                                            render={(images) => (
                                                <img
                                                    src={images[0]}
                                                    alt='Sản phẩm'
                                                    style={{
                                                        width: '60px',
                                                        height: '60px',
                                                        objectFit: 'cover'
                                                    }}
                                                />
                                            )}
                                        />
                                        <Table.Column
                                            title='Tên Sản Phẩm'
                                            dataIndex='name'
                                            key='name'
                                            render={(text) => (
                                                <Text strong>{text}</Text>
                                            )}
                                        />
                                        <Table.Column
                                            title='Mô Tả'
                                            dataIndex='description'
                                            key='description'
                                            render={(text) => (
                                                <Text>{text}</Text>
                                            )}
                                        />
                                        <Table.Column
                                            title='Danh Mục'
                                            dataIndex='category'
                                            key='category'
                                            render={(text) => {
                                                const category =
                                                    categories.find(
                                                        (c) => c.id === text
                                                    );
                                                return (
                                                    <Tag color='blue'>
                                                        {category
                                                            ? category.name
                                                            : text}
                                                    </Tag>
                                                );
                                            }}
                                        />
                                        <Table.Column
                                            title='Giá Khởi Điểm'
                                            dataIndex='startingPrice'
                                            key='startingPrice'
                                            render={(price) => (
                                                <Text strong>
                                                    {Number(
                                                        price
                                                    ).toLocaleString(
                                                        'vi-VN'
                                                    )}{' '}
                                                    VNĐ
                                                </Text>
                                            )}
                                        />
                                        <Table.Column
                                            title='Ngày Thêm'
                                            dataIndex='addedDate'
                                            key='addedDate'
                                        />
                                        <Table.Column
                                            title='Thao Tác'
                                            key='actions'
                                            render={(_, record) => (
                                                <Space>
                                                    {record.auctionStatus ===
                                                    'available' ? (
                                                        <div>
                                                            <Button size='small'>
                                                                Chỉnh Sửa
                                                            </Button>{' '}
                                                            <Button
                                                                size='small'
                                                                type='primary'
                                                                onClick={() => {
                                                                    setIsModalVisible(
                                                                        true
                                                                    );
                                                                    setSelectedProducts(
                                                                        [record]
                                                                    );
                                                                }}
                                                            >
                                                                Đấu Giá Ngay
                                                            </Button>{' '}
                                                        </div>
                                                    ) : (
                                                        <Tag color='success'>
                                                            Đã đấu giá
                                                        </Tag>
                                                    )}
                                                </Space>
                                            )}
                                        />
                                    </Table>
                                ) : (
                                    <Empty
                                        description='Bạn chưa có sản phẩm nào'
                                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                                    >
                                        <Button
                                            type='primary'
                                            onClick={handleCreateProduct}
                                        >
                                            Thêm Sản Phẩm Mới
                                        </Button>
                                    </Empty>
                                )
                        },
                        {
                            key: 'active',
                            label: (
                                <span>
                                    <ShoppingOutlined /> Phiên đấu giá của tôi (
                                    {activeAuctions.length})
                                </span>
                            ),
                            children:
                                activeAuctions.length > 0 ? (
                                    <Row gutter={[16, 16]}>
                                        {activeAuctions.map((auction) => (
                                            <Col
                                                xs={24}
                                                sm={12}
                                                lg={8}
                                                key={auction.id}
                                            >
                                                <Card
                                                    hoverable
                                                    cover={
                                                        <img
                                                            alt={auction.title}
                                                            src={
                                                                auction.imageUrl
                                                            }
                                                            style={{
                                                                height: '200px',
                                                                objectFit:
                                                                    'cover'
                                                            }}
                                                        />
                                                    }
                                                    actions={[
                                                        <Link
                                                            to={`/auction/${auction.id}`}
                                                        >
                                                            Xem Chi Tiết
                                                        </Link>,
                                                        <Button
                                                            type='text'
                                                            danger
                                                            onClick={() =>
                                                                handleEndAuctionEarly(
                                                                    auction.id
                                                                )
                                                            }
                                                        >
                                                            Kết Thúc Sớm
                                                        </Button>
                                                    ]}
                                                >
                                                    <Space
                                                        direction='vertical'
                                                        style={{
                                                            width: '100%'
                                                        }}
                                                    >
                                                        <Tag color='blue'>
                                                            {auction.category}
                                                        </Tag>
                                                        <Title
                                                            level={4}
                                                            style={{
                                                                margin: '8px 0'
                                                            }}
                                                        >
                                                            {auction.title}
                                                        </Title>
                                                        <Paragraph
                                                            ellipsis={{
                                                                rows: 2
                                                            }}
                                                        >
                                                            {
                                                                auction.description
                                                            }
                                                        </Paragraph>
                                                        <Divider
                                                            style={{
                                                                margin: '12px 0'
                                                            }}
                                                        />
                                                        <Row gutter={[8, 8]}>
                                                            <Col span={12}>
                                                                <Text type='secondary'>
                                                                    Current Bid
                                                                </Text>
                                                                <br />
                                                                <Text
                                                                    strong
                                                                    style={{
                                                                        color: '#1890ff'
                                                                    }}
                                                                >
                                                                    {auction.currentBid.toLocaleString(
                                                                        'vi-VN'
                                                                    )}{' '}
                                                                    VNĐ
                                                                </Text>
                                                            </Col>
                                                            <Col span={12}>
                                                                <Text type='secondary'>
                                                                    Bids
                                                                </Text>
                                                                <br />
                                                                <Text strong>
                                                                    {
                                                                        auction.bidCount
                                                                    }
                                                                </Text>
                                                            </Col>
                                                            <Col span={12}>
                                                                <Text type='secondary'>
                                                                    Starting
                                                                    Price
                                                                </Text>
                                                                <br />
                                                                <Text strong>
                                                                    {auction.startingPrice.toLocaleString(
                                                                        'vi-VN'
                                                                    )}{' '}
                                                                    VNĐ
                                                                </Text>
                                                            </Col>
                                                            <Col span={12}>
                                                                <Text type='secondary'>
                                                                    Time Left
                                                                </Text>
                                                                <br />
                                                                <Text
                                                                    strong
                                                                    style={{
                                                                        color: '#fa8c16'
                                                                    }}
                                                                >
                                                                    {
                                                                        auction.timeLeft
                                                                    }
                                                                </Text>
                                                            </Col>
                                                            <Col span={12}>
                                                                <Text type='secondary'>
                                                                    Thời gian
                                                                    bắt đầu
                                                                </Text>
                                                                <br />
                                                                <Text strong>
                                                                    {
                                                                        auction.startTime
                                                                    }
                                                                </Text>
                                                            </Col>
                                                            <Col span={12}>
                                                                <Text type='secondary'>
                                                                    Bước giá
                                                                </Text>
                                                                <br />
                                                                <Text strong>
                                                                    {auction.bidIncrement.toLocaleString(
                                                                        'vi-VN'
                                                                    )}{' '}
                                                                    VNĐ
                                                                </Text>
                                                            </Col>
                                                        </Row>
                                                    </Space>
                                                </Card>
                                            </Col>
                                        ))}
                                    </Row>
                                ) : (
                                    <Empty
                                        description='Bạn không có phiên đấu giá nào đang diễn ra'
                                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                                    />
                                )
                        },
                        {
                            key: 'completed',
                            label: (
                                <span>
                                    <UploadOutlined /> Đã Hoàn Thành (
                                    {completedAuctions.length})
                                </span>
                            ),
                            children: (
                                <Table
                                    dataSource={completedAuctions}
                                    rowKey='id'
                                    pagination={{ pageSize: 5 }}
                                >
                                    <Table.Column
                                        title='Sản Phẩm'
                                        dataIndex='title'
                                        key='title'
                                        render={(text) => (
                                            <Text strong>{text}</Text>
                                        )}
                                    />
                                    <Table.Column
                                        title='Danh Mục'
                                        dataIndex='category'
                                        key='category'
                                        render={(text) => (
                                            <Tag color='blue'>{text}</Tag>
                                        )}
                                    />
                                    <Table.Column
                                        title='Giá Khởi Điểm'
                                        dataIndex='startingPrice'
                                        key='startingPrice'
                                        render={(price) =>
                                            `${price.toLocaleString(
                                                'vi-VN'
                                            )} VNĐ`
                                        }
                                    />
                                    <Table.Column
                                        title='Giá Cuối Cùng'
                                        dataIndex='finalPrice'
                                        key='finalPrice'
                                        render={(price) => (
                                            <Text strong>
                                                {price
                                                    ? price.toLocaleString(
                                                          'vi-VN'
                                                      )
                                                    : 0}{' '}
                                                VNĐ
                                            </Text>
                                        )}
                                    />
                                    <Table.Column
                                        title='Lượt Đấu Giá'
                                        dataIndex='bidCount'
                                        key='bidCount'
                                    />
                                    <Table.Column
                                        title='Bắt Đầu'
                                        dataIndex='startTime'
                                        key='startTime'
                                    />
                                    <Table.Column
                                        title='Kết Thúc'
                                        dataIndex='endDate'
                                        key='endDate'
                                    />
                                    <Table.Column
                                        title='Trạng Thái'
                                        dataIndex='status'
                                        key='status'
                                        render={(status) => (
                                            <Tag
                                                color={
                                                    status === 'sold'
                                                        ? 'success'
                                                        : status === 'closed'
                                                        ? 'processing'
                                                        : 'default'
                                                }
                                            >
                                                {status === 'sold'
                                                    ? 'Đã Bán'
                                                    : status === 'closed'
                                                    ? 'Đã Đóng'
                                                    : 'Đã Hủy'}
                                            </Tag>
                                        )}
                                    />
                                    <Table.Column
                                        title='Thao Tác'
                                        key='actions'
                                        render={(_, record) => (
                                            <Link to={`/auction/${record.id}`}>
                                                Xem Chi Tiết
                                            </Link>
                                        )}
                                    />
                                </Table>
                            )
                        }
                    ]}
                />
            </Card>

            {/* Create Product Modal */}
            <Modal
                title='Thêm Sản Phẩm Mới'
                open={isProductModalVisible}
                onCancel={handleProductCancel}
                footer={null}
                width={800}
            >
                <Form
                    form={productForm}
                    layout='vertical'
                    onFinish={handleProductSubmit}
                >
                    <Form.Item
                        name='name'
                        label='Tên Sản Phẩm'
                        rules={[
                            {
                                required: true,
                                message: 'Vui lòng nhập tên sản phẩm'
                            }
                        ]}
                    >
                        <Input placeholder='Nhập tên mô tả sản phẩm' />
                    </Form.Item>

                    <Form.Item
                        name='description'
                        label='Mô Tả'
                        rules={[
                            {
                                required: true,
                                message: 'Vui lòng nhập mô tả sản phẩm'
                            }
                        ]}
                    >
                        <TextArea
                            placeholder='Mô tả chi tiết về sản phẩm, bao gồm tình trạng, nguồn gốc, và các đặc điểm nổi bật'
                            rows={4}
                        />
                    </Form.Item>

                    <Row gutter={[16, 16]}>
                        <Col span={12}>
                            <Form.Item
                                name='category'
                                label='Danh Mục'
                                rules={[
                                    {
                                        required: true,
                                        message: 'Vui lòng chọn danh mục'
                                    }
                                ]}
                            >
                                <Select placeholder='Chọn danh mục sản phẩm'>
                                    {categories.map((category) => (
                                        <Option
                                            key={category.id}
                                            value={category.id}
                                        >
                                            {category.name}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>

                        <Col span={12}>
                            <Form.Item
                                name='condition'
                                label='Tình Trạng'
                                rules={[
                                    {
                                        required: true,
                                        message:
                                            'Vui lòng chọn tình trạng sản phẩm'
                                    }
                                ]}
                            >
                                <Select placeholder='Chọn tình trạng sản phẩm'>
                                    {conditions.map((condition) => (
                                        <Option
                                            key={condition}
                                            value={condition}
                                        >
                                            {condition}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        name='images'
                        label='Hình Ảnh'
                        valuePropName='fileList'
                        getValueFromEvent={normFile}
                        rules={[
                            {
                                required: true,
                                message: 'Vui lòng tải lên ít nhất một hình ảnh'
                            }
                        ]}
                    >
                        <Upload
                            listType='picture-card'
                            beforeUpload={() => false}
                            multiple
                        >
                            <div>
                                <UploadOutlined />
                                <div style={{ marginTop: '8px' }}>Tải lên</div>
                            </div>
                        </Upload>
                    </Form.Item>

                    <Form.Item>
                        <Space>
                            <Button
                                type='default'
                                onClick={handleProductCancel}
                            >
                                Hủy
                            </Button>
                            <Button type='primary' htmlType='submit'>
                                Thêm Sản Phẩm
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Create Auction Modal */}
            <Modal
                title='Tạo Phiên Đấu Giá Mới'
                open={isModalVisible}
                onCancel={handleCancel}
                footer={null}
                width={800}
            >
                <Form form={form} layout='vertical' onFinish={handleSubmit}>
                    <Form.Item
                        label='Chọn Sản Phẩm Để Đấu Giá'
                        required
                        style={{ marginBottom: '20px' }}
                    >
                        {selectedProducts.length > 0 ? (
                            <List
                                dataSource={selectedProducts}
                                renderItem={(item) => (
                                    <List.Item>
                                        <List.Item.Meta
                                            avatar={
                                                <img
                                                    src={item.images[0]}
                                                    alt={item.name}
                                                    style={{
                                                        width: '60px',
                                                        height: '60px',
                                                        objectFit: 'cover'
                                                    }}
                                                />
                                            }
                                            title={item.name}
                                            description={
                                                <Space>
                                                    <Tag color='blue'>
                                                        {item.category}
                                                    </Tag>
                                                    <Tag color='green'>
                                                        {item.condition}
                                                    </Tag>
                                                </Space>
                                            }
                                        />
                                        <Button
                                            type='text'
                                            danger
                                            onClick={() =>
                                                setSelectedProducts(
                                                    selectedProducts.filter(
                                                        (p) => p.id !== item.id
                                                    )
                                                )
                                            }
                                        >
                                            Xóa
                                        </Button>
                                    </List.Item>
                                )}
                            />
                        ) : (
                            <Table
                                rowSelection={{
                                    type: 'checkbox',
                                    ...rowSelection
                                }}
                                dataSource={products}
                                rowKey='id'
                                pagination={false}
                                size='small'
                            >
                                <Table.Column
                                    title='Hình Ảnh'
                                    dataIndex='images'
                                    key='images'
                                    render={(images) => (
                                        <img
                                            src={images[0]}
                                            alt='Sản phẩm'
                                            style={{
                                                width: '40px',
                                                height: '40px',
                                                objectFit: 'cover'
                                            }}
                                        />
                                    )}
                                />
                                <Table.Column
                                    title='Tên Sản Phẩm'
                                    dataIndex='name'
                                    key='name'
                                />
                                <Table.Column
                                    title='Danh Mục'
                                    dataIndex='category'
                                    key='category'
                                    render={(text) => {
                                        const category = categories.find(
                                            (c) => c.id === text
                                        );
                                        return (
                                            <Tag color='blue'>
                                                {category
                                                    ? category.name
                                                    : text}
                                            </Tag>
                                        );
                                    }}
                                />
                                <Table.Column
                                    title='Tình Trạng'
                                    dataIndex='condition'
                                    key='condition'
                                    render={(text) => {
                                        const colorMap = {
                                            New: 'green',
                                            'Like New': 'green',
                                            Excellent: 'lime',
                                            Good: 'blue',
                                            Fair: 'orange',
                                            Poor: 'red'
                                        };
                                        return (
                                            <Tag
                                                color={colorMap[text] || 'blue'}
                                            >
                                                {text}
                                            </Tag>
                                        );
                                    }}
                                />
                            </Table>
                        )}
                    </Form.Item>

                    <Form.Item
                        name='title'
                        label='Tiêu Đề Phiên Đấu Giá'
                        rules={[
                            {
                                required: true,
                                message: 'Vui lòng nhập tiêu đề phiên đấu giá'
                            }
                        ]}
                    >
                        <Input
                            prefix={<FileTextOutlined />}
                            placeholder='Nhập tiêu đề mô tả'
                        />
                    </Form.Item>

                    <Form.Item
                        name='description'
                        label='Mô Tả'
                        rules={[
                            {
                                required: true,
                                message: 'Vui lòng nhập mô tả'
                            }
                        ]}
                    >
                        <TextArea
                            placeholder='Mô tả chi tiết về phiên đấu giá, bao gồm thông tin về sản phẩm và các điều kiện đặc biệt'
                            rows={4}
                        />
                    </Form.Item>

                    <Row gutter={[16, 16]}>
                        <Col span={12}>
                            <Form.Item
                                name='startingPrice'
                                label='Giá Khởi Điểm (VNĐ)'
                                rules={[
                                    {
                                        required: true,
                                        message: 'Vui lòng nhập giá khởi điểm'
                                    }
                                ]}
                            >
                                <InputNumber
                                    min={1}
                                    placeholder='0'
                                    style={{ width: '100%' }}
                                    prefix={<DollarOutlined />}
                                    formatter={(value) =>
                                        `${value}`.replace(
                                            /\B(?=(\d{3})+(?!\d))/g,
                                            ','
                                        )
                                    }
                                    parser={(value) =>
                                        value.replace(/\$\s?|(,*)/g, '')
                                    }
                                />
                            </Form.Item>
                        </Col>

                        <Col span={12}>
                            <Form.Item
                                name='reservePrice'
                                label='Giá Đáy (VNĐ) (Tùy chọn)'
                                tooltip='Giá tối thiểu phải đạt được để sản phẩm được bán'
                            >
                                <InputNumber
                                    min={0}
                                    placeholder='0'
                                    style={{ width: '100%' }}
                                    prefix={<DollarOutlined />}
                                    formatter={(value) =>
                                        `${value}`.replace(
                                            /\B(?=(\d{3})+(?!\d))/g,
                                            ','
                                        )
                                    }
                                    parser={(value) =>
                                        value.replace(/\$\s?|(,*)/g, '')
                                    }
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={[16, 16]}>
                        <Col span={12}>
                            <Form.Item
                                name='endDate'
                                label='Ngày & Giờ Kết Thúc'
                                rules={[
                                    {
                                        required: true,
                                        message:
                                            'Vui lòng chọn ngày và giờ kết thúc'
                                    }
                                ]}
                            >
                                <DatePicker
                                    showTime
                                    style={{ width: '100%' }}
                                    prefix={<ClockCircleOutlined />}
                                />
                            </Form.Item>
                        </Col>

                        <Col span={12}>
                            <Form.Item
                                name='bidIncrement'
                                label='Bước Giá (VNĐ)'
                                rules={[
                                    {
                                        required: true,
                                        message: 'Vui lòng nhập bước giá'
                                    }
                                ]}
                            >
                                <InputNumber
                                    min={1000}
                                    step={1000}
                                    placeholder='10,000'
                                    style={{ width: '100%' }}
                                    formatter={(value) =>
                                        `${value}`.replace(
                                            /\B(?=(\d{3})+(?!\d))/g,
                                            ','
                                        )
                                    }
                                    parser={(value) =>
                                        value.replace(/\$\s?|(,*)/g, '')
                                    }
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        name='additionalTerms'
                        label='Điều Khoản Bổ Sung (Tùy chọn)'
                    >
                        <TextArea
                            placeholder='Nhập bất kỳ điều khoản hoặc điều kiện bổ sung nào cho phiên đấu giá này'
                            rows={3}
                        />
                    </Form.Item>

                    <Form.Item>
                        <Space>
                            <Button type='primary' htmlType='submit'>
                                Đăng Phiên Đấu Giá
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default MyAuctions;
