const express = require('express');
const router = express.Router();
const {
  getAllTransactions,
  getTransactionById,
  createTransaction,
  updateTransactionStatus,
  getTransactionsByAuctionId
} = require('../controllers/transactionController');

// Lấy tất cả transactions
router.get('/', getAllTransactions);

// Lấy transaction theo ID
router.get('/:id', getTransactionById);

// Tạo transaction mới
router.post('/', createTransaction);

// Cập nhật trạng thái transaction
router.patch('/:id/status', updateTransactionStatus);

// Lấy transactions theo auction_id
router.get('/auction/:auctionId', getTransactionsByAuctionId);

module.exports = router;
