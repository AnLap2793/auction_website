import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    Card,
    Tabs,
    Form,
    Input,
    Button,
    Upload,
    Avatar,
    message,
    Divider,
    List,
    Row,
    Col,
    Typography,
    Space,
    Statistic,
    Tag,
    Spin,
    Empty,
    Table,
    Modal
} from 'antd';
import {
    UserOutlined,
    MailOutlined,
    PhoneOutlined,
    HomeOutlined,
    EditOutlined,
    UploadOutlined,
    ShoppingOutlined,
    HistoryOutlined,
    FileTextOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    ClockCircleOutlined,
    DollarOutlined
} from '@ant-design/icons';
import { updateUser, getUserBidStats } from '../../services/apiUser';
import auctionService from '../../services/auctionService';
import transactionService from '../../services/transactionService';
import paymentService from '../../services/paymentService';

const { Title, Text, Paragraph } = Typography;

const MyProfile = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [editMode, setEditMode] = useState(false);
    const [loading, setLoading] = useState(true);
    const [bidHistory, setBidHistory] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [statistics, setStatistics] = useState({
        totalBids: 0,
        auctionsWon: 0,
        activeBids: 0
    });
    const dataFetchedRef = useRef(false);

    // Dữ liệu người dùng từ context
    const [profile, setProfile] = useState({
        name: '',
        email: '',
        phone: '',
        address: ''
    });

    const [form] = Form.useForm();

    // Lấy dữ liệu người dùng từ context khi component được tải
    useEffect(() => {
        if (user && !dataFetchedRef.current) {
            dataFetchedRef.current = true;
            setProfile({
                name: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
                email: user.email || '',
                phone: user.phone_number || '',
                address: user.address || ''
            });

            // Tải dữ liệu đấu giá và đặt giá
            fetchUserData();
        } else if (!user) {
            setLoading(false);
        }
    }, [user]);

    // Tải dữ liệu đấu giá và giao dịch của người dùng
    const fetchUserData = async () => {
        setLoading(true);
        try {
            // Lấy thống kê đặt giá của người dùng
            const response = await getUserBidStats(user.id);

            console.log(response);

            if (response.success) {
                const { totalBids, auctionsWon, activeBids, bidHistory } =
                    response.data;

                // Cập nhật thống kê
                setStatistics({
                    totalBids,
                    auctionsWon,
                    activeBids
                });

                // Chuyển đổi định dạng dữ liệu cho lịch sử đặt giá
                const formattedBidHistory = bidHistory.map((item) => ({
                    id: item.id,
                    item: item.item,
                    date: new Date(item.date).toLocaleDateString('vi-VN'),
                    amount: `${Number(item.amount).toLocaleString(
                        'vi-VN'
                    )} VNĐ`,
                    status: getTransactionStatus(item.status),
                    auction_id: item.auction_id,
                    product_id: item.product_id
                }));

                console.log(formattedBidHistory);

                setBidHistory(formattedBidHistory);
            } else {
                setBidHistory([]);
                setStatistics({
                    totalBids: 0,
                    auctionsWon: 0,
                    activeBids: 0
                });
            }

            // Lấy dữ liệu giao dịch
            await fetchTransactions();
        } catch (error) {
            console.error('Lỗi khi lấy dữ liệu người dùng:', error);
            message.error('Không thể tải dữ liệu. Vui lòng thử lại sau.');
            // Reset các state về giá trị mặc định khi có lỗi
            setBidHistory([]);
            setTransactions([]);
            setStatistics({
                totalBids: 0,
                auctionsWon: 0,
                activeBids: 0
            });
        } finally {
            setLoading(false);
        }
    };

    // Lấy dữ liệu giao dịch của người dùng
    const fetchTransactions = async () => {
        try {
            const response = await transactionService.getUserTransactions(
                user.id
            );
            if (response.success) {
                const formattedTransactions = response.data.map((trans) => ({
                    id: trans.id,
                    transactionCode: trans.transaction_code,
                    amount: Number(trans.amount),
                    paymentMethod: trans.payment_method,
                    status: trans.status,
                    date: new Date(trans.created_at).toLocaleDateString(
                        'vi-VN'
                    ),
                    productTitle:
                        trans.Auction?.Product?.title || 'Sản phẩm đấu giá'
                }));
                setTransactions(formattedTransactions);
            } else {
                setTransactions([]);
            }
        } catch (error) {
            console.error('Lỗi khi lấy dữ liệu giao dịch:', error);
            setTransactions([]);
        }
    };

    // Chuyển đổi trạng thái giao dịch sang định dạng hiển thị
    const getTransactionStatus = (status) => {
        switch (status) {
            case 'completed':
                return 'Won';
            case 'cancelled':
                return 'Outbid';
            case 'pending':
                return 'Pending';
            default:
                return status;
        }
    };

    const handleSave = async (values) => {
        try {
            // Phân tách tên thành first_name và last_name
            const nameParts = values.name.split(' ');
            const lastName = nameParts.pop();
            const firstName = nameParts.join(' ');

            // Chuẩn bị dữ liệu người dùng để cập nhật
            const userData = {
                first_name: firstName,
                last_name: lastName,
                email: values.email,
                phone_number: values.phone,
                address: values.address
            };

            console.log(userData);

            // Gọi API cập nhật thông tin người dùng
            await updateUser(user.id, userData);

            // Cập nhật state profile
            setProfile({ ...profile, ...values });
            setEditMode(false);
            message.success('Cập nhật hồ sơ thành công!');
        } catch (error) {
            console.error('Lỗi khi cập nhật hồ sơ:', error);
            message.error('Không thể cập nhật hồ sơ. Vui lòng thử lại sau.');
        }
    };

    const handleEditToggle = () => {
        if (!editMode) {
            form.setFieldsValue(profile);
        }
        setEditMode(!editMode);
    };

    const navigateToMyAuctions = () => {
        navigate('/my-auctions');
    };

    const getStatusTag = (status) => {
        let color;
        if (status === 'Won') color = 'success';
        else if (status === 'Outbid') color = 'error';
        else color = 'processing';

        return <Tag color={color}>{status}</Tag>;
    };

    // Thêm hàm xử lý thanh toán
    const handlePayment = async (transaction) => {
        try {
            // Chuyển đến trang xác nhận thanh toán với thông tin transaction
            navigate(`/payment-confirm`, {
                state: {
                    transaction: {
                        id: transaction.id,
                        amount: transaction.amount,
                        transactionCode: transaction.transactionCode,
                        productTitle: transaction.productTitle
                    }
                }
            });
        } catch (error) {
            console.error('Lỗi khi xử lý thanh toán:', error);
            message.error('Có lỗi xảy ra khi xử lý thanh toán');
        }
    };

    // Cập nhật cấu hình cột cho bảng hóa đơn
    const transactionColumns = [
        {
            title: 'Mã hóa đơn',
            dataIndex: 'transactionCode',
            key: 'transactionCode',
            render: (code) => <Text copyable>{code}</Text>
        },
        {
            title: 'Sản phẩm',
            dataIndex: 'productTitle',
            key: 'productTitle'
        },
        {
            title: 'Số tiền',
            dataIndex: 'amount',
            key: 'amount',
            render: (amount) => `${amount.toLocaleString('vi-VN')} VNĐ`
        },
        {
            title: 'Phương thức',
            dataIndex: 'paymentMethod',
            key: 'paymentMethod'
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'date',
            key: 'date'
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                let color = 'default';
                let icon = null;

                if (status === 'completed') {
                    color = 'success';
                    icon = <CheckCircleOutlined />;
                } else if (status === 'failed') {
                    color = 'error';
                    icon = <CloseCircleOutlined />;
                } else {
                    color = 'processing';
                    icon = <ClockCircleOutlined />;
                }

                return (
                    <Tag color={color} icon={icon}>
                        {getPaymentStatus(status)}
                    </Tag>
                );
            }
        },
        {
            title: 'Thao tác',
            key: 'action',
            render: (_, record) => {
                // Chỉ hiển thị nút thanh toán cho các giao dịch có trạng thái pending
                if (record.status === 'pending') {
                    return (
                        <Button
                            type='primary'
                            icon={<DollarOutlined />}
                            onClick={() => handlePayment(record)}
                        >
                            Thanh toán
                        </Button>
                    );
                }
                return null;
            }
        }
    ];

    // Chuyển đổi trạng thái thanh toán sang tiếng Việt
    const getPaymentStatus = (status) => {
        switch (status) {
            case 'completed':
                return 'Đã thanh toán';
            case 'failed':
                return 'Thất bại';
            case 'pending':
                return 'Đang xử lý';
            default:
                return status;
        }
    };

    // Cấu hình các tab cho component Tabs
    const tabItems = [
        {
            key: '1',
            label: (
                <span>
                    <HistoryOutlined /> Lịch Sử Đấu Giá
                </span>
            ),
            children:
                bidHistory.length > 0 ? (
                    <>
                        <List
                            itemLayout='horizontal'
                            dataSource={bidHistory}
                            pagination={{
                                pageSize: 5,
                                size: 'small',
                                showSizeChanger: false,
                                showTotal: (total) =>
                                    `Tổng ${total} lần đấu giá`
                            }}
                            renderItem={(item) => (
                                <List.Item
                                    actions={[
                                        <Button
                                            type='link'
                                            size='small'
                                            onClick={() =>
                                                navigate(
                                                    `/auction/${item.auction_id}`
                                                )
                                            }
                                        >
                                            Xem
                                        </Button>
                                    ]}
                                >
                                    <List.Item.Meta
                                        title={
                                            <Space size='small'>
                                                <span>{item.item}</span>
                                                {item.status === 'Won' && (
                                                    <Tag
                                                        color='gold'
                                                        size='small'
                                                    >
                                                        Thắng
                                                    </Tag>
                                                )}
                                            </Space>
                                        }
                                        description={
                                            <Text
                                                type='secondary'
                                                style={{ fontSize: '12px' }}
                                            >
                                                {item.date} - {item.amount}
                                            </Text>
                                        }
                                    />
                                    {getStatusTag(item.status)}
                                </List.Item>
                            )}
                            style={{
                                backgroundColor: '#fff',
                                borderRadius: '8px'
                            }}
                        />
                    </>
                ) : (
                    <Empty description='Bạn chưa tham gia đấu giá nào' />
                )
        },
        {
            key: '2',
            label: (
                <span>
                    <FileTextOutlined /> Hóa Đơn
                </span>
            ),
            children:
                transactions.length > 0 ? (
                    <Table
                        dataSource={transactions}
                        columns={transactionColumns}
                        rowKey='id'
                        pagination={{
                            pageSize: 5,
                            size: 'small',
                            showSizeChanger: false
                        }}
                        size='small'
                    />
                ) : (
                    <Empty description='Bạn chưa có hóa đơn nào' />
                )
        }
    ];

    // Hiển thị loading khi đang tải dữ liệu
    if (loading) {
        return (
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh'
                }}
            >
                <Spin size='large' />
                <Text style={{ marginTop: '16px' }}>Đang tải dữ liệu...</Text>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
            <Row gutter={[24, 24]}>
                {/* Profile Card */}
                <Col xs={24} lg={8}>
                    <Card>
                        <Space
                            direction='vertical'
                            align='center'
                            style={{ width: '100%', marginBottom: '24px' }}
                        >
                            <Avatar
                                size={120}
                                icon={<UserOutlined />}
                                src={profile.avatar}
                                style={{ marginBottom: '16px' }}
                            />
                            <Title level={3}>{profile.name}</Title>
                            <Text type='secondary'>{profile.email}</Text>
                            <Button
                                type='primary'
                                icon={<EditOutlined />}
                                onClick={handleEditToggle}
                                style={{ marginTop: '16px' }}
                            >
                                {editMode ? 'Hủy Chỉnh Sửa' : 'Chỉnh Sửa Hồ Sơ'}
                            </Button>
                            <Button
                                icon={<ShoppingOutlined />}
                                onClick={navigateToMyAuctions}
                                style={{ marginTop: '8px', width: '100%' }}
                            >
                                Các Phiên Đấu Giá Của Tôi
                            </Button>
                        </Space>

                        {!editMode && (
                            <Space
                                direction='vertical'
                                style={{ width: '100%' }}
                            >
                                <Space align='start'>
                                    <MailOutlined
                                        style={{ color: '#bfbfbf' }}
                                    />
                                    <div>
                                        <Text strong>Email</Text>
                                        <br />
                                        <Text>{profile.email}</Text>
                                    </div>
                                </Space>
                                <Space align='start'>
                                    <PhoneOutlined
                                        style={{ color: '#bfbfbf' }}
                                    />
                                    <div>
                                        <Text strong>Số điện thoại</Text>
                                        <br />
                                        <Text>
                                            {profile.phone || 'Chưa cung cấp'}
                                        </Text>
                                    </div>
                                </Space>
                                <Space align='start'>
                                    <HomeOutlined
                                        style={{ color: '#bfbfbf' }}
                                    />
                                    <div>
                                        <Text strong>Địa chỉ</Text>
                                        <br />
                                        <Text>
                                            {profile.address || 'Chưa cung cấp'}
                                        </Text>
                                    </div>
                                </Space>
                            </Space>
                        )}

                        {editMode && (
                            <Form
                                form={form}
                                layout='vertical'
                                initialValues={profile}
                                onFinish={handleSave}
                            >
                                <Form.Item
                                    name='name'
                                    label='Họ và tên'
                                    rules={[
                                        {
                                            required: true,
                                            message: 'Vui lòng nhập họ và tên'
                                        }
                                    ]}
                                >
                                    <Input
                                        prefix={<UserOutlined />}
                                        placeholder='Họ và tên của bạn'
                                    />
                                </Form.Item>

                                <Form.Item
                                    name='email'
                                    label='Email'
                                    rules={[
                                        {
                                            required: true,
                                            message: 'Vui lòng nhập email'
                                        },
                                        {
                                            type: 'email',
                                            message:
                                                'Vui lòng nhập đúng định dạng email'
                                        }
                                    ]}
                                >
                                    <Input
                                        prefix={<MailOutlined />}
                                        placeholder='Email của bạn'
                                    />
                                </Form.Item>

                                <Form.Item name='phone' label='Số điện thoại'>
                                    <Input
                                        prefix={<PhoneOutlined />}
                                        placeholder='Số điện thoại của bạn'
                                    />
                                </Form.Item>

                                <Form.Item name='address' label='Địa chỉ'>
                                    <Input
                                        prefix={<HomeOutlined />}
                                        placeholder='Địa chỉ của bạn'
                                    />
                                </Form.Item>
                                <Form.Item>
                                    <Button
                                        type='primary'
                                        htmlType='submit'
                                        block
                                    >
                                        Lưu Thay Đổi
                                    </Button>
                                </Form.Item>
                            </Form>
                        )}
                    </Card>
                </Col>

                {/* Activity & Statistics */}
                <Col xs={24} lg={16}>
                    <Card title='Thống Kê Tài Khoản'>
                        <Row gutter={[16, 16]}>
                            <Col xs={12} md={6}>
                                <Statistic
                                    title='Tổng Số Lần Đặt Giá'
                                    value={statistics.totalBids}
                                    valueStyle={{ color: '#1890ff' }}
                                />
                            </Col>
                            <Col xs={12} md={6}>
                                <Statistic
                                    title='Phiên Đấu Giá Thắng'
                                    value={statistics.auctionsWon}
                                    valueStyle={{ color: '#52c41a' }}
                                />
                            </Col>
                            <Col xs={12} md={6}>
                                <Statistic
                                    title='Đặt Giá Đang Chờ'
                                    value={statistics.activeBids}
                                    valueStyle={{ color: '#faad14' }}
                                />
                            </Col>
                        </Row>

                        <Divider />

                        <div>
                            <Title level={4}>Hoạt Động Gần Đây</Title>
                            {bidHistory.length > 0 ? (
                                <List
                                    itemLayout='horizontal'
                                    dataSource={bidHistory
                                        .slice(0, 3)
                                        .map(
                                            (item) =>
                                                `Bạn đã ${
                                                    item.status === 'Won'
                                                        ? 'thắng'
                                                        : item.status ===
                                                          'Outbid'
                                                        ? 'bị vượt giá trong'
                                                        : 'tham gia'
                                                } phiên đấu giá "${
                                                    item.item
                                                }" (${item.date})`
                                        )}
                                    renderItem={(item) => (
                                        <List.Item>
                                            <Text>{item}</Text>
                                        </List.Item>
                                    )}
                                />
                            ) : (
                                <Empty description='Chưa có hoạt động nào gần đây' />
                            )}
                        </div>
                    </Card>

                    <Card style={{ marginTop: '24px' }}>
                        <Tabs defaultActiveKey='1' items={tabItems} />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default MyProfile;
