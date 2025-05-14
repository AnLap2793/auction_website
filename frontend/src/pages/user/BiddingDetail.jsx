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
    Spin,
    List,
    Empty
} from 'antd';
import {
    ClockCircleOutlined,
    UserOutlined,
    DollarOutlined,
    HistoryOutlined
} from '@ant-design/icons';
import auctionService from '../../services/auctionService';
import { getAllCategories } from '../../services/categoryService';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import moment from 'moment';

const { Title, Text, Paragraph } = Typography;

const BiddingDetail = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const { socket, connected, joinAuctionRoom, leaveAuctionRoom } =
        useSocket();
    const [auction, setAuction] = useState(null);
    const [loading, setLoading] = useState(true);
    const [bidAmount, setBidAmount] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentHighestBid, setCurrentHighestBid] = useState(0);
    const [categories, setCategories] = useState([]);
    const [bidHistory, setBidHistory] = useState([]);
    const [isRegistered, setIsRegistered] = useState(false);
    const [registrationStatus, setRegistrationStatus] = useState(null);
    const [loadingRegistration, setLoadingRegistration] = useState(false);
    const [timeLeft, setTimeLeft] = useState('');
    const [countdown, setCountdown] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchAuctionDetails();
        fetchCategories();
        if (user) {
            checkRegistrationStatus();
        }
    }, [id, user]);

    // Tham gia phòng đấu giá khi component được mount
    useEffect(() => {
        if (connected && id) {
            joinAuctionRoom(id);
        }

        return () => {
            if (connected && id) {
                leaveAuctionRoom(id);
                if (countdown) {
                    clearInterval(countdown);
                }
            }
        };
    }, [connected, id, joinAuctionRoom, leaveAuctionRoom]);

    // Đăng ký lắng nghe sự kiện Socket.IO
    useEffect(() => {
        if (!socket) return;

        // Lắng nghe sự kiện có người đặt giá mới
        socket.on('newBid', (data) => {
            console.log('Nhận sự kiện newBid:', data);

            // Đảm bảo dữ liệu có định dạng đúng trước khi thêm vào lịch sử đặt giá
            const safeData = {
                ...data,
                user_id: data.user_id || 'unknown',
                User: data.user || { first_name: 'Người dùng', last_name: '' },
                bid_amount: data.bid_amount || 0
            };

            // Cập nhật danh sách lịch sử đặt giá
            setBidHistory((prevBids) => [safeData, ...prevBids]);

            // Cập nhật thông tin phiên đấu giá
            setAuction((prevAuction) => {
                if (!prevAuction) return null;
                const updatedAuction = {
                    ...prevAuction,
                    current_bid: data.bid_amount,
                    current_winner_id: data.user_id
                };

                // Cập nhật giá cao nhất hiện tại
                setCurrentHighestBid(parseFloat(data.bid_amount));

                // Cập nhật giá đặt tối thiểu
                const bidIncrement = prevAuction.bid_increment || 500000;
                setBidAmount(
                    parseFloat(data.bid_amount) + parseFloat(bidIncrement)
                );

                return updatedAuction;
            });

            // Hiển thị thông báo
            if (data.user) {
                message.info(
                    `${data.user.first_name || 'Người dùng'} ${
                        data.user.last_name || ''
                    } đã đặt giá ${parseFloat(
                        data.bid_amount
                    ).toLocaleString()} VNĐ`
                );
            } else {
                message.info(
                    `Có người đã đặt giá ${parseFloat(
                        data.bid_amount
                    ).toLocaleString()} VNĐ`
                );
            }
        });

        // Lắng nghe sự kiện phiên đấu giá kết thúc
        socket.on('auctionEnded', (data) => {
            console.log('Nhận sự kiện auctionEnded:', data);

            setAuction((prevAuction) => {
                if (!prevAuction) return null;
                return {
                    ...prevAuction,
                    status: 'closed'
                };
            });

            if (countdown) {
                clearInterval(countdown);
            }

            if (data.winner) {
                if (data.winner.id === user?.id) {
                    message.success(
                        'Chúc mừng! Bạn đã thắng phiên đấu giá này!'
                    );
                } else {
                    message.info(
                        `Phiên đấu giá đã kết thúc. Người thắng: ${data.winner.name}`
                    );
                }
            } else {
                message.info(
                    'Phiên đấu giá đã kết thúc. Không có người thắng cuộc.'
                );
            }
        });

        // Lắng nghe sự kiện phiên đấu giá bắt đầu
        socket.on('auctionStarted', (data) => {
            console.log('Nhận sự kiện auctionStarted:', data);

            if (data.auction_id === id) {
                message.info('Phiên đấu giá đã bắt đầu!');
                fetchAuctionDetails(); // Tải lại thông tin phiên đấu giá
            }
        });

        return () => {
            socket.off('newBid');
            socket.off('auctionEnded');
            socket.off('auctionStarted');
        };
    }, [socket, auction, user, id]);

    // Tính toán thời gian còn lại
    useEffect(() => {
        if (!auction) return;

        const updateTimeLeft = () => {
            const now = moment();
            const end = moment(auction.end_time);

            // Nếu phiên đấu giá đã kết thúc
            if (now.isAfter(end) || auction.status === 'closed') {
                if (countdown) {
                    clearInterval(countdown);
                }
                setTimeLeft('Đã kết thúc');
                return;
            }

            // Nếu phiên đấu giá chưa bắt đầu
            const start = moment(auction.start_time);
            if (now.isBefore(start)) {
                const diff = moment.duration(start.diff(now));
                setTimeLeft(
                    `Bắt đầu sau: ${Math.floor(
                        diff.asHours()
                    )}h ${diff.minutes()}m ${diff.seconds()}s`
                );
                return;
            }

            // Nếu phiên đấu giá đang diễn ra
            const diff = moment.duration(end.diff(now));
            setTimeLeft(
                `Còn lại: ${Math.floor(
                    diff.asHours()
                )}h ${diff.minutes()}m ${diff.seconds()}s`
            );
        };

        updateTimeLeft();
        const intervalId = setInterval(updateTimeLeft, 1000);
        setCountdown(intervalId);

        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [auction]);

    const fetchAuctionDetails = async () => {
        try {
            setLoading(true);
            const response = await auctionService.getAuctionById(id);
            console.log('Dữ liệu phiên đấu giá:', response);

            if (response.success) {
                const auctionData = response.data;
                setAuction(auctionData);

                // Khởi tạo giá đặt cược ban đầu - đảm bảo giá trị là số
                const startingBid =
                    Number(auctionData.Product?.starting_price) || 0;
                const currentBid =
                    Number(auctionData.current_bid) || startingBid;
                const bidIncrement =
                    Number(auctionData.bid_increment) || 500000;
                setCurrentHighestBid(currentBid);
                setBidAmount(currentBid + bidIncrement); // Tăng theo bid_increment

                // Lấy lịch sử đấu giá nếu có
                try {
                    const bidHistoryResponse =
                        await auctionService.getAuctionBids(id);
                    console.log(bidHistoryResponse);
                    if (bidHistoryResponse && bidHistoryResponse.success) {
                        setBidHistory(bidHistoryResponse.data || []);
                    }
                } catch (error) {
                    console.error('Lỗi khi lấy lịch sử đấu giá:', error);
                    message.warning('Không thể tải lịch sử đấu giá');
                    setBidHistory([]);
                }
            }
        } catch (error) {
            message.error('Không thể tải thông tin phiên đấu giá');
            console.error('Lỗi khi tải thông tin phiên đấu giá:', error);
        } finally {
            setLoading(false);
        }
    };

    const checkRegistrationStatus = async () => {
        if (!user || !id) return;

        try {
            setLoadingRegistration(true);
            const response = await auctionService.getAuctionRegistrations(id);
            console.log(response);

            if (
                response.success &&
                response.data &&
                response.data.registrations
            ) {
                // Kiểm tra xem người dùng đã đăng ký chưa
                const userRegistration = response.data.registrations.find(
                    (reg) => reg.user.id === user.id
                );

                if (userRegistration) {
                    // Lưu trạng thái đăng ký
                    setRegistrationStatus(userRegistration.status);
                    // Coi là đã đăng ký thành công nếu status là 'approved'
                    setIsRegistered(userRegistration.status === 'approved');
                } else {
                    setIsRegistered(false);
                    setRegistrationStatus(null);
                }
            }
        } catch (error) {
            console.error('Lỗi khi kiểm tra trạng thái đăng ký:', error);
        } finally {
            setLoadingRegistration(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const categoriesData = await getAllCategories();
            setCategories(categoriesData.data || []);
        } catch (error) {
            console.error('Lỗi khi tải danh mục:', error);
        }
    };

    const showBidModal = () => {
        if (!user) {
            message.warning('Vui lòng đăng nhập để đặt giá');
            return;
        }

        if (!isRegistered) {
            message.warning(
                'Bạn cần đăng ký tham gia đấu giá trước khi đặt giá'
            );
            return;
        }

        setIsModalOpen(true);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    const handleBid = async () => {
        // Đảm bảo bidAmount là số
        const numericBidAmount = Number(bidAmount);
        const numericCurrentHighestBid = Number(currentHighestBid);
        const numericBidIncrement = Number(auction.bid_increment || 500000);

        // Kiểm tra giá đặt có cao hơn giá hiện tại
        if (numericBidAmount <= numericCurrentHighestBid) {
            message.error('Giá đặt phải cao hơn giá hiện tại');
            return;
        }

        // Kiểm tra giá đặt có phù hợp với bid_increment
        if (numericBidAmount < numericCurrentHighestBid + numericBidIncrement) {
            message.error(
                `Giá đặt phải cao hơn giá hiện tại ít nhất ${numericBidIncrement.toLocaleString()} VNĐ`
            );
            return;
        }

        try {
            setSubmitting(true);
            const response = await auctionService.placeBid(id, {
                bid_amount: numericBidAmount
            });

            if (response.success) {
                message.success(
                    `Đã đặt giá thành công: ${numericBidAmount.toLocaleString()} VNĐ`
                );
                setIsModalOpen(false);

                // Tải lại thông tin phiên đấu giá và lịch sử đấu giá
                // fetchAuctionDetails();
                // fetchCategories();
            } else {
                message.error(response.message || 'Đặt giá thất bại');
            }
        } catch (error) {
            message.error(error.response?.data?.message || 'Đặt giá thất bại');
            console.error('Lỗi khi đặt giá:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleRegister = async () => {
        if (!user) {
            message.warning('Vui lòng đăng nhập để đăng ký tham gia đấu giá');
            return;
        }

        if (isRegistered) {
            message.info('Bạn đã đăng ký tham gia phiên đấu giá này rồi');
            return;
        }

        try {
            setLoadingRegistration(true);
            const response = await auctionService.registerForAuction(id);

            if (response.success) {
                message.success('Đăng ký tham gia đấu giá thành công!');
                // Cập nhật trạng thái đăng ký
                setRegistrationStatus('pending');
                message.info('Đăng ký của bạn đang chờ phê duyệt từ người bán');
            } else {
                message.error(
                    response.message || 'Đăng ký tham gia đấu giá thất bại'
                );
            }
        } catch (error) {
            message.error(
                error.response?.data?.message ||
                    'Đăng ký tham gia đấu giá thất bại'
            );
            console.error('Lỗi khi đăng ký tham gia đấu giá:', error);
        } finally {
            setLoadingRegistration(false);
        }
    };

    const getRegistrationStatusText = () => {
        if (!user) return '';
        if (!registrationStatus) return '';

        switch (registrationStatus) {
            case 'pending':
                return 'Đang chờ phê duyệt';
            case 'approved':
                return 'Đã được phê duyệt';
            case 'rejected':
                return 'Đã bị từ chối';
            default:
                return registrationStatus;
        }
    };

    const getRegistrationStatusTag = () => {
        if (!user) return null;
        if (!registrationStatus) return null;

        const statusColor = {
            pending: 'orange',
            approved: 'green',
            rejected: 'red'
        };

        return (
            <Tag color={statusColor[registrationStatus] || 'default'}>
                {getRegistrationStatusText()}
            </Tag>
        );
    };

    // Lấy tên danh mục từ ID
    const getCategoryName = (categoryId) => {
        const category = categories.find((cat) => cat.id === categoryId);
        return category ? category.name : 'Chưa phân loại';
    };

    // Lấy status tag
    const getStatusTag = () => {
        if (!auction) return null;

        switch (auction.status) {
            case 'pending':
                return <Tag color='blue'>Sắp diễn ra</Tag>;
            case 'active':
                return <Tag color='green'>Đang diễn ra</Tag>;
            case 'closed':
                return <Tag color='red'>Đã kết thúc</Tag>;
            case 'canceled':
                return <Tag color='gray'>Đã hủy</Tag>;
            default:
                return <Tag>Không xác định</Tag>;
        }
    };

    // Hiển thị trang loading
    if (loading) {
        return (
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '50vh',
                    flexDirection: 'column'
                }}
            >
                <Spin size='large' />
                <div style={{ marginTop: '15px' }}>
                    Đang tải thông tin phiên đấu giá...
                </div>
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

    // Tính thời gian còn lại
    const getTimeRemaining = () => {
        const endTime = new Date(auction.end_time).getTime();
        return endTime;
    };

    // Tính toán giá đặt tối thiểu
    const bidIncrement = Number(auction.bid_increment) || 500000;
    const minimumBid = Number(currentHighestBid) + bidIncrement;

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
                                    auction.Product?.ProductImages?.[0]
                                        ?.image_url ||
                                    'https://placeholder.com/400'
                                }
                                alt={auction.Product?.title}
                                style={{ width: '100%', height: 'auto' }}
                            />
                            <div style={{ marginTop: '20px' }}>
                                <Row gutter={[8, 8]}>
                                    {auction.Product?.ProductImages?.map(
                                        (img, index) => (
                                            <Col span={8} key={index}>
                                                <Image
                                                    src={img.image_url}
                                                    alt={`${
                                                        auction.Product?.title
                                                    } ảnh ${index + 1}`}
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
                                {getCategoryName(auction.Product?.category_id)}
                            </Tag>
                            <Title level={2}>{auction.Product?.title}</Title>

                            {/* Item stats */}
                            <Row gutter={16} style={{ marginBottom: '20px' }}>
                                <Col span={12}>
                                    <Statistic
                                        title='Giá hiện tại'
                                        value={currentHighestBid}
                                        precision={0}
                                        valueStyle={{ color: '#1890ff' }}
                                        prefix={<DollarOutlined />}
                                        suffix='VNĐ'
                                        formatter={(value) =>
                                            `${Number(value).toLocaleString()}`
                                        }
                                    />
                                </Col>
                                <Col span={12}>
                                    <Statistic
                                        title='Giá khởi điểm'
                                        value={
                                            auction.Product?.starting_price || 0
                                        }
                                        precision={0}
                                        formatter={(value) =>
                                            `${Number(value).toLocaleString()}`
                                        }
                                        suffix='VNĐ'
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
                                            value={getTimeRemaining()}
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
                            {auction.status === 'active' && (
                                <Space
                                    direction='vertical'
                                    size='large'
                                    style={{ width: '100%' }}
                                >
                                    {isRegistered ? (
                                        <>
                                            <Space direction='horizontal'>
                                                <Text>
                                                    Nhập giá đặt tối đa của bạn:
                                                </Text>
                                                <Text type='secondary'>
                                                    Giá đặt tối thiểu:{' '}
                                                    {Number(
                                                        minimumBid
                                                    ).toLocaleString()}{' '}
                                                    VNĐ
                                                </Text>
                                            </Space>
                                            <Space.Compact>
                                                <Input
                                                    style={{
                                                        width: 'calc(100% - 120px)'
                                                    }}
                                                    type='number'
                                                    value={bidAmount}
                                                    placeholder={Number(
                                                        minimumBid
                                                    ).toString()}
                                                    onChange={(e) =>
                                                        setBidAmount(
                                                            Number(
                                                                e.target.value
                                                            )
                                                        )
                                                    }
                                                    min={minimumBid}
                                                    step={bidIncrement}
                                                    suffix='VNĐ'
                                                />
                                                <Button
                                                    type='primary'
                                                    style={{ width: '120px' }}
                                                    onClick={showBidModal}
                                                >
                                                    Đặt giá
                                                </Button>
                                            </Space.Compact>
                                        </>
                                    ) : registrationStatus ? (
                                        <div style={{ textAlign: 'center' }}>
                                            <Tag
                                                color='orange'
                                                style={{
                                                    marginBottom: '10px',
                                                    padding: '5px 10px'
                                                }}
                                            >
                                                Đăng ký của bạn đang{' '}
                                                {registrationStatus ===
                                                'pending'
                                                    ? 'chờ duyệt'
                                                    : 'bị từ chối'}
                                            </Tag>
                                            <Text style={{ display: 'block' }}>
                                                {registrationStatus ===
                                                'pending'
                                                    ? 'Vui lòng đợi quản trị viên phê duyệt đăng ký của bạn.'
                                                    : 'Đăng ký tham gia của bạn đã bị từ chối. Vui lòng liên hệ quản trị viên để biết thêm chi tiết.'}
                                            </Text>
                                        </div>
                                    ) : (
                                        <div style={{ textAlign: 'center' }}>
                                            <Text
                                                style={{
                                                    display: 'block',
                                                    marginBottom: '10px'
                                                }}
                                            >
                                                Bạn chưa đăng ký tham gia phiên
                                                đấu giá này
                                            </Text>
                                            <Button
                                                type='primary'
                                                onClick={handleRegister}
                                                disabled={loadingRegistration}
                                                loading={loadingRegistration}
                                            >
                                                Đăng ký tham gia ngay
                                            </Button>
                                        </div>
                                    )}
                                </Space>
                            )}

                            {auction.status === 'pending' && (
                                <div
                                    style={{
                                        marginTop: '20px',
                                        textAlign: 'center'
                                    }}
                                >
                                    {isRegistered ? (
                                        <>
                                            <Tag
                                                color='green'
                                                style={{
                                                    padding: '5px 10px',
                                                    marginBottom: '10px'
                                                }}
                                            >
                                                Bạn đã đăng ký tham gia đấu giá
                                                này
                                            </Tag>
                                            <Text
                                                style={{
                                                    display: 'block'
                                                }}
                                            >
                                                Phiên đấu giá chưa bắt đầu. Hãy
                                                quay lại sau.
                                            </Text>
                                        </>
                                    ) : registrationStatus ? (
                                        <>
                                            <Tag
                                                color='orange'
                                                style={{
                                                    padding: '5px 10px',
                                                    marginBottom: '10px'
                                                }}
                                            >
                                                Đăng ký của bạn đang{' '}
                                                {registrationStatus ===
                                                'pending'
                                                    ? 'chờ duyệt'
                                                    : 'bị từ chối'}
                                            </Tag>
                                            <Text style={{ display: 'block' }}>
                                                {registrationStatus ===
                                                'pending'
                                                    ? 'Vui lòng đợi quản trị viên phê duyệt đăng ký của bạn.'
                                                    : 'Đăng ký của bạn đã bị từ chối. Vui lòng liên hệ quản trị viên để biết thêm chi tiết.'}
                                            </Text>
                                        </>
                                    ) : (
                                        <>
                                            <Button
                                                type='primary'
                                                onClick={handleRegister}
                                                disabled={loadingRegistration}
                                                loading={loadingRegistration}
                                            >
                                                Đăng ký tham gia đấu giá
                                            </Button>
                                            <Text
                                                style={{
                                                    display: 'block',
                                                    marginTop: '10px'
                                                }}
                                            >
                                                Phiên đấu giá chưa bắt đầu
                                            </Text>
                                        </>
                                    )}
                                </div>
                            )}

                            {auction.status === 'closed' && (
                                <div
                                    style={{
                                        marginTop: '20px',
                                        textAlign: 'center'
                                    }}
                                >
                                    <Tag
                                        color='red'
                                        style={{
                                            padding: '5px 10px',
                                            fontSize: '16px'
                                        }}
                                    >
                                        Phiên đấu giá đã kết thúc
                                    </Tag>
                                </div>
                            )}

                            <Divider />

                            {/* Seller info */}
                            <div style={{ marginBottom: '20px' }}>
                                <Title level={5}>Thông tin người bán</Title>
                                <Space align='center'>
                                    <UserOutlined />
                                    <Text strong>
                                        {auction.Product?.User?.username ||
                                            'Người bán ẩn danh'}
                                    </Text>
                                </Space>
                            </div>

                            {/* Shipping info */}
                            <Descriptions bordered size='small' column={1}>
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
                                <Descriptions.Item label='Trạng thái'>
                                    {auction.status === 'active' ? (
                                        <Tag color='green'>Đang diễn ra</Tag>
                                    ) : auction.status === 'pending' ? (
                                        <Tag color='blue'>Sắp diễn ra</Tag>
                                    ) : (
                                        <Tag color='red'>Đã kết thúc</Tag>
                                    )}
                                </Descriptions.Item>
                                {auction.status === 'closed' &&
                                    auction.winner && (
                                        <Descriptions.Item label='Người thắng cuộc'>
                                            <Tag
                                                color='gold'
                                                icon={<UserOutlined />}
                                            >
                                                {auction.winner.name}
                                            </Tag>
                                        </Descriptions.Item>
                                    )}
                            </Descriptions>
                        </Card>
                    </Col>
                </Row>

                {/* Item details section */}
                <Row gutter={[32, 32]} style={{ marginTop: '30px' }}>
                    <Col span={24}>
                        <Card title='Mô tả sản phẩm'>
                            <Paragraph style={{ fontSize: '16px' }}>
                                {auction.Product?.description ||
                                    'Không có mô tả'}
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
                                        Lịch sử đấu giá (
                                        {bidHistory.length || 0} lượt)
                                    </span>
                                </Space>
                            }
                        >
                            {bidHistory.length > 0 ? (
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
                                                Người đặt giá
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
                                        {bidHistory.map((bid, index) => (
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
                                                                ? `${
                                                                      bid.User
                                                                          .first_name ||
                                                                      ''
                                                                  } ${
                                                                      bid.User
                                                                          .last_name ||
                                                                      ''
                                                                  }`
                                                                : 'Người dùng ẩn danh'}
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
                                                        )?.toLocaleString()}{' '}
                                                        VNĐ
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
                        Hủy
                    </Button>,
                    <Button
                        key='submit'
                        type='primary'
                        onClick={handleBid}
                        loading={submitting}
                    >
                        Xác nhận đặt giá
                    </Button>
                ]}
            >
                <p>
                    Bạn sắp đặt giá{' '}
                    <strong>{Number(bidAmount)?.toLocaleString()} VNĐ</strong>{' '}
                    cho:
                </p>
                <p>
                    <strong>{auction.Product?.title}</strong>
                </p>
                <Divider />
                <p>
                    Bằng cách xác nhận, bạn đồng ý với các điều khoản và điều
                    kiện của phiên đấu giá này.
                </p>
                <p>
                    Lưu ý: Giá đặt có hiệu lực ràng buộc và không thể rút lại
                    sau khi đã đặt.
                </p>
            </Modal>
        </div>
    );
};

export default BiddingDetail;
