import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
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
    Empty,
    InputNumber,
} from "antd";
import { ClockCircleOutlined, UserOutlined, DollarOutlined, HistoryOutlined } from "@ant-design/icons";
import auctionService from "../../services/auctionService";
import paymentService from "../../services/paymentService";
import transactionService from "../../services/transactionService";
import { getAllCategories } from "../../services/categoryService";
import { useAuth } from "../../context/AuthContext";
import { useSocket } from "../../context/SocketContext";
import moment from "moment";

const { Title, Text, Paragraph } = Typography;

const BiddingDetail = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const { socket, connected, joinAuctionRoom, leaveAuctionRoom } = useSocket();
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
    const [timeLeft, setTimeLeft] = useState("");
    const [countdown, setCountdown] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [depositModalVisible, setDepositModalVisible] = useState(false);
    const [processingBids, setProcessingBids] = useState(new Map()); // Map<bidId, {bid_amount, timestamp}>
    const [depositTransactionId, setDepositTransactionId] = useState(null);
    const [depositStatus, setDepositStatus] = useState(null);
    const [winnerModalVisible, setWinnerModalVisible] = useState(false);
    const [winnerTransaction, setWinnerTransaction] = useState(null);
    const [loadingWinnerTransaction, setLoadingWinnerTransaction] = useState(false);

    useEffect(() => {
        fetchAuctionDetails();
        fetchCategories();
        if (user) {
            checkRegistrationStatus();
        }
    }, [id, user]);

    // Kiểm tra và hiển thị modal nếu user là người thắng và chưa thanh toán
    useEffect(() => {
        const checkWinnerStatus = async () => {
            if (!user || !auction) return;

            // Kiểm tra nếu auction đã kết thúc và user là người thắng
            if (auction.status === "closed" && auction.current_winner_id === user.id) {
                const transaction = await getWinnerTransaction();
                if (transaction && transaction.status === "pending") {
                    setWinnerTransaction(transaction);
                    setWinnerModalVisible(true);
                }
            }
        };

        checkWinnerStatus();
    }, [auction, user, id]);

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
        socket.on("newBid", (data) => {
            console.log("Nhận sự kiện newBid:", data);

            // Đảm bảo dữ liệu có định dạng đúng trước khi thêm vào lịch sử đặt giá
            const safeData = {
                ...data,
                user_id: data.user_id || "unknown",
                User: data.user || { first_name: "Người dùng", last_name: "" },
                bid_amount: data.bid_amount || 0,
            };

            // Cập nhật danh sách lịch sử đặt giá
            setBidHistory((prevBids) => [safeData, ...prevBids]);

            // Cập nhật thông tin phiên đấu giá
            setAuction((prevAuction) => {
                if (!prevAuction) return null;
                const updatedAuction = {
                    ...prevAuction,
                    current_bid: data.bid_amount,
                    current_winner_id: data.user_id,
                };

                // Cập nhật giá cao nhất hiện tại
                setCurrentHighestBid(parseFloat(data.bid_amount));

                // Cập nhật giá đặt tối thiểu
                const bidIncrement = prevAuction.bid_increment || 500000;
                setBidAmount(parseFloat(data.bid_amount) + parseFloat(bidIncrement));

                return updatedAuction;
            });

            // Hiển thị thông báo chỉ khi không phải là bid của chính người dùng hiện tại
            // (Người đặt giá đã có thông báo thành công riêng từ event "bidProcessed")
            if (data.user_id !== user?.id) {
                if (data.user) {
                    message.info(
                        `${data.user.first_name || "Người dùng"} ${data.user.last_name || ""} đã đặt giá ${parseFloat(
                            data.bid_amount
                        ).toLocaleString()} VNĐ`
                    );
                } else {
                    message.info(`Có người đã đặt giá ${parseFloat(data.bid_amount).toLocaleString()} VNĐ`);
                }
            }
        });

        // Lắng nghe sự kiện phiên đấu giá kết thúc
        socket.on("auctionEnded", async (data) => {
            console.log("Nhận sự kiện auctionEnded:", data);

            setAuction((prevAuction) => {
                if (!prevAuction) return null;
                return {
                    ...prevAuction,
                    status: "closed",
                };
            });

            if (countdown) {
                clearInterval(countdown);
            }

            if (data.winner) {
                if (data.winner.id === user?.id) {
                    message.success("Chúc mừng! Bạn đã thắng phiên đấu giá này!");
                    // Lấy transaction của người thắng và hiển thị modal
                    const transaction = await getWinnerTransaction();
                    if (transaction) {
                        setWinnerTransaction(transaction);
                        setWinnerModalVisible(true);
                    }
                } else {
                    message.info(`Phiên đấu giá đã kết thúc. Người thắng: ${data.winner.name}`);
                }
            } else {
                message.info("Phiên đấu giá đã kết thúc. Không có người thắng cuộc.");
            }
        });

        // Lắng nghe sự kiện phiên đấu giá bắt đầu
        socket.on("auctionStarted", (data) => {
            console.log("Nhận sự kiện auctionStarted:", data);

            if (data.auction_id === id) {
                message.info("Phiên đấu giá đã bắt đầu!");
                fetchAuctionDetails(); // Tải lại thông tin phiên đấu giá
            }
        });

        // Lắng nghe sự kiện bid đã được xử lý thành công
        socket.on("bidProcessed", (data) => {
            console.log("Nhận sự kiện bidProcessed:", data);

            // Xóa bid khỏi danh sách đang xử lý
            setProcessingBids((prev) => {
                const newMap = new Map(prev);
                newMap.delete(data.bidId);
                return newMap;
            });

            // Nếu là bid của user hiện tại, hiển thị thông báo thành công
            if (data.data && data.data.user_id === user?.id) {
                message.success(`Đặt giá thành công: ${parseFloat(data.data.bid_amount).toLocaleString()} VNĐ`);
            }
        });

        // Lắng nghe sự kiện bid xử lý thất bại
        socket.on("bidFailed", (data) => {
            console.log("Nhận sự kiện bidFailed:", data);

            // Xóa bid khỏi danh sách đang xử lý
            setProcessingBids((prev) => {
                const newMap = new Map(prev);
                newMap.delete(data.bidId);
                return newMap;
            });

            // Nếu là bid của user hiện tại, hiển thị lỗi
            if (data.userId === user?.id) {
                message.error(`Đặt giá thất bại: ${data.message || "Có lỗi xảy ra"}`);
            }
        });

        return () => {
            socket.off("newBid");
            socket.off("auctionEnded");
            socket.off("auctionStarted");
            socket.off("bidProcessed");
            socket.off("bidFailed");
        };
    }, [socket, auction, user, id]);

    // Tính toán thời gian còn lại
    useEffect(() => {
        if (!auction) return;

        const updateTimeLeft = () => {
            const now = moment();
            const end = moment(auction.end_time);

            // Nếu phiên đấu giá đã kết thúc
            if (now.isAfter(end) || auction.status === "closed") {
                if (countdown) {
                    clearInterval(countdown);
                }
                setTimeLeft("Đã kết thúc");
                return;
            }

            // Nếu phiên đấu giá chưa bắt đầu
            const start = moment(auction.start_time);
            if (now.isBefore(start)) {
                const diff = moment.duration(start.diff(now));
                setTimeLeft(`Bắt đầu sau: ${Math.floor(diff.asHours())}h ${diff.minutes()}m ${diff.seconds()}s`);
                return;
            }

            // Nếu phiên đấu giá đang diễn ra
            const diff = moment.duration(end.diff(now));
            setTimeLeft(`Còn lại: ${Math.floor(diff.asHours())}h ${diff.minutes()}m ${diff.seconds()}s`);
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
            console.log("Dữ liệu phiên đấu giá:", response);

            if (response.success) {
                const auctionData = response.data;
                setAuction(auctionData);

                // Khởi tạo giá đặt cược ban đầu - đảm bảo giá trị là số
                const startingBid = Number(auctionData.Product?.starting_price) || 0;
                const currentBid = Number(auctionData.current_bid) || startingBid;
                const bidIncrement = Number(auctionData.bid_increment) || 500000;
                setCurrentHighestBid(currentBid);
                setBidAmount(currentBid + bidIncrement); // Tăng theo bid_increment

                // Lấy lịch sử đấu giá nếu có
                try {
                    const bidHistoryResponse = await auctionService.getAuctionBids(id);
                    console.log(bidHistoryResponse);
                    if (bidHistoryResponse && bidHistoryResponse.success) {
                        setBidHistory(bidHistoryResponse.data || []);
                    }
                } catch (error) {
                    console.error("Lỗi khi lấy lịch sử đấu giá:", error);
                    message.warning("Không thể tải lịch sử đấu giá");
                    setBidHistory([]);
                }
            }
        } catch (error) {
            message.error("Không thể tải thông tin phiên đấu giá");
            console.error("Lỗi khi tải thông tin phiên đấu giá:", error);
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

            if (response.success && response.data && response.data.registrations) {
                // Kiểm tra xem người dùng đã đăng ký chưa
                const userRegistration = response.data.registrations.find((reg) => reg.user.id === user.id);

                if (userRegistration) {
                    // Lưu trạng thái đăng ký
                    setRegistrationStatus(userRegistration.status);
                    // Lưu trạng thái đặt cọc
                    setDepositStatus(userRegistration.deposit_status || null);
                    // Coi là đã đăng ký thành công nếu status là 'approved' và deposit_status là 'paid'
                    setIsRegistered(
                        userRegistration.status === "approved" && userRegistration.deposit_status === "paid"
                    );

                    // Nếu đã đăng ký nhưng chưa thanh toán đặt cọc, lấy transaction_id từ API
                    if (userRegistration.deposit_status === "pending" && !depositTransactionId) {
                        try {
                            const depositTransactionResponse = await transactionService.getUserDepositTransaction(
                                id,
                                user.id
                            );
                            console.log(
                                "Deposit transaction response trong checkRegistrationStatus:",
                                depositTransactionResponse
                            );

                            if (
                                depositTransactionResponse &&
                                depositTransactionResponse.success &&
                                depositTransactionResponse.data
                            ) {
                                const depositTransaction = depositTransactionResponse.data;
                                // Chỉ lấy transaction có status = "pending"
                                if (depositTransaction.status === "pending") {
                                    setDepositTransactionId(depositTransaction.id);
                                    console.log("Đã lấy transaction_id từ API:", depositTransaction.id);
                                } else {
                                    console.warn(
                                        "Deposit transaction không ở trạng thái pending:",
                                        depositTransaction.status
                                    );
                                }
                            } else {
                                console.warn("Không tìm thấy deposit transaction trong checkRegistrationStatus");
                            }
                        } catch (error) {
                            // Nếu không tìm thấy (404), có thể transaction chưa được tạo
                            if (error.response?.status === 404) {
                                console.warn("Chưa có deposit transaction cho user này");
                            } else {
                                console.error("Lỗi khi lấy transaction_id trong checkRegistrationStatus:", error);
                            }
                        }
                    }
                } else {
                    setIsRegistered(false);
                    setRegistrationStatus(null);
                    setDepositStatus(null);
                    setDepositTransactionId(null);
                }
            }
        } catch (error) {
            console.error("Lỗi khi kiểm tra trạng thái đăng ký:", error);
        } finally {
            setLoadingRegistration(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const categoriesData = await getAllCategories();
            setCategories(categoriesData.data || []);
        } catch (error) {
            console.error("Lỗi khi tải danh mục:", error);
        }
    };

    const getWinnerTransaction = async () => {
        if (!user || !id) return null;

        try {
            setLoadingWinnerTransaction(true);
            const response = await transactionService.getTransactionsByAuctionId(id);

            if (response.success && response.data) {
                // Tìm transaction của người thắng với transaction_type = "auction_win" và user_id = user.id
                const winnerTransaction = response.data.find(
                    (transaction) =>
                        transaction.transaction_type === "auction_win" &&
                        transaction.user_id === user.id &&
                        transaction.status === "pending"
                );

                return winnerTransaction || null;
            }
            return null;
        } catch (error) {
            console.error("Lỗi khi lấy transaction của người thắng:", error);
            return null;
        } finally {
            setLoadingWinnerTransaction(false);
        }
    };

    const showBidModal = () => {
        if (!user) {
            message.warning("Vui lòng đăng nhập để đặt giá");
            return;
        }

        if (!isRegistered) {
            message.warning("Bạn cần đăng ký tham gia đấu giá trước khi đặt giá");
            return;
        }

        // Kiểm tra deposit_status
        if (depositStatus !== "paid") {
            message.warning("Bạn cần thanh toán tiền đặt cọc trước khi đặt giá");
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
            message.error("Giá đặt phải cao hơn giá hiện tại");
            return;
        }

        // Kiểm tra giá đặt có phù hợp với bid_increment
        if (numericBidAmount < numericCurrentHighestBid + numericBidIncrement) {
            message.error(`Giá đặt phải cao hơn giá hiện tại ít nhất ${numericBidIncrement.toLocaleString()} VNĐ`);
            return;
        }

        try {
            setSubmitting(true);
            const response = await auctionService.placeBid(id, {
                bid_amount: numericBidAmount,
            });

            if (response.success) {
                // Lưu bidId vào processingBids để track
                if (response.data && response.data.bidId) {
                    setProcessingBids((prev) => {
                        const newMap = new Map(prev);
                        newMap.set(response.data.bidId, {
                            bid_amount: numericBidAmount,
                            timestamp: Date.now(),
                        });
                        return newMap;
                    });
                }

                setIsModalOpen(false);

                // Không cần tải lại ngay vì sẽ nhận socket event khi xử lý xong
            } else {
                message.error(response.message || "Đặt giá thất bại");
            }
        } catch (error) {
            message.error(error.response?.data?.message || "Đặt giá thất bại");
            console.error("Lỗi khi đặt giá:", error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleRegister = async () => {
        if (!user) {
            message.warning("Vui lòng đăng nhập để đăng ký tham gia đấu giá");
            return;
        }

        if (isRegistered) {
            message.info("Bạn đã đăng ký tham gia phiên đấu giá này rồi");
            return;
        }

        // Hiển thị modal nhập số tiền đặt cọc
        setDepositModalVisible(true);
    };

    const handleDepositSubmit = async () => {
        // Tính toán số tiền đặt cọc là 10% giá khởi điểm
        const startingPrice = auction?.Product?.starting_price || auction?.starting_price;
        const depositAmount = startingPrice * 0.1;

        if (!depositAmount || depositAmount <= 0) {
            message.error("Không thể tính toán số tiền đặt cọc");
            return;
        }

        try {
            setLoadingRegistration(true);
            const response = await auctionService.registerForAuction(id, depositAmount);

            if (response.success) {
                // Lưu transaction_id từ response
                if (response.data && response.data.transaction && response.data.transaction.id) {
                    setDepositTransactionId(response.data.transaction.id);
                }

                message.success("Đăng ký tham gia đấu giá thành công!");
                // Cập nhật trạng thái đăng ký
                setRegistrationStatus("pending");
                setDepositStatus("pending");
                // Không đóng modal ngay, để người dùng có thể thanh toán
                message.info("Vui lòng thanh toán tiền đặt cọc để hoàn tất đăng ký");
            } else {
                message.error(response.message || "Đăng ký tham gia đấu giá thất bại");
            }
        } catch (error) {
            message.error(error.response?.data?.message || "Đăng ký tham gia đấu giá thất bại");
            console.error("Lỗi khi đăng ký tham gia đấu giá:", error);
        } finally {
            setLoadingRegistration(false);
        }
    };

    const handlePayDeposit = async () => {
        let transactionId = depositTransactionId;

        // Nếu chưa có transaction_id, lấy từ API bằng endpoint mới (chính xác hơn)
        if (!transactionId && registrationStatus && depositStatus === "pending" && user) {
            try {
                setLoadingRegistration(true);
                const depositTransactionResponse = await transactionService.getUserDepositTransaction(id, user.id);
                console.log("Deposit transaction response:", depositTransactionResponse);

                if (
                    depositTransactionResponse &&
                    depositTransactionResponse.success &&
                    depositTransactionResponse.data
                ) {
                    const depositTransaction = depositTransactionResponse.data;
                    // Chỉ lấy transaction có status = "pending"
                    if (depositTransaction.status === "pending") {
                        transactionId = depositTransaction.id;
                        setDepositTransactionId(transactionId);
                        console.log("Tìm thấy transaction_id:", transactionId);
                    } else {
                        message.warning(`Giao dịch đã ở trạng thái: ${depositTransaction.status}`);
                        setLoadingRegistration(false);
                        return;
                    }
                } else {
                    console.warn("Không tìm thấy deposit transaction");
                }
            } catch (error) {
                console.error("Lỗi khi lấy transaction_id:", error);
                // Nếu không tìm thấy (404), có thể transaction chưa được tạo
                if (error.response?.status === 404) {
                    message.error("Không tìm thấy giao dịch đặt cọc. Vui lòng đăng ký lại.");
                } else {
                    message.error("Không thể lấy thông tin giao dịch thanh toán. Vui lòng thử lại sau.");
                }
                setLoadingRegistration(false);
                return;
            }
        }

        if (!transactionId) {
            console.error(
                "Không có transaction_id để thanh toán. depositTransactionId:",
                depositTransactionId,
                "registrationStatus:",
                registrationStatus,
                "depositStatus:",
                depositStatus
            );
            message.error("Không tìm thấy thông tin giao dịch thanh toán. Vui lòng đăng ký lại hoặc liên hệ hỗ trợ.");
            setLoadingRegistration(false);
            return;
        }

        try {
            setLoadingRegistration(true);
            const response = await paymentService.createPayment({
                transaction_id: transactionId,
            });

            if (response.success && response.data && response.data.paymentUrl) {
                // Redirect đến trang thanh toán VNPay
                window.location.href = response.data.paymentUrl;
            } else {
                message.error("Không thể tạo đường dẫn thanh toán");
            }
        } catch (error) {
            console.error("Lỗi khi tạo thanh toán:", error);
            message.error(error.response?.data?.message || "Có lỗi xảy ra khi tạo thanh toán");
        } finally {
            setLoadingRegistration(false);
        }
    };

    const handleWinnerPayment = async () => {
        if (!winnerTransaction || !winnerTransaction.id) {
            message.error("Không tìm thấy thông tin giao dịch thanh toán");
            return;
        }

        try {
            setLoadingWinnerTransaction(true);
            const response = await paymentService.createPayment({
                transaction_id: winnerTransaction.id,
            });

            if (response.success && response.data && response.data.paymentUrl) {
                // Redirect đến trang thanh toán VNPay
                window.location.href = response.data.paymentUrl;
            } else {
                message.error("Không thể tạo đường dẫn thanh toán");
            }
        } catch (error) {
            console.error("Lỗi khi tạo thanh toán:", error);
            message.error(error.response?.data?.message || "Có lỗi xảy ra khi tạo thanh toán");
        } finally {
            setLoadingWinnerTransaction(false);
        }
    };

    const getRegistrationStatusText = () => {
        if (!user) return "";
        if (!registrationStatus) return "";

        let statusText = "";
        switch (registrationStatus) {
            case "pending":
                statusText = "Đang chờ thanh toán đặt cọc";
                break;
            case "approved":
                statusText = "Đã được duyệt";
                break;
            default:
                statusText = registrationStatus;
        }

        return statusText;
    };

    const getRegistrationStatusTag = () => {
        if (!user) return null;
        if (!registrationStatus) return null;

        const statusColor = {
            pending: "orange",
            approved: "green",
        };

        return <Tag color={statusColor[registrationStatus] || "default"}>{getRegistrationStatusText()}</Tag>;
    };

    // Lấy tên danh mục từ ID
    const getCategoryName = (categoryId) => {
        const category = categories.find((cat) => cat.id === categoryId);
        return category ? category.name : "Chưa phân loại";
    };

    // Lấy status tag
    const getStatusTag = () => {
        if (!auction) return null;

        switch (auction.status) {
            case "pending":
                return <Tag color="blue">Sắp diễn ra</Tag>;
            case "active":
                return <Tag color="green">Đang diễn ra</Tag>;
            case "closed":
                return <Tag color="red">Đã kết thúc</Tag>;
            case "canceled":
                return <Tag color="gray">Đã hủy</Tag>;
            default:
                return <Tag>Không xác định</Tag>;
        }
    };

    // Hiển thị trang loading
    if (loading) {
        return (
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "50vh",
                    flexDirection: "column",
                }}
            >
                <Spin size="large" />
                <div style={{ marginTop: "15px" }}>Đang tải thông tin phiên đấu giá...</div>
            </div>
        );
    }

    if (!auction) {
        return (
            <div>
                <div style={{ padding: "50px 20px", textAlign: "center" }}>
                    <Title level={3}>Không tìm thấy phiên đấu giá</Title>
                    <Text>Phiên đấu giá bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</Text>
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
                    padding: "30px 20px",
                    maxWidth: "1200px",
                    margin: "0 auto",
                }}
            >
                <Row gutter={[32, 32]}>
                    {/* Left column - Images */}
                    <Col xs={24} md={12}>
                        <Card>
                            <Image
                                src={auction.Product?.ProductImages?.[0]?.image_url || "https://placeholder.com/400"}
                                alt={auction.Product?.title}
                                style={{ width: "100%", height: "auto" }}
                            />
                            <div style={{ marginTop: "20px" }}>
                                <Row gutter={[8, 8]}>
                                    {auction.Product?.ProductImages?.map((img, index) => (
                                        <Col span={8} key={index}>
                                            <Image
                                                src={img.image_url}
                                                alt={`${auction.Product?.title} ảnh ${index + 1}`}
                                                style={{
                                                    width: "100%",
                                                    height: "auto",
                                                    cursor: "pointer",
                                                }}
                                            />
                                        </Col>
                                    ))}
                                </Row>
                            </div>
                        </Card>
                    </Col>

                    {/* Right column - Info and Bidding */}
                    <Col xs={24} md={12}>
                        <Card>
                            <Tag color="blue">{getCategoryName(auction.Product?.category_id)}</Tag>
                            <Title level={2}>{auction.Product?.title}</Title>

                            {/* Item stats */}
                            <Row gutter={16} style={{ marginBottom: "20px" }}>
                                <Col span={12}>
                                    <Statistic
                                        title="Giá hiện tại"
                                        value={currentHighestBid}
                                        precision={0}
                                        valueStyle={{ color: "#1890ff" }}
                                        prefix={<DollarOutlined />}
                                        suffix="VNĐ"
                                        formatter={(value) => `${Number(value).toLocaleString()}`}
                                    />
                                </Col>
                                <Col span={12}>
                                    <Statistic
                                        title="Giá khởi điểm"
                                        value={auction.Product?.starting_price || 0}
                                        precision={0}
                                        formatter={(value) => `${Number(value).toLocaleString()}`}
                                        suffix="VNĐ"
                                    />
                                </Col>
                            </Row>

                            {/* Auction timer */}
                            <Card
                                style={{
                                    marginBottom: "20px",
                                    background: "#f9f9f9",
                                }}
                                styles={{ padding: "15px" }}
                            >
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                    }}
                                >
                                    <div>
                                        <Text strong style={{ fontSize: "16px" }}>
                                            <ClockCircleOutlined /> Thời gian còn lại:
                                        </Text>
                                    </div>
                                    <div>
                                        <Statistic.Countdown
                                            value={getTimeRemaining()}
                                            format="D [ngày] H [giờ] m [phút] s [giây]"
                                            valueStyle={{
                                                fontSize: "16px",
                                                fontWeight: "bold",
                                            }}
                                        />
                                    </div>
                                </div>
                            </Card>

                            {/* Bidding actions */}
                            {auction.status === "active" && (
                                <Space direction="vertical" size="large" style={{ width: "100%" }}>
                                    {isRegistered ? (
                                        <>
                                            <Space direction="horizontal">
                                                <Text>Nhập giá đặt tối đa của bạn:</Text>
                                                <Text type="secondary">
                                                    Giá đặt tối thiểu: {Number(minimumBid).toLocaleString()} VNĐ
                                                </Text>
                                            </Space>
                                            <Space.Compact>
                                                <Input
                                                    style={{
                                                        width: "calc(100% - 120px)",
                                                    }}
                                                    type="number"
                                                    value={bidAmount}
                                                    placeholder={Number(minimumBid).toString()}
                                                    onChange={(e) => setBidAmount(Number(e.target.value))}
                                                    min={minimumBid}
                                                    step={bidIncrement}
                                                    suffix="VNĐ"
                                                />
                                                <Button
                                                    type="primary"
                                                    style={{ width: "120px" }}
                                                    onClick={showBidModal}
                                                >
                                                    Đặt giá
                                                </Button>
                                            </Space.Compact>
                                        </>
                                    ) : registrationStatus ? (
                                        <div style={{ textAlign: "center" }}>
                                            {depositStatus === "pending" && registrationStatus === "pending" ? (
                                                <>
                                                    <Tag
                                                        color="orange"
                                                        style={{
                                                            marginBottom: "10px",
                                                            padding: "5px 10px",
                                                        }}
                                                    >
                                                        Chờ thanh toán đặt cọc
                                                    </Tag>
                                                    <Text style={{ display: "block", marginBottom: "15px" }}>
                                                        Bạn cần thanh toán tiền đặt cọc để hoàn tất đăng ký tham gia đấu
                                                        giá.
                                                    </Text>
                                                    <Button
                                                        type="primary"
                                                        onClick={handlePayDeposit}
                                                        loading={loadingRegistration}
                                                    >
                                                        Thanh toán đặt cọc
                                                    </Button>
                                                </>
                                            ) : (
                                                <>
                                                    <Tag
                                                        color="green"
                                                        style={{
                                                            marginBottom: "10px",
                                                            padding: "5px 10px",
                                                        }}
                                                    >
                                                        Đã được duyệt
                                                    </Tag>
                                                    <Text style={{ display: "block" }}>
                                                        {depositStatus === "paid"
                                                            ? "Đã thanh toán đặt cọc. Bạn có thể tham gia đấu giá."
                                                            : "Đăng ký của bạn đã được duyệt."}
                                                    </Text>
                                                </>
                                            )}
                                        </div>
                                    ) : (
                                        <div style={{ textAlign: "center" }}>
                                            <Text
                                                style={{
                                                    display: "block",
                                                    marginBottom: "10px",
                                                }}
                                            >
                                                Bạn chưa đăng ký tham gia phiên đấu giá này
                                            </Text>
                                            <Button
                                                type="primary"
                                                onClick={handleRegister}
                                                disabled={loadingRegistration}
                                                loading={loadingRegistration}
                                            >
                                                Đăng ký tham gia ngay
                                            </Button>
                                        </div>
                                    )}

                                    {/* Hiển thị các bid đang xử lý */}
                                    {processingBids.size > 0 && (
                                        <div style={{ marginTop: "20px" }}>
                                            <Text strong style={{ display: "block", marginBottom: "10px" }}>
                                                Bid đang xử lý:
                                            </Text>
                                            {Array.from(processingBids.entries()).map(([bidId, bidInfo]) => (
                                                <div
                                                    key={bidId}
                                                    style={{
                                                        padding: "10px",
                                                        background: "#f0f7ff",
                                                        borderRadius: "4px",
                                                        marginBottom: "8px",
                                                        display: "flex",
                                                        justifyContent: "space-between",
                                                        alignItems: "center",
                                                    }}
                                                >
                                                    <Space>
                                                        <Spin size="small" />
                                                        <Text>{Number(bidInfo.bid_amount).toLocaleString()} VNĐ</Text>
                                                    </Space>
                                                    <Tag color="processing">Đang xử lý...</Tag>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </Space>
                            )}

                            {auction.status === "pending" && (
                                <div
                                    style={{
                                        marginTop: "20px",
                                        textAlign: "center",
                                    }}
                                >
                                    {isRegistered ? (
                                        <>
                                            <Tag
                                                color="green"
                                                style={{
                                                    padding: "5px 10px",
                                                    marginBottom: "10px",
                                                }}
                                            >
                                                Bạn đã đăng ký tham gia đấu giá này
                                            </Tag>
                                            <Text
                                                style={{
                                                    display: "block",
                                                }}
                                            >
                                                Phiên đấu giá chưa bắt đầu. Hãy quay lại sau.
                                            </Text>
                                        </>
                                    ) : registrationStatus ? (
                                        <>
                                            {depositStatus === "pending" && registrationStatus === "pending" ? (
                                                <>
                                                    <Tag
                                                        color="orange"
                                                        style={{
                                                            padding: "5px 10px",
                                                            marginBottom: "10px",
                                                        }}
                                                    >
                                                        Chờ thanh toán đặt cọc
                                                    </Tag>
                                                    <Text style={{ display: "block", marginBottom: "15px" }}>
                                                        Bạn cần thanh toán tiền đặt cọc để hoàn tất đăng ký tham gia đấu
                                                        giá.
                                                    </Text>
                                                    <Button
                                                        type="primary"
                                                        onClick={handlePayDeposit}
                                                        loading={loadingRegistration}
                                                    >
                                                        Thanh toán đặt cọc
                                                    </Button>
                                                </>
                                            ) : (
                                                <>
                                                    <Tag
                                                        color="green"
                                                        style={{
                                                            padding: "5px 10px",
                                                            marginBottom: "10px",
                                                        }}
                                                    >
                                                        Đã được duyệt
                                                    </Tag>
                                                    <Text style={{ display: "block" }}>
                                                        {depositStatus === "paid"
                                                            ? "Đã thanh toán đặt cọc. Bạn có thể tham gia đấu giá."
                                                            : "Đăng ký của bạn đã được duyệt."}
                                                    </Text>
                                                </>
                                            )}
                                        </>
                                    ) : (
                                        <>
                                            <Button
                                                type="primary"
                                                onClick={handleRegister}
                                                disabled={loadingRegistration}
                                                loading={loadingRegistration}
                                            >
                                                Đăng ký tham gia đấu giá
                                            </Button>
                                            <Text
                                                style={{
                                                    display: "block",
                                                    marginTop: "10px",
                                                }}
                                            >
                                                Phiên đấu giá chưa bắt đầu
                                            </Text>
                                        </>
                                    )}
                                </div>
                            )}

                            {auction.status === "closed" && (
                                <div
                                    style={{
                                        marginTop: "20px",
                                        textAlign: "center",
                                    }}
                                >
                                    <Tag
                                        color="red"
                                        style={{
                                            padding: "5px 10px",
                                            fontSize: "16px",
                                        }}
                                    >
                                        Phiên đấu giá đã kết thúc
                                    </Tag>
                                </div>
                            )}

                            <Divider />

                            {/* Seller info */}
                            <div style={{ marginBottom: "20px" }}>
                                <Title level={5}>Thông tin người bán</Title>
                                <Space align="center">
                                    <UserOutlined />
                                    <Text strong>{auction.Product?.User?.username || "Người bán ẩn danh"}</Text>
                                </Space>
                            </div>

                            {/* Shipping info */}
                            <Descriptions bordered size="small" column={1}>
                                <Descriptions.Item label="Thời gian bắt đầu">
                                    {new Date(auction.start_time).toLocaleString("vi-VN")}
                                </Descriptions.Item>
                                <Descriptions.Item label="Thời gian kết thúc">
                                    {new Date(auction.end_time).toLocaleString("vi-VN")}
                                </Descriptions.Item>
                                <Descriptions.Item label="Trạng thái">
                                    {auction.status === "active" ? (
                                        <Tag color="green">Đang diễn ra</Tag>
                                    ) : auction.status === "pending" ? (
                                        <Tag color="blue">Sắp diễn ra</Tag>
                                    ) : (
                                        <Tag color="red">Đã kết thúc</Tag>
                                    )}
                                </Descriptions.Item>
                                {auction.status === "closed" && auction.winner && (
                                    <Descriptions.Item label="Người thắng cuộc">
                                        <Tag color="gold" icon={<UserOutlined />}>
                                            {auction.winner.name}
                                        </Tag>
                                    </Descriptions.Item>
                                )}
                            </Descriptions>
                        </Card>
                    </Col>
                </Row>

                {/* Item details section */}
                <Row gutter={[32, 32]} style={{ marginTop: "30px" }}>
                    <Col span={24}>
                        <Card title="Mô tả sản phẩm">
                            <Paragraph style={{ fontSize: "16px" }}>
                                {auction.Product?.description || "Không có mô tả"}
                            </Paragraph>
                        </Card>
                    </Col>
                </Row>

                {/* Bid history section */}
                <Row gutter={[32, 32]} style={{ marginTop: "30px" }}>
                    <Col span={24}>
                        <Card
                            title={
                                <Space>
                                    <HistoryOutlined />
                                    <span>Lịch sử đấu giá ({bidHistory.length || 0} lượt)</span>
                                </Space>
                            }
                        >
                            {bidHistory.length > 0 ? (
                                <table
                                    style={{
                                        width: "100%",
                                        borderCollapse: "collapse",
                                    }}
                                >
                                    <thead>
                                        <tr
                                            style={{
                                                borderBottom: "1px solid #f0f0f0",
                                            }}
                                        >
                                            <th
                                                style={{
                                                    padding: "12px 8px",
                                                    textAlign: "left",
                                                }}
                                            >
                                                Người đặt giá
                                            </th>
                                            <th
                                                style={{
                                                    padding: "12px 8px",
                                                    textAlign: "right",
                                                }}
                                            >
                                                Số tiền
                                            </th>
                                            <th
                                                style={{
                                                    padding: "12px 8px",
                                                    textAlign: "right",
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
                                                    borderBottom: "1px solid #f0f0f0",
                                                }}
                                            >
                                                <td
                                                    style={{
                                                        padding: "12px 8px",
                                                    }}
                                                >
                                                    <Space>
                                                        <UserOutlined />
                                                        <Text>
                                                            {bid.User
                                                                ? `${bid.User.first_name || ""} ${
                                                                      bid.User.last_name || ""
                                                                  }`
                                                                : "Người dùng ẩn danh"}
                                                        </Text>
                                                        {index === 0 && <Tag color="green">Cao nhất</Tag>}
                                                    </Space>
                                                </td>
                                                <td
                                                    style={{
                                                        padding: "12px 8px",
                                                        textAlign: "right",
                                                    }}
                                                >
                                                    <Text strong>{Number(bid.bid_amount)?.toLocaleString()} VNĐ</Text>
                                                </td>
                                                <td
                                                    style={{
                                                        padding: "12px 8px",
                                                        textAlign: "right",
                                                    }}
                                                >
                                                    <Text type="secondary">
                                                        {new Date(bid.created_at).toLocaleString("vi-VN")}
                                                    </Text>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div
                                    style={{
                                        textAlign: "center",
                                        padding: "20px",
                                    }}
                                >
                                    <Text type="secondary">Chưa có lượt đấu giá nào</Text>
                                </div>
                            )}
                        </Card>
                    </Col>
                </Row>
            </div>

            {/* Bidding Confirmation Modal */}
            <Modal
                title="Xác nhận đặt giá"
                open={isModalOpen}
                onCancel={handleCancel}
                footer={[
                    <Button key="back" onClick={handleCancel}>
                        Hủy
                    </Button>,
                    <Button key="submit" type="primary" onClick={handleBid} loading={submitting}>
                        Xác nhận đặt giá
                    </Button>,
                ]}
            >
                <p>
                    Bạn sắp đặt giá <strong>{Number(bidAmount)?.toLocaleString()} VNĐ</strong> cho:
                </p>
                <p>
                    <strong>{auction.Product?.title}</strong>
                </p>
                <Divider />
                <p>Bằng cách xác nhận, bạn đồng ý với các điều khoản và điều kiện của phiên đấu giá này.</p>
                <p>Lưu ý: Giá đặt có hiệu lực ràng buộc và không thể rút lại sau khi đã đặt.</p>
            </Modal>

            {/* Deposit Modal */}
            <Modal
                title={depositTransactionId ? "Thanh toán tiền đặt cọc" : "Xác nhận đặt cọc tham gia đấu giá"}
                visible={depositModalVisible}
                onCancel={() => {
                    setDepositModalVisible(false);
                    // Reset transaction ID khi đóng modal nếu chưa thanh toán
                    if (!depositStatus || depositStatus !== "paid") {
                        setDepositTransactionId(null);
                    }
                }}
                footer={
                    depositTransactionId
                        ? [
                              <Button key="cancel" onClick={() => setDepositModalVisible(false)}>
                                  Đóng
                              </Button>,
                              <Button key="pay" type="primary" onClick={handlePayDeposit} loading={loadingRegistration}>
                                  Thanh toán đặt cọc
                              </Button>,
                          ]
                        : [
                              <Button key="cancel" onClick={() => setDepositModalVisible(false)}>
                                  Hủy
                              </Button>,
                              <Button
                                  key="submit"
                                  type="primary"
                                  onClick={handleDepositSubmit}
                                  loading={loadingRegistration}
                              >
                                  Xác nhận đăng ký
                              </Button>,
                          ]
                }
            >
                <div style={{ textAlign: "center", padding: "20px" }}>
                    {depositTransactionId ? (
                        <>
                            <Typography.Title level={4}>Đăng ký thành công!</Typography.Title>
                            <Typography.Title level={2} type="danger" style={{ marginTop: "20px" }}>
                                {(() => {
                                    const startingPrice = auction?.Product?.starting_price || auction?.starting_price;
                                    const depositAmount = startingPrice * 0.1;
                                    return depositAmount ? `${depositAmount.toLocaleString("vi-VN")} VNĐ` : "0 VNĐ";
                                })()}
                            </Typography.Title>
                            <Typography.Text type="secondary" style={{ display: "block", marginTop: "10px" }}>
                                Số tiền đặt cọc cần thanh toán
                            </Typography.Text>
                            <div style={{ marginTop: "30px" }}>
                                <Typography.Text>
                                    Vui lòng thanh toán tiền đặt cọc để hoàn tất đăng ký tham gia đấu giá.
                                </Typography.Text>
                            </div>
                        </>
                    ) : (
                        <>
                            <Typography.Title level={4}>Số tiền đặt cọc cần thanh toán:</Typography.Title>
                            <Typography.Title level={2} type="danger">
                                {(() => {
                                    const startingPrice = auction?.Product?.starting_price || auction?.starting_price;
                                    const depositAmount = startingPrice * 0.1;
                                    return depositAmount ? `${depositAmount.toLocaleString("vi-VN")} VNĐ` : "0 VNĐ";
                                })()}
                            </Typography.Title>
                            <Typography.Text type="secondary">
                                (10% giá khởi điểm:{" "}
                                {(() => {
                                    const startingPrice = auction?.Product?.starting_price || auction?.starting_price;
                                    return startingPrice
                                        ? `${Number(startingPrice).toLocaleString("vi-VN")} VNĐ`
                                        : "0 VNĐ";
                                })()}
                                )
                            </Typography.Text>
                            <div style={{ marginTop: "20px" }}>
                                <Typography.Text>Bạn có xác nhận đặt cọc để tham gia đấu giá không?</Typography.Text>
                            </div>
                        </>
                    )}
                </div>
            </Modal>

            {/* Winner Payment Modal */}
            <Modal
                title={
                    <div style={{ textAlign: "center" }}>
                        <span style={{ fontSize: "24px", marginRight: "8px" }}>🎉</span>
                        Chúc mừng! Bạn đã thắng đấu giá
                    </div>
                }
                open={winnerModalVisible}
                onCancel={() => setWinnerModalVisible(false)}
                footer={[
                    <Button key="later" onClick={() => setWinnerModalVisible(false)}>
                        Thanh toán sau
                    </Button>,
                    <Button
                        key="pay"
                        type="primary"
                        onClick={handleWinnerPayment}
                        loading={loadingWinnerTransaction}
                        size="large"
                    >
                        Thanh toán ngay
                    </Button>,
                ]}
                width={600}
                closable={true}
            >
                {winnerTransaction && auction ? (
                    <div style={{ textAlign: "center", padding: "20px" }}>
                        <Typography.Title level={4} style={{ marginBottom: "20px" }}>
                            {auction.Product?.title}
                        </Typography.Title>

                        <Divider />

                        <div style={{ marginBottom: "20px" }}>
                            <Text type="secondary" style={{ display: "block", marginBottom: "8px" }}>
                                Giá thắng đấu giá:
                            </Text>
                            <Typography.Title level={3} style={{ color: "#1890ff", marginBottom: "20px" }}>
                                {Number(auction.current_bid || auction.winning_bid || 0).toLocaleString("vi-VN")} VNĐ
                            </Typography.Title>

                            {winnerTransaction.payment_info?.deposit_deducted && (
                                <>
                                    <Text type="secondary" style={{ display: "block", marginBottom: "8px" }}>
                                        Tiền đặt cọc đã trừ:
                                    </Text>
                                    <Typography.Text
                                        strong
                                        style={{ display: "block", marginBottom: "20px", color: "#52c41a" }}
                                    >
                                        -{" "}
                                        {Number(
                                            winnerTransaction.payment_info.deposit_deducted.deposit_amount || 0
                                        ).toLocaleString("vi-VN")}{" "}
                                        VNĐ
                                    </Typography.Text>
                                </>
                            )}

                            <Divider />

                            <Text type="secondary" style={{ display: "block", marginBottom: "8px" }}>
                                Số tiền cần thanh toán:
                            </Text>
                            <Typography.Title level={2} type="danger" style={{ marginBottom: "20px" }}>
                                {Number(winnerTransaction.amount || 0).toLocaleString("vi-VN")} VNĐ
                            </Typography.Title>
                        </div>

                        <div
                            style={{
                                background: "#f0f7ff",
                                padding: "15px",
                                borderRadius: "8px",
                                marginTop: "20px",
                            }}
                        >
                            <Text type="secondary" style={{ fontSize: "14px" }}>
                                ⚠️ Vui lòng thanh toán trong vòng 7 ngày để hoàn tất giao dịch. Sau thời hạn này, đơn
                                hàng có thể bị hủy.
                            </Text>
                        </div>
                    </div>
                ) : (
                    <div style={{ textAlign: "center", padding: "20px" }}>
                        <Spin size="large" />
                        <div style={{ marginTop: "15px" }}>Đang tải thông tin thanh toán...</div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default BiddingDetail;
