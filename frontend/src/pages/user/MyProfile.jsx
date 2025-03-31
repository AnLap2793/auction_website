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
    Empty
} from 'antd';
import {
    UserOutlined,
    MailOutlined,
    PhoneOutlined,
    HomeOutlined,
    EditOutlined,
    UploadOutlined,
    ShoppingOutlined,
    HistoryOutlined
} from '@ant-design/icons';
import { updateUser, getUserBidStats } from '../../services/apiUser';
import auctionService from '../../services/auctionService';
import transactionService from '../../services/transactionService';

const { Title, Text, Paragraph } = Typography;

const MyProfile = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [editMode, setEditMode] = useState(false);
    const [loading, setLoading] = useState(true);
    const [bidHistory, setBidHistory] = useState([]);
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
                    amount: `${item.amount.toLocaleString('vi-VN')} đ`,
                    status: getTransactionStatus(item.status),
                    transaction_code: item.transaction_code,
                    payment_method: item.payment_method,
                    product_id: item.product_id
                }));

                setBidHistory(formattedBidHistory);
            } else {
                message.error('Không thể lấy thông tin đặt giá');
                setBidHistory([]);
                setStatistics({
                    totalBids: 0,
                    auctionsWon: 0,
                    activeBids: 0
                });
            }
        } catch (error) {
            console.error('Lỗi khi lấy dữ liệu người dùng:', error);
            message.error('Không thể tải dữ liệu. Vui lòng thử lại sau.');
            // Reset các state về giá trị mặc định khi có lỗi
            setBidHistory([]);
            setStatistics({
                totalBids: 0,
                auctionsWon: 0,
                activeBids: 0
            });
        } finally {
            setLoading(false);
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

    // Định dạng thời gian còn lại
    const formatTimeRemaining = (endTimeStr) => {
        const endTime = new Date(endTimeStr);
        const now = new Date();
        const diffMs = endTime - now;

        if (diffMs <= 0) return 'Đã kết thúc';

        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const diffHours = Math.floor(
            (diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const diffMinutes = Math.floor(
            (diffMs % (1000 * 60 * 60)) / (1000 * 60)
        );

        if (diffDays > 0) {
            return `${diffDays}d ${diffHours}h`;
        } else if (diffHours > 0) {
            return `${diffHours}h ${diffMinutes}m`;
        } else {
            return `${diffMinutes}m`;
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
                    <List
                        itemLayout='horizontal'
                        dataSource={bidHistory}
                        renderItem={(item) => (
                            <List.Item actions={[getStatusTag(item.status)]}>
                                <List.Item.Meta
                                    title={item.item}
                                    description={`Đặt giá: ${item.amount} vào ngày ${item.date}`}
                                />
                            </List.Item>
                        )}
                    />
                ) : (
                    <Empty description='Bạn chưa tham gia đấu giá nào' />
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
