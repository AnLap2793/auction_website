const express = require('express');
const router = express.Router();
const { getUsers, updateUser, removeUser, toggleUserStatus } = require('../controllers/userController');
const { authenticateToken } = require('../middlewares/auth');

// Lấy danh sách người dùng
router.get('/',getUsers);

// Chỉnh sửa thông tin người dùng
router.put('/:id',updateUser);

// Xóa người dùng
router.delete('/:id',removeUser);

// Toggle trạng thái người dùng
router.patch('/:id/toggle-status', toggleUserStatus);

module.exports = router; 