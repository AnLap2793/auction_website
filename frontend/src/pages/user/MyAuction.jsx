import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
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
    message,
    Spin,
    Tooltip,
} from "antd";
import {
    ShoppingOutlined,
    PlusOutlined,
    UploadOutlined,
    TagOutlined,
    ClockCircleOutlined,
    DollarOutlined,
    FileTextOutlined,
    AppstoreOutlined,
    PlusSquareOutlined,
} from "@ant-design/icons";
import { getProductBySellerID, createProduct, updateProduct } from "../../services/productService";
import { getAllCategories } from "../../services/categoryService";
import auctionService from "../../services/auctionService";
import { uploadImages } from "../../services/imageService";
import moment from "moment";
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
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [form] = Form.useForm();
    const [productForm] = Form.useForm();
    const [editForm] = Form.useForm();
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [editingProduct, setEditingProduct] = useState(null);
    const [activeAuctions, setActiveAuctions] = useState([]);
    const [completedAuctions, setCompletedAuctions] = useState([]);
    const [categories, setCategories] = useState([]);
    const [registrations, setRegistrations] = useState({});
    const [registrationModalVisible, setRegistrationModalVisible] = useState(false);
    const [currentAuctionId, setCurrentAuctionId] = useState(null);
    const [auctionRegistrations, setAuctionRegistrations] = useState([]);
    const [loadingRegistrations, setLoadingRegistrations] = useState(false);

    // Kiểm tra nếu người dùng không phải là người bán hoặc chưa đăng nhập
    useEffect(() => {
        if (!user) {
            message.error("Vui lòng đăng nhập để truy cập trang này!");
            navigate("/login");
            return;
        }

        if (user.role !== "seller") {
            message.error("Trang này chỉ dành cho người bán!");
            navigate("/");
        }
        fetchProductBySellerID();
        fetchCategories();
    }, [user, navigate]);

    // Theo dõi và cập nhật bidCount khi completedAuctions thay đổi
    useEffect(() => {
        if (completedAuctions.length > 0) {
            fetchBidCount();
        }
    }, [completedAuctions]);

    // Hiển thị trang loading trong khi kiểm tra
    if (!user || user.role !== "seller") {
        return null; // Không hiển thị gì trong khi chờ chuyển hướng
    }

    // Lấy danh mục từ API
    const fetchCategories = async () => {
        try {
            const response = await getAllCategories();
            setCategories(response.data);
        } catch (error) {
            message.error("Lỗi khi lấy danh mục");
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
                addedDate: new Date(product.created_at).toLocaleDateString("vi-VN"),
                seller: {
                    id: product.User.id,
                    firstName: product.User.first_name,
                    lastName: product.User.last_name,
                    email: product.User.email,
                },
                auctions: product.Auctions.length > 0 ? product.Auctions : [],
                auctionStatus: product.Auctions.length > 0 ? product.Auctions[0].status : "available",
            }));
            //console.log(formattedProducts.map((p) => p.auctions));
            setProducts(formattedProducts);

            // Xử lý dữ liệu các phiên đấu giá từ sản phẩm
            const auctionsFromProducts = [];
            formattedProducts.forEach((product) => {
                if (product.auctions && product.auctions.length > 0) {
                    product.auctions.forEach((auction) => {
                        const startingPrice = parseFloat(product.startingPrice);
                        const currentBid = parseFloat(auction.current_bid) || startingPrice;
                        // Giá chót là giá đặt cuối cùng (current_bid), nếu không có thì dùng giá khởi điểm
                        const finalPrice = parseFloat(auction.current_bid) || startingPrice;
                        
                        auctionsFromProducts.push({
                            id: auction.id,
                            title: product.name,
                            description: product.description,
                            startingPrice: startingPrice,
                            currentBid: currentBid,
                            finalPrice: finalPrice,
                            bidCount: 0,
                            registerCount: 0,
                            endDate: new Date(auction.end_time).toLocaleString("vi-VN", {
                                year: "numeric",
                                month: "numeric",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                            }),
                            timeLeft: getTimeLeft(auction.end_time),
                            imageUrl: product.images[0] || "https://via.placeholder.com/150",
                            category: product.category,
                            productIds: [product.id],
                            status: auction.status,
                            startTime: new Date(auction.start_time).toLocaleString("vi-VN", {
                                year: "numeric",
                                month: "numeric",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                            }),
                            bidIncrement: parseFloat(auction.bid_increment),
                        });
                    });
                }
            });
            //console.log(auctionsFromProducts);

            // Phân loại phiên đấu giá theo trạng thái
            const active = auctionsFromProducts.filter(
                (auction) => auction.status === "active" || auction.status === "pending"
            );
            const completed = auctionsFromProducts.filter(
                (auction) => auction.status === "closed" || auction.status === "canceled"
            );
            //console.log(active);

            setActiveAuctions(active);
            setCompletedAuctions(completed);

            // Gọi fetchBidCount ngay sau khi cập nhật completed auctions
            if (completed.length > 0) {
                // Sử dụng setTimeout để đảm bảo state đã được cập nhật
                setTimeout(() => fetchBidCount(), 0);
            }

            // Lấy số lượt đăng ký đấu giá cho từng phiên đấu giá
            const fetchRegistrationsData = async () => {
                const registrationsData = {};

                for (const auction of auctionsFromProducts) {
                    try {
                        const regResponse = await auctionService.getAuctionRegistrations(auction.id);

                        const updatedAuctions = [...active, ...completed].map((a) => {
                            if (a.id === auction.id) {
                                return {
                                    ...a,
                                    registerCount: regResponse.data.total_registrations || 0,
                                };
                            }
                            return a;
                        });

                        // Cập nhật lại danh sách đấu giá
                        const updatedActive = updatedAuctions.filter(
                            (a) => a.status === "active" || a.status === "pending"
                        );
                        const updatedCompleted = updatedAuctions.filter(
                            (a) => a.status === "closed" || a.status === "canceled"
                        );

                        setActiveAuctions(updatedActive);
                        setCompletedAuctions(updatedCompleted);

                        // Lưu vào state registrations nếu cần
                        registrationsData[auction.id] = regResponse.data.total_registrations || 0;
                    } catch (error) {
                        console.error(`Lỗi khi lấy số lượt đăng ký cho phiên đấu giá ${auction.id}:`, error);
                    }
                }

                setRegistrations(registrationsData);
            };

            // Gọi hàm lấy số lượt đăng ký
            if (auctionsFromProducts.length > 0) {
                fetchRegistrationsData();
            }
        } catch (error) {
            message.error("Lỗi không lấy được dữ liệu");
        }
    };

    // Hàm tính thời gian còn lại
    const getTimeLeft = (endTime) => {
        const end = new Date(endTime);
        const now = new Date();

        if (now > end) return "Đã kết thúc";

        const diffTime = Math.abs(end - now);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

        return `${diffDays}d ${diffHours}h`;
    };

    // Hàm lấy số lượt đặt giá thực tế
    const fetchBidCount = async () => {
        try {
            // Chỉ lấy dữ liệu cho những phiên đấu giá chưa có bidCount hoặc bidCount = 0
            const auctionsNeedBidCount = completedAuctions.filter((auction) => !auction.bidCount);

            if (auctionsNeedBidCount.length === 0) {
                return; // Không cần gọi API nếu tất cả auction đã có bidCount
            }

            // Tạo một mảng chứa tất cả các promise để gọi API
            const bidPromises = auctionsNeedBidCount.map(async (auction) => {
                try {
                    const response = await auctionService.getAuctionBids(auction.id);
                    if (response && response.data) {
                        return {
                            auctionId: auction.id,
                            bidCount: response.data.length || 0,
                        };
                    }
                    return { auctionId: auction.id, bidCount: 0 };
                } catch (error) {
                    console.error(`Lỗi khi lấy lượt đặt giá cho phiên đấu giá ${auction.id}:`, error);
                    return { auctionId: auction.id, bidCount: 0 };
                }
            });

            // Đợi tất cả các promise hoàn thành
            const results = await Promise.all(bidPromises);

            // Cập nhật state với số lượt đặt giá mới
            const updatedCompletedAuctions = completedAuctions.map((auction) => {
                // Nếu auction đã có bidCount, giữ nguyên giá trị đó
                if (auction.bidCount) {
                    return auction;
                }

                const result = results.find((r) => r.auctionId === auction.id);
                return {
                    ...auction,
                    bidCount: result ? result.bidCount : 0,
                };
            });

            setCompletedAuctions(updatedCompletedAuctions);
        } catch (error) {
            console.error("Lỗi khi lấy số lượt đặt giá:", error);
        }
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

    // Hàm hiển thị modal danh sách đăng ký
    const showRegistrationsModal = async (auctionId) => {
        setCurrentAuctionId(auctionId);
        setLoadingRegistrations(true);
        setRegistrationModalVisible(true);

        try {
            const response = await auctionService.getAuctionRegistrations(auctionId);
            //console.log('Danh sách đăng ký:', response);

            if (response && response.data && response.data.registrations) {
                setAuctionRegistrations(response.data.registrations);
            } else {
                setAuctionRegistrations([]);
                message.info("Không có người đăng ký nào cho phiên đấu giá này");
            }
        } catch (error) {
            console.error("Lỗi khi lấy danh sách đăng ký:", error);
            message.error("Không thể lấy danh sách đăng ký");
            setAuctionRegistrations([]);
        } finally {
            setLoadingRegistrations(false);
        }
    };

    // Hàm đóng modal danh sách đăng ký
    const handleRegistrationModalClose = () => {
        setRegistrationModalVisible(false);
        setCurrentAuctionId(null);
        setAuctionRegistrations([]);
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();

            // Hiển thị thông báo loading
            message.loading("Đang tạo phiên đấu giá...", 0);

            // Chuẩn bị dữ liệu theo định dạng chuẩn
            const createData = {
                product_id: selectedProducts[0]?.id,
                bid_increment: values.bidIncrement,
                start_time: values.startDate.toISOString(),
                end_time: values.endDate.toISOString(),
                status: "pending",
            };

            // Gọi API tạo đấu giá
            await auctionService.createAuction(createData);
            message.destroy(); // Xóa thông báo loading

            // Thông báo thành công và làm mới dữ liệu
            message.success("Tạo phiên đấu giá thành công");
            setIsModalVisible(false);
            form.resetFields();
            setSelectedProducts([]);
            fetchProductBySellerID(); // Làm mới danh sách
        } catch (error) {
            message.destroy();
            console.error("Lỗi khi tạo phiên đấu giá:", error);
            message.error(error.response?.data?.message || "Không thể tạo phiên đấu giá");
        }
    };

    const handleProductSubmit = async (values) => {
        try {
            console.log("Submitted product form values:", values);

            let imageUrls = [];

            // Xử lý upload ảnh lên Cloudinary
            if (values.images && values.images.length > 0) {
                console.log("Bắt đầu upload ảnh, số lượng:", values.images.length);
                const formData = new FormData();

                // Thêm tất cả các file vào FormData
                values.images.forEach((file, index) => {
                    console.log(`File ${index}:`, file);
                    formData.append("images", file.originFileObj);
                });

                try {
                    message.loading("Đang tải ảnh lên...", 0);
                    const uploadResponse = await uploadImages(formData);
                    message.destroy();

                    console.log("Upload response:", uploadResponse);

                    if (uploadResponse && uploadResponse.data) {
                        // Lấy URL ảnh từ response
                        imageUrls = uploadResponse.data.map((img) => img.url);
                        console.log("Upload ảnh thành công. URL:", imageUrls);
                    } else {
                        message.error("Không thể tải ảnh lên");
                        return;
                    }
                } catch (uploadError) {
                    message.destroy();
                    console.error("Lỗi khi tải lên hình ảnh:", uploadError);
                    message.error("Không thể tải lên hình ảnh: " + (uploadError.message || "Đã xảy ra lỗi"));
                    return;
                }
            } else {
                console.log("Không có ảnh để upload");
            }

            // Chuẩn bị dữ liệu để gửi API
            const productData = {
                title: values.title,
                description: values.description,
                category_id: values.category,
                starting_price: values.starting_price,
                seller_id: user.id,
                ProductImages: imageUrls.map((url) => ({ image_url: url })),
            };

            console.log("Dữ liệu sản phẩm gửi đi:", productData);

            // Gọi API tạo sản phẩm
            const response = await createProduct(productData);
            console.log("API response:", response);

            if (response.success) {
                message.success("Tạo sản phẩm mới thành công!");

                // Cập nhật danh sách sản phẩm
                const newProduct = response.data;
                console.log("Sản phẩm mới từ API:", newProduct);

                // Format sản phẩm để phù hợp với cấu trúc hiện tại
                const formattedProduct = {
                    id: newProduct.id,
                    name: newProduct.title,
                    title: newProduct.title,
                    description: newProduct.description,
                    category: newProduct.category_id,
                    startingPrice: newProduct.starting_price,
                    images: newProduct.ProductImages ? newProduct.ProductImages.map((img) => img.image_url) : [],
                    addedDate: new Date(newProduct.created_at).toLocaleDateString("vi-VN"),
                    seller: {
                        id: user.id,
                        firstName: user.first_name,
                        lastName: user.last_name,
                        email: user.email,
                    },
                    auctions: [],
                    auctionStatus: "available",
                };

                console.log("Sản phẩm đã định dạng:", formattedProduct);
                setProducts([...products, formattedProduct]);

                // Đóng modal và reset form
                setIsProductModalVisible(false);
                productForm.resetFields();

                // Làm mới danh sách sản phẩm
                fetchProductBySellerID();
            } else {
                message.error("Có lỗi xảy ra khi tạo sản phẩm!");
            }
        } catch (error) {
            console.error("Lỗi khi tạo sản phẩm:", error);
            message.error("Không thể tạo sản phẩm: " + (error.message || "Đã xảy ra lỗi"));
        }
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
        },
    };

    const handleEditProduct = (product) => {
        setEditingProduct(product);
        editForm.setFieldsValue({
            title: product.name,
            description: product.description,
            category: product.category.id || product.category,
            starting_price: product.startingPrice,
        });

        // Chuẩn bị fileList cho Upload component
        const fileList = product.images.map((url, index) => ({
            uid: `-${index}`,
            name: `image-${index}.jpg`,
            status: "done",
            url: url,
        }));

        editForm.setFieldsValue({ images: fileList });
        setIsEditModalVisible(true);
    };

    const handleEditSubmit = async (values) => {
        try {
            message.loading("Đang cập nhật sản phẩm...", 0);

            // Xử lý upload ảnh nếu có ảnh mới
            let imageUrls = [];
            let hasNewImages = false;

            if (values.images && values.images.length > 0) {
                // Phân biệt giữa ảnh đã có và ảnh mới
                const existingImages = values.images.filter((file) => file.url).map((file) => file.url);

                const newImages = values.images.filter((file) => !file.url && file.originFileObj);

                imageUrls = [...existingImages];

                if (newImages.length > 0) {
                    hasNewImages = true;
                    const formData = new FormData();
                    newImages.forEach((file) => {
                        formData.append("images", file.originFileObj);
                    });

                    try {
                        const uploadResponse = await uploadImages(formData);

                        if (uploadResponse && uploadResponse.data) {
                            const newUrls = uploadResponse.data.map((img) => img.url);
                            imageUrls = [...imageUrls, ...newUrls];
                        }
                    } catch (error) {
                        message.error("Lỗi khi tải lên hình ảnh mới");
                        console.error(error);
                    }
                }
            }

            // Chuẩn bị dữ liệu cập nhật
            const updatedProductData = {
                id: editingProduct.id,
                title: values.title,
                description: values.description,
                category_id: values.category,
                starting_price: values.starting_price,
                ProductImages: imageUrls.map((url) => ({ image_url: url })),
            };

            // Gọi API cập nhật sản phẩm
            const response = await updateProduct(editingProduct.id, updatedProductData);

            if (response.success) {
                message.success("Cập nhật sản phẩm thành công!");

                // Cập nhật lại danh sách sản phẩm
                fetchProductBySellerID();

                // Đóng modal và reset form
                setIsEditModalVisible(false);
                setEditingProduct(null);
                editForm.resetFields();
            } else {
                message.error("Có lỗi xảy ra khi cập nhật sản phẩm!");
            }
        } catch (error) {
            console.error("Lỗi khi cập nhật sản phẩm:", error);
            message.error("Không thể cập nhật sản phẩm: " + (error.message || "Đã xảy ra lỗi"));
        } finally {
            message.destroy();
        }
    };

    const handleEditCancel = () => {
        setIsEditModalVisible(false);
        setEditingProduct(null);
        editForm.resetFields();
    };

    return (
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "24px" }}>
            <Row justify="space-between" align="middle" style={{ marginBottom: "24px" }}>
                <Col>
                    <Title level={2}>Trang Người Bán</Title>
                </Col>
                <Col>
                    <Space>
                        <Button type="primary" icon={<PlusSquareOutlined />} onClick={handleCreateProduct}>
                            Thêm Sản Phẩm Mới
                        </Button>
                    </Space>
                </Col>
            </Row>

            <Card>
                <Tabs
                    defaultActiveKey="products"
                    items={[
                        {
                            key: "products",
                            label: (
                                <span>
                                    <AppstoreOutlined /> Sản Phẩm Của Tôi ({products.length})
                                </span>
                            ),
                            children:
                                products.length > 0 ? (
                                    <Table dataSource={products} rowKey="id" pagination={{ pageSize: 5 }}>
                                        <Table.Column
                                            title="Hình Ảnh"
                                            dataIndex="images"
                                            key="images"
                                            render={(images) => (
                                                <img
                                                    src={images[0]}
                                                    alt="Sản phẩm"
                                                    style={{
                                                        width: "60px",
                                                        height: "60px",
                                                        objectFit: "cover",
                                                    }}
                                                />
                                            )}
                                        />
                                        <Table.Column
                                            title="Tên Sản Phẩm"
                                            dataIndex="name"
                                            key="name"
                                            render={(text) => <Text strong>{text}</Text>}
                                        />
                                        <Table.Column
                                            title="Mô Tả"
                                            dataIndex="description"
                                            key="description"
                                            render={(text) => <Text>{text}</Text>}
                                        />
                                        <Table.Column
                                            title="Danh Mục"
                                            dataIndex="category"
                                            key="category"
                                            render={(text) => {
                                                const category = categories.find((c) => c.id === text);
                                                return <Tag color="blue">{category ? category.name : text}</Tag>;
                                            }}
                                        />
                                        <Table.Column
                                            title="Giá Khởi Điểm"
                                            dataIndex="startingPrice"
                                            key="startingPrice"
                                            render={(price) => (
                                                <Text strong>{Number(price).toLocaleString("vi-VN")} VNĐ</Text>
                                            )}
                                        />
                                        <Table.Column title="Ngày Thêm" dataIndex="addedDate" key="addedDate" />
                                        <Table.Column
                                            title="Thao Tác"
                                            key="actions"
                                            render={(_, record) => (
                                                <Space>
                                                    {record.auctionStatus === "available" ? (
                                                        <Space.Compact>
                                                            <Button
                                                                size="small"
                                                                onClick={() => handleEditProduct(record)}
                                                            >
                                                                Chỉnh Sửa
                                                            </Button>
                                                            <Button
                                                                size="small"
                                                                type="primary"
                                                                onClick={() => {
                                                                    setIsModalVisible(true);
                                                                    setSelectedProducts([record]);
                                                                }}
                                                            >
                                                                Đấu Giá Ngay
                                                            </Button>
                                                        </Space.Compact>
                                                    ) : (
                                                        <Tag color="success">Đã đấu giá</Tag>
                                                    )}
                                                </Space>
                                            )}
                                        />
                                    </Table>
                                ) : (
                                    <Empty description="Bạn chưa có sản phẩm nào" image={Empty.PRESENTED_IMAGE_SIMPLE}>
                                        <Button type="primary" onClick={handleCreateProduct}>
                                            Thêm Sản Phẩm Mới
                                        </Button>
                                    </Empty>
                                ),
                        },
                        {
                            key: "active",
                            label: (
                                <span>
                                    <ShoppingOutlined /> Phiên đấu giá của tôi ({activeAuctions.length})
                                </span>
                            ),
                            children:
                                activeAuctions.length > 0 ? (
                                    <Row gutter={[16, 16]}>
                                        {activeAuctions.map((auction) => (
                                            <Col xs={24} sm={12} lg={8} key={auction.id}>
                                                <Card
                                                    hoverable
                                                    cover={
                                                        <img
                                                            alt={auction.title}
                                                            src={auction.imageUrl}
                                                            style={{
                                                                height: "200px",
                                                                objectFit: "cover",
                                                            }}
                                                        />
                                                    }
                                                    actions={[
                                                        <Link to={`/auctions/${auction.id}`}>Xem Chi Tiết</Link>,
                                                        <Button
                                                            type="text"
                                                            onClick={() => showRegistrationsModal(auction.id)}
                                                        >
                                                            Xem Đăng Ký
                                                        </Button>,
                                                    ]}
                                                >
                                                    <Space
                                                        direction="vertical"
                                                        style={{
                                                            width: "100%",
                                                        }}
                                                    >
                                                        <Tag color="blue">{auction.category}</Tag>
                                                        <Title
                                                            level={4}
                                                            style={{
                                                                margin: "8px 0",
                                                            }}
                                                        >
                                                            {auction.title}
                                                        </Title>
                                                        <Paragraph
                                                            ellipsis={{
                                                                rows: 2,
                                                            }}
                                                        >
                                                            {auction.description}
                                                        </Paragraph>
                                                        <Divider
                                                            style={{
                                                                margin: "12px 0",
                                                            }}
                                                        />
                                                        <Row gutter={[8, 8]}>
                                                            <Col span={24}>
                                                                <Tag
                                                                    color={
                                                                        auction.status === "pending"
                                                                            ? "orange"
                                                                            : "green"
                                                                    }
                                                                >
                                                                    {auction.status === "pending"
                                                                        ? "Sắp diễn ra"
                                                                        : "Đang diễn ra"}
                                                                </Tag>
                                                            </Col>
                                                            <Col span={12}>
                                                                <Text type="secondary">Giá hiện tại</Text>
                                                                <br />
                                                                <Text
                                                                    strong
                                                                    style={{
                                                                        color: "#1890ff",
                                                                    }}
                                                                >
                                                                    {auction.currentBid.toLocaleString("vi-VN")} VNĐ
                                                                </Text>
                                                            </Col>
                                                            <Col span={12}>
                                                                <Text type="secondary">Lượt tham gia</Text>
                                                                <br />
                                                                <Text strong>{auction.registerCount}</Text>
                                                            </Col>
                                                            <Col span={12}>
                                                                <Text type="secondary">Giá khởi điểm</Text>
                                                                <br />
                                                                <Text strong>
                                                                    {auction.startingPrice.toLocaleString("vi-VN")} VNĐ
                                                                </Text>
                                                            </Col>
                                                            <Col span={12}>
                                                                <Text type="secondary">Thơi gian kết thúc</Text>
                                                                <br />
                                                                <Text
                                                                    strong
                                                                    style={{
                                                                        color: "#fa8c16",
                                                                    }}
                                                                >
                                                                    {auction.timeLeft}
                                                                </Text>
                                                            </Col>
                                                            <Col span={12}>
                                                                <Text type="secondary">Thời gian bắt đầu</Text>
                                                                <br />
                                                                <Text strong>{auction.startTime}</Text>
                                                            </Col>
                                                            <Col span={12}>
                                                                <Text type="secondary">Bước giá</Text>
                                                                <br />
                                                                <Text strong>
                                                                    {auction.bidIncrement.toLocaleString("vi-VN")} VNĐ
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
                                        description="Bạn không có phiên đấu giá nào đang diễn ra"
                                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                                    />
                                ),
                        },
                        {
                            key: "completed",
                            label: (
                                <span>
                                    <UploadOutlined /> Đã Hoàn Thành ({completedAuctions.length})
                                </span>
                            ),
                            children: (
                                <Table dataSource={completedAuctions} rowKey="id" pagination={{ pageSize: 5 }}>
                                    <Table.Column
                                        title="Sản Phẩm"
                                        dataIndex="title"
                                        key="title"
                                        render={(text) => <Text strong>{text}</Text>}
                                    />
                                    <Table.Column
                                        title="Giá Khởi Điểm"
                                        dataIndex="startingPrice"
                                        key="startingPrice"
                                        render={(price) => (price ? `${price.toLocaleString("vi-VN")} VNĐ` : "0 VNĐ")}
                                    />
                                    <Table.Column
                                        title="Giá Chót"
                                        dataIndex="finalPrice"
                                        key="finalPrice"
                                        render={(price) => (
                                            <Text strong>{price ? price.toLocaleString("vi-VN") : 0} VNĐ</Text>
                                        )}
                                    />
                                    <Table.Column
                                        title="Lượt Đấu Giá"
                                        dataIndex="bidCount"
                                        key="bidCount"
                                        render={(bidCount) => bidCount || 0}
                                    />
                                    <Table.Column title="Bắt Đầu" dataIndex="startTime" key="startTime" />
                                    <Table.Column title="Kết Thúc" dataIndex="endDate" key="endDate" />
                                    <Table.Column
                                        title="Trạng Thái"
                                        dataIndex="status"
                                        key="status"
                                        render={(status) => (
                                            <Tag
                                                color={
                                                    status === "sold"
                                                        ? "success"
                                                        : status === "closed"
                                                        ? "processing"
                                                        : "default"
                                                }
                                            >
                                                {status === "sold"
                                                    ? "Đã Bán"
                                                    : status === "closed"
                                                    ? "Đã Đóng"
                                                    : "Đã Hủy"}
                                            </Tag>
                                        )}
                                    />
                                    <Table.Column
                                        title="Thao Tác"
                                        key="actions"
                                        render={(_, record) => <Link to={`/auctions/${record.id}`}>Xem Chi Tiết</Link>}
                                    />
                                </Table>
                            ),
                        },
                    ]}
                />
            </Card>

            {/* Create Product Modal */}
            <Modal
                title="Thêm Sản Phẩm Mới"
                open={isProductModalVisible}
                onCancel={handleProductCancel}
                footer={null}
                width={800}
            >
                <Form form={productForm} layout="vertical" onFinish={handleProductSubmit}>
                    <Form.Item
                        name="title"
                        label="Tên Sản Phẩm"
                        rules={[
                            {
                                required: true,
                                message: "Vui lòng nhập tên sản phẩm",
                            },
                        ]}
                    >
                        <Input placeholder="Nhập tên mô tả sản phẩm" />
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label="Mô Tả"
                        rules={[
                            {
                                required: true,
                                message: "Vui lòng nhập mô tả sản phẩm",
                            },
                        ]}
                    >
                        <TextArea
                            placeholder="Mô tả chi tiết về sản phẩm, bao gồm tình trạng, nguồn gốc, và các đặc điểm nổi bật"
                            rows={4}
                        />
                    </Form.Item>

                    <Row gutter={[16, 16]}>
                        <Col span={12}>
                            <Form.Item
                                name="category"
                                label="Danh Mục"
                                rules={[
                                    {
                                        required: true,
                                        message: "Vui lòng chọn danh mục",
                                    },
                                ]}
                            >
                                <Select placeholder="Chọn danh mục sản phẩm">
                                    {categories.map((category) => (
                                        <Option key={category.id} value={category.id}>
                                            {category.name}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>

                        <Col span={12}>
                            <Form.Item
                                name="starting_price"
                                label="Giá Khởi Điểm (VNĐ)"
                                rules={[
                                    {
                                        required: true,
                                        message: "Vui lòng nhập giá khởi điểm",
                                    },
                                ]}
                            >
                                <InputNumber
                                    min={1000}
                                    placeholder="0"
                                    style={{ width: "100%" }}
                                    prefix={<DollarOutlined />}
                                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                    parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        name="images"
                        label="Hình Ảnh"
                        valuePropName="fileList"
                        getValueFromEvent={normFile}
                        rules={[
                            {
                                required: true,
                                message: "Vui lòng tải lên ít nhất một hình ảnh",
                            },
                        ]}
                    >
                        <Upload listType="picture-card" beforeUpload={() => false} multiple>
                            <div>
                                <UploadOutlined />
                                <div style={{ marginTop: "8px" }}>Tải lên</div>
                            </div>
                        </Upload>
                    </Form.Item>

                    <Form.Item>
                        <Space>
                            <Button type="default" onClick={handleProductCancel}>
                                Hủy
                            </Button>
                            <Button type="primary" htmlType="submit">
                                Thêm Sản Phẩm
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Create Auction Modal */}
            <Modal
                title="Đăng Đấu Giá Sản Phẩm"
                open={isModalVisible}
                onCancel={handleCancel}
                footer={null}
                width={800}
            >
                <Form form={form} layout="vertical" onFinish={handleSubmit}>
                    {selectedProducts.length > 0 ? (
                        <div style={{ marginBottom: "20px" }}>
                            <div
                                style={{
                                    fontWeight: "bold",
                                    marginBottom: "10px",
                                }}
                            >
                                Sản phẩm đấu giá:
                            </div>
                            <Card size="small">
                                <Card.Meta
                                    avatar={
                                        <img
                                            src={selectedProducts[0]?.images[0]}
                                            alt={selectedProducts[0]?.name}
                                            style={{
                                                width: "80px",
                                                height: "80px",
                                                objectFit: "cover",
                                            }}
                                        />
                                    }
                                    title={selectedProducts[0]?.name}
                                    description={
                                        <>
                                            <div>
                                                <Tag color="blue">
                                                    {(() => {
                                                        const category = categories.find(
                                                            (c) => c.id === selectedProducts[0]?.category
                                                        );
                                                        return category ? category.name : selectedProducts[0]?.category;
                                                    })()}
                                                </Tag>
                                            </div>
                                            <div style={{ marginTop: "5px" }}>
                                                <Text strong>
                                                    Giá khởi điểm:{" "}
                                                    {Number(selectedProducts[0]?.startingPrice).toLocaleString("vi-VN")}{" "}
                                                    VNĐ
                                                </Text>
                                            </div>
                                            <div style={{ marginTop: "5px" }}>
                                                <Text>{selectedProducts[0]?.description}</Text>
                                            </div>
                                        </>
                                    }
                                />
                            </Card>
                        </div>
                    ) : (
                        <Form.Item label="Chọn Sản Phẩm Để Đấu Giá" required style={{ marginBottom: "20px" }}>
                            <Table
                                rowSelection={{
                                    type: "radio", // Chỉ cho phép chọn một sản phẩm
                                    ...rowSelection,
                                }}
                                dataSource={products.filter((p) => p.auctionStatus === "available")}
                                rowKey="id"
                                pagination={false}
                                size="small"
                            >
                                <Table.Column
                                    title="Hình Ảnh"
                                    dataIndex="images"
                                    key="images"
                                    render={(images) => (
                                        <img
                                            src={images[0]}
                                            alt="Sản phẩm"
                                            style={{
                                                width: "40px",
                                                height: "40px",
                                                objectFit: "cover",
                                            }}
                                        />
                                    )}
                                />
                                <Table.Column title="Tên Sản Phẩm" dataIndex="name" key="name" />
                                <Table.Column
                                    title="Danh Mục"
                                    dataIndex="category"
                                    key="category"
                                    render={(text) => {
                                        const category = categories.find((c) => c.id === text);
                                        return <Tag color="blue">{category ? category.name : text}</Tag>;
                                    }}
                                />
                                <Table.Column
                                    title="Giá Khởi Điểm"
                                    dataIndex="startingPrice"
                                    key="startingPrice"
                                    render={(price) => <span>{Number(price).toLocaleString("vi-VN")} VNĐ</span>}
                                />
                            </Table>
                        </Form.Item>
                    )}

                    <Row gutter={[16, 16]}>
                        <Col span={8}>
                            <Form.Item
                                name="bidIncrement"
                                label="Bước Giá (VNĐ)"
                                rules={[
                                    {
                                        required: true,
                                        message: "Vui lòng nhập bước giá",
                                    },
                                ]}
                                initialValue={1000}
                            >
                                <InputNumber
                                    min={1000}
                                    step={1000}
                                    placeholder="10,000"
                                    style={{ width: "100%" }}
                                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                    parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                                />
                            </Form.Item>
                        </Col>

                        <Col span={8}>
                            <Form.Item
                                name="startDate"
                                label="Ngày & Giờ Bắt Đầu"
                                rules={[
                                    {
                                        required: true,
                                        message: "Vui lòng chọn ngày và giờ bắt đầu",
                                    },
                                ]}
                            >
                                <DatePicker
                                    showTime={{ format: "HH:mm" }}
                                    format="YYYY-MM-DD HH:mm"
                                    style={{ width: "100%" }}
                                    prefix={<ClockCircleOutlined />}
                                    placeholder="Chọn thời điểm bắt đầu"
                                    disabledDate={(current) => current && current < moment().startOf("day")}
                                />
                            </Form.Item>
                        </Col>

                        <Col span={8}>
                            <Form.Item
                                name="endDate"
                                label="Ngày & Giờ Kết Thúc"
                                rules={[
                                    {
                                        required: true,
                                        message: "Vui lòng chọn ngày và giờ kết thúc",
                                    },
                                ]}
                                dependencies={["startDate"]}
                            >
                                <DatePicker
                                    showTime={{ format: "HH:mm" }}
                                    format="YYYY-MM-DD HH:mm"
                                    style={{ width: "100%" }}
                                    prefix={<ClockCircleOutlined />}
                                    placeholder="Chọn thời điểm kết thúc"
                                    disabledDate={(current) => {
                                        const startDate = form.getFieldValue("startDate");
                                        return (
                                            current &&
                                            (current < moment().startOf("day") || (startDate && current <= startDate))
                                        );
                                    }}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item>
                        <Space>
                            <Button type="default" onClick={handleCancel}>
                                Hủy
                            </Button>
                            <Button type="primary" htmlType="submit" disabled={selectedProducts.length === 0}>
                                Đăng Đấu Giá
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Modal hiển thị danh sách đăng ký */}
            <Modal
                title="Danh sách đăng ký tham gia đấu giá"
                open={registrationModalVisible}
                onCancel={handleRegistrationModalClose}
                footer={[
                    <Button key="close" onClick={handleRegistrationModalClose}>
                        Đóng
                    </Button>,
                ]}
                width={800}
            >
                {loadingRegistrations ? (
                    <div style={{ textAlign: "center", padding: "20px" }}>
                        <Spin size="large" />
                        <p>Đang tải danh sách đăng ký...</p>
                    </div>
                ) : (
                    <>
                        {auctionRegistrations.length > 0 ? (
                            <Table dataSource={auctionRegistrations} rowKey="id" pagination={{ pageSize: 10 }}>
                                <Table.Column title="Người Đăng Ký" dataIndex={["user", "email"]} key="email" />
                                <Table.Column
                                    title="Ngày Đăng Ký"
                                    dataIndex="registration_date"
                                    key="registration_date"
                                    render={(date) => new Date(date).toLocaleString("vi-VN")}
                                />
                                <Table.Column
                                    title="Số Tiền Đặt Cọc"
                                    dataIndex="deposit_amount"
                                    key="deposit_amount"
                                    render={(amount) => `${Number(amount).toLocaleString("vi-VN")} VNĐ`}
                                />
                                <Table.Column
                                    title="Trạng Thái Đặt Cọc"
                                    dataIndex="deposit_status"
                                    key="deposit_status"
                                    render={(status) => {
                                        let color = "default";
                                        let text = "Chưa đặt cọc";
                                        switch (status) {
                                            case "paid":
                                                color = "success";
                                                text = "Đã thanh toán";
                                                break;
                                            case "pending":
                                                color = "warning";
                                                text = "Chờ thanh toán";
                                                break;
                                            case "refunded":
                                                color = "default";
                                                text = "Đã hoàn trả";
                                                break;
                                            default:
                                                break;
                                        }
                                        return <Tag color={color}>{text}</Tag>;
                                    }}
                                />
                            </Table>
                        ) : (
                            <Empty description="Chưa có người đăng ký tham gia" />
                        )}
                    </>
                )}
            </Modal>

            {/* Edit Product Modal */}
            <Modal
                title="Chỉnh Sửa Sản Phẩm"
                open={isEditModalVisible}
                onCancel={handleEditCancel}
                footer={null}
                width={800}
            >
                {editingProduct && (
                    <Form
                        form={editForm}
                        layout="vertical"
                        onFinish={handleEditSubmit}
                        initialValues={{
                            title: editingProduct.name,
                            description: editingProduct.description,
                            category: editingProduct.category,
                            starting_price: editingProduct.startingPrice,
                        }}
                    >
                        <Form.Item
                            name="title"
                            label="Tên Sản Phẩm"
                            rules={[
                                {
                                    required: true,
                                    message: "Vui lòng nhập tên sản phẩm",
                                },
                            ]}
                        >
                            <Input placeholder="Nhập tên mô tả sản phẩm" />
                        </Form.Item>

                        <Form.Item
                            name="description"
                            label="Mô Tả"
                            rules={[
                                {
                                    required: true,
                                    message: "Vui lòng nhập mô tả sản phẩm",
                                },
                            ]}
                        >
                            <TextArea
                                placeholder="Mô tả chi tiết về sản phẩm, bao gồm tình trạng, nguồn gốc, và các đặc điểm nổi bật"
                                rows={4}
                            />
                        </Form.Item>

                        <Row gutter={[16, 16]}>
                            <Col span={12}>
                                <Form.Item
                                    name="category"
                                    label="Danh Mục"
                                    rules={[
                                        {
                                            required: true,
                                            message: "Vui lòng chọn danh mục",
                                        },
                                    ]}
                                >
                                    <Select placeholder="Chọn danh mục sản phẩm">
                                        {categories.map((category) => (
                                            <Option key={category.id} value={category.id}>
                                                {category.name}
                                            </Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </Col>

                            <Col span={12}>
                                <Form.Item
                                    name="starting_price"
                                    label="Giá Khởi Điểm (VNĐ)"
                                    rules={[
                                        {
                                            required: true,
                                            message: "Vui lòng nhập giá khởi điểm",
                                        },
                                    ]}
                                >
                                    <InputNumber
                                        min={1000}
                                        placeholder="0"
                                        style={{ width: "100%" }}
                                        prefix={<DollarOutlined />}
                                        formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                        parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                                    />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Form.Item name="images" label="Hình Ảnh" valuePropName="fileList" getValueFromEvent={normFile}>
                            <Upload listType="picture-card" beforeUpload={() => false} multiple>
                                <div>
                                    <UploadOutlined />
                                    <div style={{ marginTop: "8px" }}>Tải lên</div>
                                </div>
                            </Upload>
                        </Form.Item>

                        <Form.Item>
                            <Space>
                                <Button type="default" onClick={handleEditCancel}>
                                    Hủy
                                </Button>
                                <Button type="primary" htmlType="submit">
                                    Cập Nhật Sản Phẩm
                                </Button>
                            </Space>
                        </Form.Item>
                    </Form>
                )}
            </Modal>
        </div>
    );
};

export default MyAuctions;
