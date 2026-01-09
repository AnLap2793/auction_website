const auctionService = require("../services/auctionService");
const bidQueueService = require("../services/bidQueueService");
const cron = require("node-cron");
const { AuctionRegistration } = require("../models");

// Thiết lập cron job để chạy mỗi phút
cron.schedule("* * * * *", async () => {
    try {
        await auctionService.updateAuctionStatus();
        console.log("Đã cập nhật trạng thái phiên đấu giá");
    } catch (error) {
        console.error("Lỗi khi cập nhật trạng thái phiên đấu giá:", error);
    }
});

// Lấy danh sách tất cả phiên đấu giá
const getAllAuctions = async (req, res) => {
    try {
        // Lấy các tham số filter từ query params
        const filters = {
            status: req.query.status,
            sort: req.query.sort,
            page: req.query.page,
            limit: req.query.limit,
            search: req.query.search,
            category_id: req.query.category_id,
            isAdmin: req.query.isAdmin === "true" || false, // Xác định nếu yêu cầu đến từ admin
        };

        const result = await auctionService.getAllAuctions(filters);
        res.json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Lấy chi tiết phiên đấu giá theo ID
const getAuctionById = async (req, res) => {
    try {
        const result = await auctionService.getAuctionById(req.params.id);
        res.json(result);
    } catch (error) {
        res.status(404).json({
            success: false,
            message: error.message,
        });
    }
};

// Tạo phiên đấu giá mới
const createAuction = async (req, res) => {
    try {
        const auctionData = {
            product_id: req.body.product_id,
            start_time: req.body.start_time,
            end_time: req.body.end_time,
            status: req.body.status || "pending",
            bid_increment: req.body.bid_increment,
        };

        const result = await auctionService.createAuction(auctionData);

        // Thông báo có phiên đấu giá mới qua Socket.IO
        const socketService = require("../services/socketService");
        socketService.notifyNewAuction({
            ...result.data,
            message: "Có phiên đấu giá mới vừa được tạo",
        });

        res.status(201).json(result);
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

// Cập nhật phiên đấu giá
const updateAuction = async (req, res) => {
    try {
        const result = await auctionService.updateAuction(req.params.id, req.body);
        res.json(result);
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

// Hủy phiên đấu giá
const cancelAuction = async (req, res) => {
    try {
        const result = await auctionService.cancelAuction(req.params.id);
        res.json(result);
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

// Lấy số lượt đăng ký của một phiên đấu giá
const getAuctionRegistrations = async (req, res) => {
    try {
        const result = await auctionService.getAuctionRegistrations(req.params.id);
        res.json(result);
    } catch (error) {
        res.status(404).json({
            success: false,
            message: error.message,
        });
    }
};

// Thêm endpoint mới để cập nhật trạng thái thủ công (nếu cần)
const updateAuctionStatus = async (req, res) => {
    try {
        const result = await auctionService.updateAuctionStatus();
        res.json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Xóa phiên đấu giá
const deleteAuction = async (req, res) => {
    try {
        const result = await auctionService.deleteAuction(req.params.id);
        res.json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Lấy lịch sử đấu giá của một phiên đấu giá
const getAuctionBids = async (req, res) => {
    try {
        const result = await auctionService.getAuctionBids(req.params.id);
        res.json(result);
    } catch (error) {
        res.status(404).json({
            success: false,
            message: error.message,
        });
    }
};

// Đặt giá cho một phiên đấu giá
const placeBid = async (req, res) => {
    try {
        // Xác thực người dùng đã đăng nhập
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Bạn cần đăng nhập để đặt giá",
            });
        }

        // Kiểm tra giá đặt hợp lệ cơ bản
        const bid_amount = parseFloat(req.body.bid_amount);
        if (!bid_amount || isNaN(bid_amount) || bid_amount <= 0) {
            return res.status(400).json({
                success: false,
                message: "Giá đặt không hợp lệ",
            });
        }

        const bidData = {
            auction_id: req.params.id,
            user_id: req.user.id,
            bid_amount: bid_amount,
            user_info: {
                id: req.user.id,
                first_name: req.user.first_name,
                last_name: req.user.last_name,
            },
        };

        // Đưa bid vào queue để xử lý tuần tự
        const bidId = await bidQueueService.enqueueBid(bidData);

        // Trả về response ngay lập tức với status "đang xử lý"
        res.status(202).json({
            success: true,
            message: "Bid đã được nhận và đang được xử lý",
            data: {
                bidId: bidId,
                auction_id: req.params.id,
                user_id: req.user.id,
                bid_amount: bid_amount,
                status: "processing",
            },
        });
    } catch (error) {
        console.error("Lỗi khi đưa bid vào queue:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Có lỗi xảy ra khi xử lý đặt giá",
        });
    }
};

// Đăng ký tham gia phiên đấu giá
const registerForAuction = async (req, res) => {
    try {
        const auctionId = req.params.id;
        const userId = req.user.id;
        const { depositAmount } = req.body;

        const result = await auctionService.registerForAuction(auctionId, userId, depositAmount);

        res.status(201).json(result);
    } catch (error) {
        console.error("Lỗi khi đăng ký tham gia đấu giá:", error);
        res.status(400).json({
            success: false,
            message: error.message || "Đã xảy ra lỗi khi đăng ký tham gia đấu giá",
        });
    }
};

module.exports = {
    getAllAuctions,
    getAuctionById,
    createAuction,
    updateAuction,
    cancelAuction,
    getAuctionRegistrations,
    updateAuctionStatus,
    deleteAuction,
    getAuctionBids,
    placeBid,
    registerForAuction,
};
