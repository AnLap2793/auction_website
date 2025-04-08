const auctionService = require('../services/auctionService');
const cron = require('node-cron');
const authMiddleware = require('../middlewares/authMiddleware');

// Middleware để kiểm tra xác thực người dùng
const checkAuth = authMiddleware.authenticate;

// Thiết lập cron job để chạy mỗi phút
cron.schedule('* * * * *', async () => {
  try {
    await auctionService.updateAuctionStatus();
    console.log('Đã cập nhật trạng thái phiên đấu giá');
  } catch (error) {
    console.error('Lỗi khi cập nhật trạng thái phiên đấu giá:', error);
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
            isAdmin: req.query.isAdmin === 'true' || false // Xác định nếu yêu cầu đến từ admin
        };
        
        const result = await auctionService.getAllAuctions(filters);
        res.json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
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
            message: error.message
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
            status: req.body.status || 'pending',
            bid_increment: req.body.bid_increment
        };
        
        const result = await auctionService.createAuction(auctionData);
        res.status(201).json(result);
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
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
            message: error.message
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
            message: error.message
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
            message: error.message
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
      message: error.message
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
      message: error.message
    });
  }
};

// Lấy lịch sử đấu giá của một phiên đấu giá
const getAuctionBids = async (req, res) => {
  try {
    const auctionId = req.params.id;
    const result = await auctionService.getAuctionBids(auctionId);
    res.json(result);
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
};

// Đặt giá cho phiên đấu giá (cần xác thực)
const placeBid = async (req, res) => {
  try {
    // Lấy thông tin user từ token (đã được xử lý bởi middleware xác thực)
    const userId = req.user.id; 
    const auctionId = req.params.id;
    const bidAmount = req.body.bid_amount;

    if (!bidAmount) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập số tiền đặt giá'
      });
    }

    const result = await auctionService.placeBid(auctionId, userId, bidAmount);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Đăng ký tham gia phiên đấu giá (cần xác thực)
const registerForAuction = async (req, res) => {
  try {
    // Lấy thông tin user từ token (đã được xử lý bởi middleware xác thực)
    const userId = req.user.id;
    const auctionId = req.params.id;

    const result = await auctionService.registerForAuction(auctionId, userId);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
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
    checkAuth // Export middleware để sử dụng trong routes
};
