const express = require('express');
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
  checkAuth
} = require('../controllers/auctionController');

// Lấy danh sách phiên đấu giá
router.get('/', getAllAuctions);

// Lấy chi tiết phiên đấu giá theo ID
router.get('/:id', getAuctionById);

// Lấy số lượt đăng ký của phiên đấu giá
router.get('/:id/registrations', getAuctionRegistrations);

// Lấy lịch sử đấu giá
router.get('/:id/bids', getAuctionBids);

// Tạo phiên đấu giá mới (yêu cầu xác thực)
router.post('/', checkAuth, createAuction);

// Cập nhật phiên đấu giá (yêu cầu xác thực)
router.put('/:id', checkAuth, updateAuction);

// Hủy phiên đấu giá (yêu cầu xác thực)
router.patch('/:id/cancel', checkAuth, cancelAuction);

// Đặt giá cho phiên đấu giá (yêu cầu xác thực)
router.post('/:id/bids', checkAuth, placeBid);

// Đăng ký tham gia phiên đấu giá (yêu cầu xác thực)
router.post('/:id/register', checkAuth, registerForAuction);

// Cập nhật trạng thái phiên đấu giá
router.get('/status/update', updateAuctionStatus);

// Xóa phiên đấu giá (yêu cầu xác thực)
router.delete('/:id', checkAuth, deleteAuction);

module.exports = router;
