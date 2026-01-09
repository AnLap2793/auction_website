import React, { useState, useEffect } from "react";
import {
    Row,
    Col,
    Card,
    Statistic,
    Typography,
    Table,
    Tag,
    Space,
    DatePicker,
    Select,
    Progress,
    List,
    message,
} from "antd";
import {
    UserOutlined,
    ShoppingOutlined,
    GiftOutlined,
    TransactionOutlined,
    ArrowUpOutlined,
    ArrowDownOutlined,
    DollarOutlined,
} from "@ant-design/icons";
import { Area } from "@ant-design/plots";
import { getUsers } from "../../services/apiUser";
import { getAllProducts } from "../../services/productService";
import auctionService from "../../services/auctionService";
import transactionService from "../../services/transactionService";

const { Title } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const DashboardPage = () => {
    const [timeRange, setTimeRange] = useState("week");
    const [loading, setLoading] = useState(false);
    const [dashboardData, setDashboardData] = useState({
        users: { total: 0, growth: 0 },
        products: { total: 0, growth: 0 },
        activeAuctions: { total: 0, growth: 0 },
        completedAuctions: { total: 0, growth: 0 },
        revenue: { total: 0, growth: 0 },
    });
    const [chartData, setChartData] = useState([]);
    const [recentTransactions, setRecentTransactions] = useState([]);
    const [topProducts, setTopProducts] = useState([]);

    useEffect(() => {
        fetchDashboardData();
    }, [timeRange]);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            // Lấy dữ liệu người dùng
            const usersResponse = await getUsers();
            const usersData = usersResponse.data || [];

            // Lấy dữ liệu sản phẩm
            const productsResponse = await getAllProducts();
            const productsData = productsResponse.data || [];

            // Lấy dữ liệu đấu giá
            const auctionsResponse = await auctionService.getAllAuctions({
                isAdmin: true,
                limit: 1000, // Lấy nhiều hơn để có thể thống kê chính xác
            });
            const auctionsData = auctionsResponse.data;
            const activeAuctions = auctionsData.filter(
                (auction) => auction.status === "active" || auction.status === "pending"
            );

            // Lọc đấu giá đã kết thúc
            const completedAuctions = auctionsData.filter((auction) => auction.status === "closed");

            console.log("Completed: ", completedAuctions);

            // Lấy dữ liệu giao dịch
            const transactionsResponse = await transactionService.getAllTransactions();
            const transactionsData = transactionsResponse || [];
            const successTransactions = transactionsData.filter((transaction) => transaction.status === "completed");

            // Tính tổng doanh thu
            const totalRevenue = successTransactions.reduce(
                (sum, transaction) => sum + parseFloat(transaction.amount || 0),
                0
            );

            // Cập nhật dữ liệu dashboard
            setDashboardData({
                users: {
                    total: usersData.length,
                    growth: calculateGrowth(usersData, timeRange),
                },
                products: {
                    total: productsData.length,
                    growth: calculateGrowth(productsData, timeRange),
                },
                activeAuctions: {
                    total: activeAuctions.length,
                    growth: calculateGrowth(activeAuctions, timeRange),
                },
                completedAuctions: {
                    total: completedAuctions.length,
                    growth: calculateGrowth(completedAuctions, timeRange),
                },
                revenue: {
                    total: totalRevenue,
                    growth: calculateRevenueGrowth(successTransactions, timeRange),
                },
            });

            // Tạo dữ liệu biểu đồ
            setChartData(generateChartData(usersData, productsData, auctionsData));

            // Lấy giao dịch gần đây với thông tin đầy đủ
            const recentTransactionsData = transactionsData
                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                .slice(0, 5);

            // Tạo map để tra cứu nhanh thông tin auction và product
            const auctionMap = new Map();
            auctionsData.forEach((auction) => {
                if (auction.Product) {
                    auctionMap.set(auction.id, {
                        productTitle: auction.Product.title || "Không xác định",
                    });
                }
            });

            // Lấy thông tin chi tiết cho từng transaction
            const enrichedTransactions = await Promise.all(
                recentTransactionsData.map(async (transaction) => {
                    let productTitle = "Không xác định";
                    let userName = "Không xác định";

                    // Lấy thông tin auction và product từ map hoặc API nếu chưa có
                    if (transaction.auction_id) {
                        const auctionInfo = auctionMap.get(transaction.auction_id);
                        if (auctionInfo) {
                            productTitle = auctionInfo.productTitle;
                        } else {
                            // Nếu chưa có trong map, gọi API
                            try {
                                const auctionResponse = await auctionService.getAuctionById(transaction.auction_id);
                                if (auctionResponse.data?.Product) {
                                    productTitle = auctionResponse.data.Product.title || "Không xác định";
                                }
                            } catch (error) {
                                console.error("Lỗi khi lấy thông tin auction:", error);
                            }
                        }
                    }

                    // Lấy thông tin user từ usersData đã có
                    if (transaction.user_id) {
                        const user = usersData.find((u) => u.id === transaction.user_id);
                        if (user) {
                            userName =
                                `${user.first_name || ""} ${user.last_name || ""}`.trim() ||
                                user.email ||
                                "Không xác định";
                        }
                    }

                    return {
                        id: transaction.id,
                        user: userName,
                        product: productTitle,
                        amount: parseFloat(transaction.amount || 0),
                        status: transaction.status,
                        date: new Date(transaction.created_at).toISOString().split("T")[0],
                    };
                })
            );

            setRecentTransactions(enrichedTransactions);

            // Lấy top sản phẩm
            const auctionRegistrations = {};

            // Lấy số lượt đăng ký cho mỗi phiên đấu giá
            for (const auction of auctionsData) {
                try {
                    const regResponse = await auctionService.getAuctionRegistrations(auction.id);
                    auctionRegistrations[auction.id] = regResponse.data.total_registrations || 0;
                } catch (error) {
                    console.error("Lỗi khi lấy số lượt đăng ký:", error);
                    auctionRegistrations[auction.id] = 0;
                }
            }

            // Sắp xếp và lấy top 5 sản phẩm có nhiều lượt đăng ký nhất
            const topAuctionProducts = auctionsData
                .sort((a, b) => (auctionRegistrations[b.id] || 0) - (auctionRegistrations[a.id] || 0))
                .slice(0, 5)
                .map((auction) => ({
                    title: auction.Product ? auction.Product.title : "Không xác định",
                    price: parseFloat(auction.current_bid || auction.Product?.starting_price || 0),
                    bids: auctionRegistrations[auction.id] || 0,
                }));

            setTopProducts(topAuctionProducts);
        } catch (error) {
            message.error("Lỗi khi tải dữ liệu: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    // Tính toán tốc độ tăng trưởng dựa trên timeRange
    const calculateGrowth = (data, timeRange) => {
        if (!data || data.length === 0) return 0;

        const now = new Date();
        let startDate, previousStartDate;

        switch (timeRange) {
            case "today":
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                previousStartDate = new Date(startDate);
                previousStartDate.setDate(previousStartDate.getDate() - 1);
                break;
            case "week":
                startDate = new Date(now);
                startDate.setDate(startDate.getDate() - 7);
                previousStartDate = new Date(startDate);
                previousStartDate.setDate(previousStartDate.getDate() - 7);
                break;
            case "month":
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                previousStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                break;
            case "year":
                startDate = new Date(now.getFullYear(), 0, 1);
                previousStartDate = new Date(now.getFullYear() - 1, 0, 1);
                break;
            default:
                return 0;
        }

        const currentPeriod = data.filter((item) => {
            const itemDate = new Date(item.created_at);
            return itemDate >= startDate && itemDate <= now;
        }).length;

        const previousPeriod = data.filter((item) => {
            const itemDate = new Date(item.created_at);
            const previousEndDate = new Date(startDate);
            previousEndDate.setMilliseconds(previousEndDate.getMilliseconds() - 1);
            return itemDate >= previousStartDate && itemDate <= previousEndDate;
        }).length;

        if (previousPeriod === 0) {
            return currentPeriod > 0 ? 100 : 0;
        }

        return Math.round(((currentPeriod - previousPeriod) / previousPeriod) * 100);
    };

    const calculateRevenueGrowth = (transactions, timeRange) => {
        if (!transactions || transactions.length === 0) return 0;

        const now = new Date();
        let startDate, previousStartDate;

        switch (timeRange) {
            case "today":
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                previousStartDate = new Date(startDate);
                previousStartDate.setDate(previousStartDate.getDate() - 1);
                break;
            case "week":
                startDate = new Date(now);
                startDate.setDate(startDate.getDate() - 7);
                previousStartDate = new Date(startDate);
                previousStartDate.setDate(previousStartDate.getDate() - 7);
                break;
            case "month":
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                previousStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                break;
            case "year":
                startDate = new Date(now.getFullYear(), 0, 1);
                previousStartDate = new Date(now.getFullYear() - 1, 0, 1);
                break;
            default:
                return 0;
        }

        const currentPeriod = transactions
            .filter((item) => {
                const itemDate = new Date(item.created_at);
                return itemDate >= startDate && itemDate <= now;
            })
            .reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);

        const previousPeriod = transactions
            .filter((item) => {
                const itemDate = new Date(item.created_at);
                const previousEndDate = new Date(startDate);
                previousEndDate.setMilliseconds(previousEndDate.getMilliseconds() - 1);
                return itemDate >= previousStartDate && itemDate <= previousEndDate;
            })
            .reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);

        if (previousPeriod === 0) {
            return currentPeriod > 0 ? 100 : 0;
        }

        return Math.round(((currentPeriod - previousPeriod) / previousPeriod) * 100);
    };

    // Tạo dữ liệu biểu đồ
    const generateChartData = (users, products, auctions) => {
        const data = [];
        const currentDate = new Date();
        const months = [];

        // Lấy 4 tháng gần nhất (tháng hiện tại và 3 tháng trước)
        for (let i = 3; i >= 0; i--) {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
            // Format: Tháng/Năm (ví dụ: "01/2024")
            const monthStr = String(date.getMonth() + 1).padStart(2, "0");
            const yearStr = date.getFullYear();
            months.push({
                key: `${yearStr}-${monthStr}`,
                label: `${monthStr}/${yearStr}`,
            });
        }

        // Dữ liệu người dùng theo tháng
        months.forEach((month) => {
            // Lọc người dùng được tạo trong tháng đó
            const monthUsers = users.filter((user) => {
                const userCreatedAt = new Date(user.created_at);
                const userMonth = userCreatedAt.toISOString().slice(0, 7);
                return userMonth === month.key;
            });

            data.push({
                date: month.label,
                value: monthUsers.length,
                type: "Người dùng",
            });
        });

        // Dữ liệu sản phẩm theo tháng
        months.forEach((month) => {
            // Lọc sản phẩm được tạo trong tháng đó
            const monthProducts = products.filter((product) => {
                const productCreatedAt = new Date(product.created_at);
                const productMonth = productCreatedAt.toISOString().slice(0, 7);
                return productMonth === month.key;
            });

            data.push({
                date: month.label,
                value: monthProducts.length,
                type: "Sản phẩm",
            });
        });

        // Dữ liệu đấu giá theo tháng
        months.forEach((month) => {
            // Lọc đấu giá được tạo trong tháng đó
            const monthAuctions = auctions.filter((auction) => {
                const auctionCreatedAt = new Date(auction.created_at);
                const auctionMonth = auctionCreatedAt.toISOString().slice(0, 7);
                return auctionMonth === month.key;
            });

            data.push({
                date: month.label,
                value: monthAuctions.length,
                type: "Đấu giá",
            });
        });

        return data;
    };

    const config = {
        data: chartData,
        xField: "date",
        yField: "value",
        seriesField: "type",
        smooth: true,
        color: ["#1890ff", "#52c41a", "#faad14"],
        legend: {
            position: "top",
        },
        tooltip: {
            formatter: (datum) => {
                return {
                    name: datum.type,
                    value: `${datum.value} ${datum.type === "Doanh thu" ? "VND" : ""}`,
                };
            },
        },
        animation: {
            appear: {
                animation: "path-in",
                duration: 1000,
            },
        },
        areaStyle: {
            fillOpacity: 0.6,
        },
        point: {
            size: 4,
            shape: "circle",
        },
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "success":
                return "success";
            case "pending":
                return "warning";
            case "failed":
                return "error";
            default:
                return "default";
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case "success":
                return "Thành công";
            case "pending":
                return "Đang xử lý";
            case "failed":
                return "Thất bại";
            default:
                return "Không xác định";
        }
    };

    return (
        <div style={{ padding: "24px" }}>
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
                {/* Tiêu đề và bộ lọc */}
                <Row justify="space-between" align="middle">
                    <Col>
                        <Title level={2}>Tổng quan</Title>
                    </Col>
                    <Col>
                        <Space>
                            <Select
                                defaultValue="week"
                                style={{ width: 120 }}
                                onChange={(value) => setTimeRange(value)}
                            >
                                <Option value="today">Hôm nay</Option>
                                <Option value="week">Tuần này</Option>
                                <Option value="month">Tháng này</Option>
                                <Option value="year">Năm nay</Option>
                            </Select>
                            <RangePicker />
                        </Space>
                    </Col>
                </Row>

                {/* Thống kê tổng quan */}
                <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12} md={6}>
                        <Card loading={loading}>
                            <Statistic
                                title="Tổng người dùng"
                                value={dashboardData.users.total}
                                prefix={<UserOutlined />}
                                suffix={
                                    <Tag
                                        color={dashboardData.users.growth >= 0 ? "success" : "error"}
                                        style={{ marginLeft: 8 }}
                                    >
                                        {dashboardData.users.growth >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}{" "}
                                        {Math.abs(dashboardData.users.growth)}%
                                    </Tag>
                                }
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card loading={loading}>
                            <Statistic
                                title="Tổng sản phẩm"
                                value={dashboardData.products.total}
                                prefix={<ShoppingOutlined />}
                                suffix={
                                    <Tag
                                        color={dashboardData.products.growth >= 0 ? "success" : "error"}
                                        style={{ marginLeft: 8 }}
                                    >
                                        {dashboardData.products.growth >= 0 ? (
                                            <ArrowUpOutlined />
                                        ) : (
                                            <ArrowDownOutlined />
                                        )}{" "}
                                        {Math.abs(dashboardData.products.growth)}%
                                    </Tag>
                                }
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card loading={loading}>
                            <Statistic
                                title="Đấu giá đang diễn ra"
                                value={dashboardData.activeAuctions.total}
                                prefix={<GiftOutlined />}
                                suffix={
                                    <Tag
                                        color={dashboardData.activeAuctions.growth >= 0 ? "success" : "error"}
                                        style={{ marginLeft: 8 }}
                                    >
                                        {dashboardData.activeAuctions.growth >= 0 ? (
                                            <ArrowUpOutlined />
                                        ) : (
                                            <ArrowDownOutlined />
                                        )}{" "}
                                        {Math.abs(dashboardData.activeAuctions.growth)}%
                                    </Tag>
                                }
                            />
                        </Card>
                    </Col>

                    <Col xs={24} sm={12} md={6}>
                        <Card loading={loading}>
                            <Statistic
                                title="Doanh thu"
                                value={dashboardData.revenue.total.toLocaleString("vi-VN")}
                                prefix={<DollarOutlined />}
                                suffix={
                                    <Tag
                                        color={dashboardData.revenue.growth >= 0 ? "success" : "error"}
                                        style={{ marginLeft: 8 }}
                                    >
                                        {dashboardData.revenue.growth >= 0 ? (
                                            <ArrowUpOutlined />
                                        ) : (
                                            <ArrowDownOutlined />
                                        )}{" "}
                                        {Math.abs(dashboardData.revenue.growth)}%
                                    </Tag>
                                }
                            />
                        </Card>
                    </Col>
                </Row>

                {/* Biểu đồ thống kê */}
                <Row gutter={[16, 16]}>
                    <Col span={24}>
                        <Card title="Biểu đồ thống kê" loading={loading}>
                            <Area {...config} />
                        </Card>
                    </Col>
                </Row>

                {/* Giao dịch gần đây và Top sản phẩm */}
                <Row gutter={[16, 16]}>
                    <Col xs={24} md={16}>
                        <Card title="Giao dịch gần đây" loading={loading}>
                            <List
                                dataSource={recentTransactions}
                                renderItem={(item) => (
                                    <List.Item>
                                        <List.Item.Meta
                                            title={item.product}
                                            description={`${item.user} - ${item.date}`}
                                        />
                                        <Space>
                                            <span>{item.amount.toLocaleString()} VND</span>
                                            <Tag color={getStatusColor(item.status)}>{getStatusText(item.status)}</Tag>
                                        </Space>
                                    </List.Item>
                                )}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} md={8}>
                        <Card title="Top sản phẩm đấu giá" loading={loading}>
                            <List
                                dataSource={topProducts}
                                renderItem={(item, index) => (
                                    <List.Item>
                                        <List.Item.Meta
                                            avatar={<Tag color="blue">#{index + 1}</Tag>}
                                            title={item.title}
                                            description={`${item.price.toLocaleString()} VND`}
                                        />
                                        <Tag color="green">{item.bids} lượt đăng ký</Tag>
                                    </List.Item>
                                )}
                            />
                        </Card>
                    </Col>
                </Row>
            </Space>
        </div>
    );
};

export default DashboardPage;
