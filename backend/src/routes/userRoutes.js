const express = require('express');
const router = express.Router();
const { getUsers, updateUser, removeUser, toggleUserStatus, getUserBidStats } = require('../controllers/userController');
const { authenticateToken } = require('../middlewares/auth');

// Lấy danh sách người dùng
router.get('/',getUsers);

// Chỉnh sửa thông tin người dùng
router.put('/:id',updateUser);

// Xóa người dùng
router.delete('/:id',removeUser);

// Toggle trạng thái người dùng
router.patch('/:id/toggle-status', toggleUserStatus);

// Lấy thống kê đặt giá của người dùng
router.get('/:userId/bid-stats', authenticateToken , getUserBidStats);

module.exports = router; 