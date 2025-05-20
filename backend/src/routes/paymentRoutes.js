const express = require('express');
const router = express.Router();
const PaymentController = require('../controllers/paymentController');
const { authenticateToken } = require('../middlewares/auth');

// Tạo URL thanh toán VNPay
router.post('/create-payment', authenticateToken, PaymentController.createPaymentUrl);

// Xử lý callback từ VNPay
router.get('/vnpay-return', PaymentController.handleVnPayReturn);

// Kiểm tra trạng thái giao dịch
router.get('/transaction/:transactionId', authenticateToken, PaymentController.getTransactionStatus);

module.exports = router; 