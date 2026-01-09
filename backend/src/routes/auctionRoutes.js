const express = require("express");
const router = express.Router();
const {
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
} = require("../controllers/auctionController");
const { authenticateToken, checkRole } = require("../middlewares/auth");

// Lấy danh sách phiên đấu giá
router.get("/", getAllAuctions);

// Lấy chi tiết phiên đấu giá theo ID
router.get("/:id", getAuctionById);

// Lấy số lượng đăng ký tham gia đấu giá
router.get("/:id/registrations", getAuctionRegistrations);

// Đăng ký tham gia đấu giá
router.post("/:id/register", authenticateToken, registerForAuction);

// Tạo phiên đấu giá mới
router.post("/", createAuction);

// Cập nhật phiên đấu giá
router.put("/:id", authenticateToken, updateAuction);

// Cập nhật trạng thái phiên đấu giá (chủ yếu dành cho cronjob)
router.get("/status/update", updateAuctionStatus);

// Hủy phiên đấu giá
router.patch("/:id/cancel", authenticateToken, cancelAuction);

// Xóa phiên đấu giá
router.delete("/:id", authenticateToken, deleteAuction);

// Lấy lịch sử đấu giá
router.get("/:id/bids", getAuctionBids);

// Đặt giá cho phiên đấu giá
router.post("/:id/bids", authenticateToken, placeBid);

module.exports = router;
