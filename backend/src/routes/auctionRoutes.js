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
  deleteAuction
} = require('../controllers/auctionController');

// Lấy danh sách phiên đấu giá
router.get('/', getAllAuctions);

// Lấy chi tiết phiên đấu giá theo ID
router.get('/:id', getAuctionById);

// Lấy số lượt đăng ký của phiên đấu giá
router.get('/:id/registrations', getAuctionRegistrations);

// Tạo phiên đấu giá mới
router.post('/', createAuction);

// Cập nhật phiên đấu giá
router.put('/:id', updateAuction);

// Hủy phiên đấu giá
router.patch('/:id/cancel', cancelAuction);

// Cập nhật trạng thái phiên đấu giá
router.get('/status/update', updateAuctionStatus);

// Xóa phiên đấu giá
router.delete('/:id', deleteAuction);

module.exports = router;
